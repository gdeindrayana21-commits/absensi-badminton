import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Student,
  AttendanceRecord,
  TrainingSchedule,
  ActivityNote,
  DocumentationItem,
  SchoolIdentity
} from '../types';

export type SyncStatus = 'connecting' | 'synced' | 'syncing' | 'offline' | 'error';

// Unique client identifier for this browser session/tab to prevent echo loops
export const CLIENT_ID =
  typeof window !== 'undefined'
    ? window.sessionStorage.getItem('badminton_client_id') ||
      (() => {
        const id = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        try {
          window.sessionStorage.setItem('badminton_client_id', id);
        } catch {}
        return id;
      })()
    : 'server_env';

export const COLLECTION_NAME = 'badminton_tejakula';

export type SyncSectionKey =
  | 'students'
  | 'attendance'
  | 'schedules'
  | 'notes'
  | 'documentation'
  | 'identity';

export interface CloudSyncState {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
  isOnline: boolean;
  activeListenersCount: number;
}

type SyncListener = (state: CloudSyncState) => void;
const syncListeners = new Set<SyncListener>();

let currentSyncState: CloudSyncState = {
  status: 'connecting',
  lastSyncedAt: null,
  errorMessage: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  activeListenersCount: 0
};

const notifySyncListeners = () => {
  syncListeners.forEach((fn) => {
    try {
      fn(currentSyncState);
    } catch (e) {
      console.error('Error in sync listener:', e);
    }
  });
};

export const subscribeSyncStatus = (fn: SyncListener) => {
  syncListeners.add(fn);
  fn(currentSyncState);
  return () => {
    syncListeners.delete(fn);
  };
};

export const getSyncState = (): CloudSyncState => ({ ...currentSyncState });

export const updateSyncState = (patch: Partial<CloudSyncState>) => {
  currentSyncState = { ...currentSyncState, ...patch };
  notifySyncListeners();
};

// Monitor online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    updateSyncState({ isOnline: true, status: 'syncing' });
    enableNetwork(db).catch(() => {});
  });
  window.addEventListener('offline', () => {
    updateSyncState({ isOnline: false, status: 'offline' });
    disableNetwork(db).catch(() => {});
  });
}

// Debounce timer map for pushing updates to Firestore
const pushDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Pushes updated data for a section to Firestore.
 * Debounced so rapid typing or bulk marking doesn't flood requests.
 */
export const pushToCloud = async (key: SyncSectionKey, data: any) => {
  if (pushDebounceTimers[key]) {
    clearTimeout(pushDebounceTimers[key]);
  }

  updateSyncState({ status: 'syncing' });

  pushDebounceTimers[key] = setTimeout(async () => {
    try {
      const docRef = doc(db, COLLECTION_NAME, key);
      await setDoc(
        docRef,
        {
          data,
          updatedAt: Date.now(),
          updatedBy: CLIENT_ID
        },
        { merge: false }
      );
      updateSyncState({ status: 'synced', lastSyncedAt: new Date(), errorMessage: null });
    } catch (error: any) {
      console.error(`Failed to push ${key} to Firestore:`, error);
      updateSyncState({
        status: 'error',
        errorMessage: error?.message || 'Gagal menyinkronkan data ke Cloud'
      });
    }
  }, 350);
};

let activeUnsubscribes: Unsubscribe[] = [];

/**
 * Initialize real-time bidirectional synchronization with Firestore
 */
export const initCloudSync = (
  getLocalDataByKey: (key: SyncSectionKey) => any,
  applyRemoteData: (key: SyncSectionKey, data: any) => void
) => {
  // Clear any previous listeners
  activeUnsubscribes.forEach((unsub) => {
    try {
      unsub();
    } catch {}
  });
  activeUnsubscribes = [];

  const keys: SyncSectionKey[] = [
    'students',
    'attendance',
    'schedules',
    'notes',
    'documentation',
    'identity'
  ];

  keys.forEach((key) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, key);
      const unsub = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const remote = snapshot.data();
            // If the change came from another client (e.g., from HP while viewing on Laptop, or vice versa)
            if (remote && remote.data !== undefined) {
              if (remote.updatedBy !== CLIENT_ID) {
                applyRemoteData(key, remote.data);
              }
            }
            updateSyncState({
              status: 'synced',
              lastSyncedAt: new Date(),
              errorMessage: null
            });
          } else {
            // First time document does not exist yet in Firestore: seed it from current local data
            const localData = getLocalDataByKey(key);
            setDoc(docRef, {
              data: localData,
              updatedAt: Date.now(),
              updatedBy: CLIENT_ID
            }).catch((err) => console.warn(`Initial seed failed for ${key}:`, err));
          }
        },
        (error) => {
          console.error(`Firestore snapshot error for ${key}:`, error);
          updateSyncState({
            status: 'error',
            errorMessage: error.message || 'Gagal mendengarkan perubahan cloud'
          });
        }
      );

      activeUnsubscribes.push(unsub);
    } catch (err) {
      console.error(`Error setting up listener for ${key}:`, err);
    }
  });

  updateSyncState({
    activeListenersCount: activeUnsubscribes.length,
    status: 'synced'
  });

  return () => {
    activeUnsubscribes.forEach((u) => {
      try {
        u();
      } catch {}
    });
    activeUnsubscribes = [];
  };
};

/**
 * Force manual immediate synchronization: pulls latest documents and pushes pending
 */
export const forceSyncAll = async (
  getLocalData: () => {
    students: Student[];
    attendance: AttendanceRecord[];
    schedules: TrainingSchedule[];
    notes: ActivityNote[];
    documentation: DocumentationItem[];
    identity: SchoolIdentity;
  },
  applyRemoteData: (key: SyncSectionKey, data: any) => void
): Promise<{ success: boolean; message: string }> => {
  updateSyncState({ status: 'syncing' });
  try {
    const keys: SyncSectionKey[] = [
      'students',
      'attendance',
      'schedules',
      'notes',
      'documentation',
      'identity'
    ];
    const local = getLocalData();

    for (const key of keys) {
      const docRef = doc(db, COLLECTION_NAME, key);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const remoteData = snapshot.data();
        if (remoteData && remoteData.data !== undefined) {
          applyRemoteData(key, remoteData.data);
        }
      } else {
        // Document does not exist in Firestore yet: upload initial local data
        await setDoc(docRef, {
          data: local[key],
          updatedAt: Date.now(),
          updatedBy: CLIENT_ID
        });
      }
    }

    updateSyncState({ status: 'synced', lastSyncedAt: new Date(), errorMessage: null });
    return { success: true, message: 'Data Laptop dan HP berhasil disinkronkan dengan Cloud!' };
  } catch (error: any) {
    console.error('Force sync error:', error);
    updateSyncState({
      status: 'error',
      errorMessage: error?.message || 'Gagal menyinkronkan data.'
    });
    return { success: false, message: error?.message || 'Gagal menyinkronkan data dengan cloud.' };
  }
};

/**
 * Image compression utility for photo uploads on mobile or laptop.
 * Prevents exceeding Firestore document size limit (1MB).
 */
export const compressImageBase64 = (
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
