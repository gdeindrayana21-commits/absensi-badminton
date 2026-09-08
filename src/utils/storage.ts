import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  TrainingSchedule,
  ActivityNote,
  DocumentationItem,
  SchoolIdentity,
  DEFAULT_SCHOOL_IDENTITY,
  AttendanceSummary
} from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'badminton_tejakula_students',
  ATTENDANCE: 'badminton_tejakula_attendance',
  SCHEDULES: 'badminton_tejakula_schedules',
  ACTIVITY_NOTES: 'badminton_tejakula_notes',
  DOCUMENTATION: 'badminton_tejakula_docs',
  IDENTITY: 'badminton_tejakula_identity',
  AUTH: 'badminton_tejakula_auth'
};

// Initial Realistic Seed Data for SMA Negeri 1 Tejakula
const INITIAL_STUDENTS: Student[] = [
  { id: 'std-001', name: 'I Kadek Arya Wiratama', grade: 'X.1', status: 'Aktif', gender: 'L', phone: '081234567890', joinedAt: '2026-07-15' },
  { id: 'std-002', name: 'Ni Putu Ayu Saraswati', grade: 'X.1', status: 'Aktif', gender: 'P', phone: '081234567891', joinedAt: '2026-07-15' },
  { id: 'std-003', name: 'I Made Dwi Pranata', grade: 'X.2', status: 'Aktif', gender: 'L', phone: '081234567892', joinedAt: '2026-07-16' },
  { id: 'std-004', name: 'I Gede Bayu Mahendra', grade: 'X.3', status: 'Aktif', gender: 'L', phone: '081234567893', joinedAt: '2026-07-16' },
  { id: 'std-005', name: 'Ni Made Citra Dewi', grade: 'X.4', status: 'Aktif', gender: 'P', phone: '081234567894', joinedAt: '2026-07-17' },
  { id: 'std-006', name: 'I Wayan Danu Tirta', grade: 'X.5', status: 'Aktif', gender: 'L', phone: '081234567895', joinedAt: '2026-07-18' },
  { id: 'std-007', name: 'I Nyoman Eka Putra', grade: 'X.6', status: 'Aktif', gender: 'L', phone: '081234567896', joinedAt: '2026-07-18' },
  { id: 'std-008', name: 'Ni Komang Febriyanti', grade: 'X.7', status: 'Aktif', gender: 'P', phone: '081234567897', joinedAt: '2026-07-19' },
  { id: 'std-009', name: 'I Ketut Gilang Raditya', grade: 'X.8', status: 'Aktif', gender: 'L', phone: '081234567898', joinedAt: '2026-07-20' },
  { id: 'std-010', name: 'I Komang Hendra Suputra', grade: 'XI. 1', status: 'Aktif', gender: 'L', phone: '081234567899', joinedAt: '2025-07-15' },
  { id: 'std-011', name: 'Ni Luh Indah Permata', grade: 'XI. 2', status: 'Aktif', gender: 'P', phone: '081234567801', joinedAt: '2025-07-15' },
  { id: 'std-012', name: 'I Kadek Joni Artha', grade: 'XI. 3', status: 'Aktif', gender: 'L', phone: '081234567802', joinedAt: '2025-07-16' },
  { id: 'std-013', name: 'I Putu Krisna Aditya', grade: 'XI. 4', status: 'Aktif', gender: 'L', phone: '081234567803', joinedAt: '2025-07-17' },
  { id: 'std-014', name: 'Ni Kadek Lestari Dewi', grade: 'XI. 5', status: 'Aktif', gender: 'P', phone: '081234567804', joinedAt: '2025-07-18' },
  { id: 'std-015', name: 'I Gede Mangku Putra', grade: 'XI. 6', status: 'Aktif', gender: 'L', phone: '081234567805', joinedAt: '2025-07-19' },
  { id: 'std-016', name: 'I Wayan Nanda Satria', grade: 'XI. 7', status: 'Aktif', gender: 'L', phone: '081234567806', joinedAt: '2025-07-20' },
  { id: 'std-017', name: 'Ni Wayan Oktaviani', grade: 'XI. 8', status: 'Aktif', gender: 'P', phone: '081234567807', joinedAt: '2025-07-21' },
  { id: 'std-018', name: 'I Ketut Pandu Wiguna', grade: 'XI. 9', status: 'Aktif', gender: 'L', phone: '081234567808', joinedAt: '2025-07-22' },
  { id: 'std-019', name: 'I Made Rama Wijaya', grade: 'XII. 1', status: 'Aktif', gender: 'L', phone: '081234567809', joinedAt: '2024-07-15' },
  { id: 'std-020', name: 'Ni Made Sintya Maharani', grade: 'XII. 2', status: 'Aktif', gender: 'P', phone: '081234567810', joinedAt: '2024-07-15' },
  { id: 'std-021', name: 'I Putu Teguh Santoso', grade: 'XII. 3', status: 'Aktif', gender: 'L', phone: '081234567811', joinedAt: '2024-07-16' },
  { id: 'std-022', name: 'Ni Komang Utami Putri', grade: 'XII. 4', status: 'Aktif', gender: 'P', phone: '081234567812', joinedAt: '2024-07-17' },
  { id: 'std-023', name: 'I Kadek Yoga Pratama', grade: 'XII. 5', status: 'Aktif', gender: 'L', phone: '081234567813', joinedAt: '2024-07-18' },
  { id: 'std-024', name: 'I Nyoman Zaki Aditya', grade: 'XII. 6', status: 'Aktif', gender: 'L', phone: '081234567814', joinedAt: '2024-07-19' },
  { id: 'std-025', name: 'Ni Luh Ayu Wardani', grade: 'XII. 7', status: 'Aktif', gender: 'P', phone: '081234567815', joinedAt: '2024-07-20' },
  { id: 'std-026', name: 'I Gede Dimas Wardana', grade: 'X.1', status: 'Aktif', gender: 'L', phone: '081234567816', joinedAt: '2026-07-21' },
  { id: 'std-027', name: 'Ni Putu Gita Savitri', grade: 'X.2', status: 'Aktif', gender: 'P', phone: '081234567817', joinedAt: '2026-07-22' },
  { id: 'std-028', name: 'I Wayan Ilham Pratama', grade: 'XI. 1', status: 'Aktif', gender: 'L', phone: '081234567818', joinedAt: '2025-07-23' }
];

const INITIAL_SCHEDULES: TrainingSchedule[] = [
  {
    id: 'sch-001',
    date: '2026-08-15',
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: 'Grip & Footwork Dasar, Pengenalan Lapangan',
    notes: 'Latihan perdana semester ganjil, pemanasan fisik dan pemetaan kelompok kemampuan.',
    status: 'Selesai'
  },
  {
    id: 'sch-002',
    date: '2026-08-22',
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: 'Servis Pendek, Servis Panjang & Pukulan Lob',
    notes: 'Fokus akurasi servis tipis net dan overhead clear sudut belakang.',
    status: 'Selesai'
  },
  {
    id: 'sch-003',
    date: '2026-08-29',
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: 'Pukulan Dropshot & Netting Tipis',
    notes: 'Kombinasi drop potong dan penempatan shuttlecock di bibir net.',
    status: 'Selesai'
  },
  {
    id: 'sch-004',
    date: '2026-09-05',
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: 'Pukulan Smash (Jumping & Standing) & Drive Cepat',
    notes: 'Latihan intensitas power smash dan pertahanan defence return drive.',
    status: 'Terjadwal'
  },
  {
    id: 'sch-005',
    date: '2026-09-12',
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: 'Simulasi Permainan Ganda (Rotasi & Formasi)',
    notes: 'Strategi ganda putra, ganda putri, dan ganda campuran.',
    status: 'Terjadwal'
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Session 1: 2026-08-15
  ...INITIAL_STUDENTS.map((std, idx) => ({
    id: `att-20260815-${std.id}`,
    date: '2026-08-15',
    day: 'Sabtu',
    studentId: std.id,
    studentName: std.name,
    grade: std.grade,
    studentGrade: std.grade,
    status: (idx === 7 ? 'Ijin' : idx === 18 ? 'Alpa' : 'Hadir') as AttendanceStatus,
    startTime: '07:30',
    endTime: '09:00',
    material: 'Grip & Footwork Dasar, Pengenalan Lapangan',
    notes: idx === 7 ? 'Ijin upacara adat' : '',
    teacherName: DEFAULT_SCHOOL_IDENTITY.teacherName,
    teacherNip: DEFAULT_SCHOOL_IDENTITY.teacherNip,
    timestamp: '2026-08-15T07:35:00.000Z'
  })),
  // Session 2: 2026-08-22
  ...INITIAL_STUDENTS.map((std, idx) => ({
    id: `att-20260822-${std.id}`,
    date: '2026-08-22',
    day: 'Sabtu',
    studentId: std.id,
    studentName: std.name,
    grade: std.grade,
    studentGrade: std.grade,
    status: (idx === 4 ? 'Ijin' : idx === 18 ? 'Alpa' : idx === 23 ? 'Alpa' : 'Hadir') as AttendanceStatus,
    startTime: '07:30',
    endTime: '09:00',
    material: 'Servis Pendek, Servis Panjang & Pukulan Lob',
    notes: idx === 4 ? 'Sakit demam' : '',
    teacherName: DEFAULT_SCHOOL_IDENTITY.teacherName,
    teacherNip: DEFAULT_SCHOOL_IDENTITY.teacherNip,
    timestamp: '2026-08-22T07:35:00.000Z'
  })),
  // Session 3: 2026-08-29
  ...INITIAL_STUDENTS.map((std, idx) => ({
    id: `att-20260829-${std.id}`,
    date: '2026-08-29',
    day: 'Sabtu',
    studentId: std.id,
    studentName: std.name,
    grade: std.grade,
    studentGrade: std.grade,
    status: (idx === 18 ? 'Alpa' : idx === 2 ? 'Ijin' : idx === 23 ? 'Alpa' : 'Hadir') as AttendanceStatus,
    startTime: '07:30',
    endTime: '09:00',
    material: 'Pukulan Dropshot & Netting Tipis',
    notes: idx === 2 ? 'Dispensasi OSIS' : '',
    teacherName: DEFAULT_SCHOOL_IDENTITY.teacherName,
    teacherNip: DEFAULT_SCHOOL_IDENTITY.teacherNip,
    timestamp: '2026-08-29T07:35:00.000Z'
  }))
];

const INITIAL_ACTIVITY_NOTES: ActivityNote[] = [
  {
    id: 'note-001',
    date: '2026-08-15',
    material: 'Grip & Footwork Dasar, Pengenalan Lapangan',
    participantCondition: 'Peserta sangat bersemangat mengikuti latihan perdana dengan kondisi fisik prima.',
    goodPoints: 'Siswa kelas X cepat menguasai cara pegangan forehand dan backhand standar.',
    obstacles: 'Beberapa siswa kelas X masih sering salah langkah saat mundur ke baseline (backstep).',
    followUp: 'Berikan latihan kelincahan agility ladder di 15 menit awal latihan minggu depan.',
    teacherNotes: 'Pertahankan kedisiplinan waktu kedatangan. Siswa membawa raket dan sepatu standar.',
    timestamp: '2026-08-15T17:40:00.000Z'
  },
  {
    id: 'note-002',
    date: '2026-08-22',
    material: 'Servis Pendek, Servis Panjang & Pukulan Lob',
    participantCondition: 'Fisik siswa stabil, cuaca di GOR sekolah mendukung tanpa angin kencang.',
    goodPoints: 'Akurasi servis pendek tipis net meningkat signifikan hingga 85%.',
    obstacles: 'Pukulan lob overhead dari sudut kiri baseline masih kurang tinggi dan dalam.',
    followUp: 'Tambahkan drill servis 50 shuttlecock per pasang pemain.',
    teacherNotes: 'Siswa yang alpa perlu dikonfirmasi wali kelas dan pembina OSIS.',
    timestamp: '2026-08-22T17:45:00.000Z'
  },
  {
    id: 'note-003',
    date: '2026-08-29',
    material: 'Pukulan Dropshot & Netting Tipis',
    participantCondition: 'Konsentrasi peserta tinggi, teknik netting silang mulai dipraktekkan dengan baik.',
    goodPoints: 'Variasi dropshot lambat dan cepat mulai mengecoh lawan tanding.',
    obstacles: 'Pergelangan tangan beberapa pemain putri masih terlalu kaku saat menyentuh shuttlecock di net.',
    followUp: 'Pemanasan sendi pergelangan tangan (wrist flick exercise) lebih intensif.',
    teacherNotes: 'Persiapkan regu inti untuk seleksi turnamen antar SMA se-Buleleng.',
    timestamp: '2026-08-29T17:40:00.000Z'
  }
];

const INITIAL_DOCUMENTATION: DocumentationItem[] = [
  {
    id: 'doc-001',
    date: '2026-08-15',
    title: 'Drill Footwork & Pemanasan Lapangan',
    material: 'Footwork Dasar & Grip',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    description: 'Siswa mempraktikkan langkah 6 sudut lapangan badminton bersama Guru Pembina Gde Bayu Indrayana, S.Pd.',
    timestamp: '2026-08-15T16:30:00.000Z'
  },
  {
    id: 'doc-002',
    date: '2026-08-22',
    title: 'Praktek Akurasi Servis & Overhead Clear',
    material: 'Servis Pendek & Lob',
    imageUrl: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80',
    description: 'Drill penempatan shuttlecock pada garis sudut belakang lapangan bulutangkis SMAN 1 Tejakula.',
    timestamp: '2026-08-22T16:45:00.000Z'
  },
  {
    id: 'doc-003',
    date: '2026-08-29',
    title: 'Simulasi Netting Tipis & Match Mini',
    material: 'Dropshot & Netting',
    imageUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80',
    description: 'Pertandingan game simulasi ganda putra dan evaluasi rotasi lapangan.',
    timestamp: '2026-08-29T17:00:00.000Z'
  }
];

// Listeners for multi-component reactivity & cross-tab real-time sync
type Listener = () => void;
const listeners: Set<Listener> = new Set();

// BroadcastChannel for instant cross-tab real-time sync across devices / browser tabs
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('badminton_realtime_sync');
    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'STORAGE_UPDATED') {
        listeners.forEach((fn) => {
          try {
            fn();
          } catch (e) {
            console.error('Cross-tab broadcast listener error:', e);
          }
        });
      }
    };
  }
} catch (err) {
  console.warn('BroadcastChannel not supported or error:', err);
}

// Window Storage event for cross-tab sync compatibility in older browsers
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      listeners.forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.error('Storage event listener error:', err);
        }
      });
    }
  });
}

export const subscribeStorage = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const subscribeToStorage = subscribeStorage;

const notifySubscribers = () => {
  // 1. Notify local in-memory subscribers synchronously
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Storage subscriber error:', e);
    }
  });

  // 2. Broadcast to other tabs/windows in real time
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'STORAGE_UPDATED', timestamp: Date.now() });
    } catch (e) {
      console.warn('BroadcastChannel message error:', e);
    }
  }

  // 3. Dispatch window CustomEvent for components listening within the same tab
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('badminton_data_changed', { detail: { timestamp: Date.now() } }));
    } catch {}
  }
};

// Safe LocalStorage Handlers
export const getStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.map((s: any) => {
        const { absenNo, ...rest } = s;
        return rest as Student;
      });
    }
    return INITIAL_STUDENTS;
  } catch (e) {
    console.error('Error reading students:', e);
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students || []));
  notifySubscribers();
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
      return INITIAL_ATTENDANCE;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.map((a: any) => {
        const { absenNo, studentAbsenNo, ...rest } = a;
        return rest as AttendanceRecord;
      });
    }
    return INITIAL_ATTENDANCE;
  } catch (e) {
    console.error('Error reading attendance:', e);
    return INITIAL_ATTENDANCE;
  }
};

export const saveAttendanceRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records || []));
  notifySubscribers();
};

export const getSchedules = (): TrainingSchedule[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
      return INITIAL_SCHEDULES;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_SCHEDULES;
  } catch (e) {
    console.error('Error reading schedules:', e);
    return INITIAL_SCHEDULES;
  }
};

export const saveSchedules = (schedules: TrainingSchedule[]) => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules || []));
  notifySubscribers();
};

export const getActivityNotes = (): ActivityNote[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_NOTES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_NOTES, JSON.stringify(INITIAL_ACTIVITY_NOTES));
      return INITIAL_ACTIVITY_NOTES;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITY_NOTES;
  } catch (e) {
    console.error('Error reading activity notes:', e);
    return INITIAL_ACTIVITY_NOTES;
  }
};

export const saveActivityNotes = (notes: ActivityNote[]) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_NOTES, JSON.stringify(notes || []));
  notifySubscribers();
};

export const getDocumentation = (): DocumentationItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTATION);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTATION, JSON.stringify(INITIAL_DOCUMENTATION));
      return INITIAL_DOCUMENTATION;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_DOCUMENTATION;
  } catch (e) {
    console.error('Error reading documentation:', e);
    return INITIAL_DOCUMENTATION;
  }
};

export const saveDocumentation = (docs: DocumentationItem[]) => {
  localStorage.setItem(STORAGE_KEYS.DOCUMENTATION, JSON.stringify(docs || []));
  notifySubscribers();
};

export const getSchoolIdentity = (): SchoolIdentity => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.IDENTITY);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(DEFAULT_SCHOOL_IDENTITY));
      return DEFAULT_SCHOOL_IDENTITY;
    }
    const parsed = JSON.parse(data);
    // If old default 15:00 - 17:30 is still saved, update to 07:30 - 09:00
    if (parsed.defaultTime === '15:00 - 17:30 WITA' || !parsed.defaultTime) {
      parsed.defaultTime = '07:30 - 09:00 WITA';
      localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify({ ...DEFAULT_SCHOOL_IDENTITY, ...parsed }));
    }
    return { ...DEFAULT_SCHOOL_IDENTITY, ...parsed };
  } catch (e) {
    console.error('Error reading school identity:', e);
    return DEFAULT_SCHOOL_IDENTITY;
  }
};
export const getIdentity = getSchoolIdentity;

export const saveSchoolIdentity = (identity: SchoolIdentity) => {
  localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(identity));
  notifySubscribers();
};
export const saveIdentity = saveSchoolIdentity;

// CRUD Student Helpers
export const addStudent = (student: Omit<Student, 'id' | 'joinedAt'>): { success: boolean; message: string; student?: Student } => {
  const students = getStudents();
  const exists = students.some(
    (s) => s.name.trim().toLowerCase() === student.name.trim().toLowerCase() && s.grade === student.grade
  );
  if (exists) {
    return { success: false, message: 'Data peserta dengan nama dan kelas tersebut sudah tersedia.' };
  }

  const newStudent: Student = {
    ...student,
    id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    joinedAt: new Date().toISOString().split('T')[0]
  };

  students.push(newStudent);
  saveStudents(students);
  return { success: true, message: 'Data peserta berhasil ditambahkan.', student: newStudent };
};

export const updateStudent = (id: string, updated: Partial<Student>): { success: boolean; message: string } => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, message: 'Peserta tidak ditemukan.' };
  }
  students[index] = { ...students[index], ...updated };
  saveStudents(students);
  return { success: true, message: 'Data peserta berhasil diperbarui.' };
};

export const deleteStudent = (id: string): { success: boolean; message: string } => {
  const students = getStudents();
  const filtered = students.filter((s) => s.id !== id);
  saveStudents(filtered);
  const attendance = getAttendanceRecords().filter((a) => a.studentId !== id);
  saveAttendanceRecords(attendance);
  return { success: true, message: 'Data peserta berhasil dihapus.' };
};

// Delete All Students (Hapus Semua Peserta)
export const deleteAllStudents = (deleteAttendanceHistory: boolean = true): { success: boolean; message: string; count: number } => {
  const students = getStudents();
  const count = students.length;
  saveStudents([]);
  if (deleteAttendanceHistory) {
    saveAttendanceRecords([]);
  }
  return {
    success: true,
    message: `Semua data peserta (${count} siswa) berhasil dihapus.${deleteAttendanceHistory ? ' Riwayat absensi juga telah dibersihkan.' : ''}`,
    count
  };
};

// Delete All Attendance for a specific Date
export const deleteAttendanceDate = (date: string): { success: boolean; message: string } => {
  const records = getAttendanceRecords();
  const filtered = records.filter((r) => r.date !== date);
  saveAttendanceRecords(filtered);
  return { success: true, message: `Absensi tanggal ${date} berhasil dihapus.` };
};

// Autosave & Real-time Record Attendance
export const setStudentAttendance = (
  date: string,
  day: string,
  student: Student,
  status: AttendanceStatus,
  startTime: string,
  endTime: string,
  material: string,
  notes?: string
): { success: boolean; message: string; record: AttendanceRecord } => {
  const records = getAttendanceRecords();
  const identity = getSchoolIdentity();
  const index = records.findIndex((r) => r.date === date && r.studentId === student.id);

  let record: AttendanceRecord;
  const now = new Date().toISOString();

  if (index >= 0) {
    record = {
      ...records[index],
      status,
      day,
      studentGrade: student.grade,
      startTime: startTime || records[index].startTime,
      endTime: endTime || records[index].endTime,
      material: material || records[index].material,
      notes: notes !== undefined ? notes : records[index].notes,
      updatedAt: now
    };
    records[index] = record;
  } else {
    record = {
      id: `att-${date.replace(/-/g, '')}-${student.id}`,
      date,
      day,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      studentGrade: student.grade,
      status,
      startTime: startTime || '07:30',
      endTime: endTime || '09:00',
      material: material || 'Latihan Rutin Bulutangkis',
      notes: notes || '',
      teacherName: identity.teacherName,
      teacherNip: identity.teacherNip,
      timestamp: now
    };
    records.push(record);
  }

  saveAttendanceRecords(records);
  return { success: true, message: 'Absensi tersimpan', record };
};

// Bulk Save Attendance for a Date (Optimized Atomic Real-Time Batch)
export const saveBulkAttendance = (
  date: string,
  day: string,
  attendanceMap: Record<string, AttendanceStatus>,
  startTime: string,
  endTime: string,
  material: string,
  notes?: string
): { total: number; hadir: number; ijin: number; alpa: number; percentage: number } => {
  const students = getStudents();
  const identity = getIdentity();
  const records = getAttendanceRecords();
  const now = new Date().toISOString();

  let hadir = 0;
  let ijin = 0;
  let alpa = 0;

  students.forEach((student) => {
    const status = attendanceMap[student.id] || 'Alpa';
    if (status === 'Hadir') hadir++;
    else if (status === 'Ijin') ijin++;
    else if (status === 'Alpa') alpa++;

    const index = records.findIndex((r) => r.date === date && r.studentId === student.id);
    if (index >= 0) {
      records[index] = {
        ...records[index],
        status,
        day,
        studentGrade: student.grade,
        startTime: startTime || records[index].startTime || '07:30',
        endTime: endTime || records[index].endTime || '09:00',
        material: material || records[index].material || 'Latihan Rutin Bulutangkis',
        notes: notes !== undefined ? notes : records[index].notes,
        updatedAt: now
      };
    } else {
      records.push({
        id: `att-${date.replace(/-/g, '')}-${student.id}`,
        date,
        day,
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        studentGrade: student.grade,
        status,
        startTime: startTime || '07:30',
        endTime: endTime || '09:00',
        material: material || 'Latihan Rutin Bulutangkis',
        notes: notes || '',
        teacherName: identity.teacherName,
        teacherNip: identity.teacherNip,
        timestamp: now
      });
    }
  });

  saveAttendanceRecords(records);

  const total = students.length;
  const percentage = total > 0 ? Number(((hadir / total) * 100).toFixed(2)) : 0;

  return { total, hadir, ijin, alpa, percentage };
};

// Calculate Summaries & Rankings
export const calculateAttendanceSummaries = (filterGrade?: string): AttendanceSummary[] => {
  const students = getStudents();
  const records = getAttendanceRecords();

  const distinctDates = Array.from(new Set(records.map((r) => r.date)));
  const totalMeetings = distinctDates.length;

  const summaries: AttendanceSummary[] = students
    .filter((s) => !filterGrade || s.grade === filterGrade)
    .map((student) => {
      const studentRecords = records.filter((r) => r.studentId === student.id);
      const hadir = studentRecords.filter((r) => r.status === 'Hadir').length;
      const ijin = studentRecords.filter((r) => r.status === 'Ijin').length;
      const alpa = studentRecords.filter((r) => r.status === 'Alpa').length;
      
      const attendedMeetings = studentRecords.length;
      const effectiveMeetings = totalMeetings > 0 ? totalMeetings : attendedMeetings;
      const percentage = effectiveMeetings > 0 ? Number(((hadir / effectiveMeetings) * 100).toFixed(1)) : 0;

      let rankBadge: AttendanceSummary['rankBadge'] = 'Aktif';
      let rankCategory: AttendanceSummary['rankCategory'] = 'normal';

      if (percentage >= 95) {
        rankBadge = 'Sangat Aktif';
        rankCategory = 'gold';
      } else if (percentage >= 80) {
        rankBadge = 'Aktif';
        rankCategory = 'silver';
      } else if (alpa >= 4 || percentage < 60) {
        rankBadge = 'Prioritas Pembinaan';
        rankCategory = 'danger';
      } else if (alpa >= 3 || percentage < 75) {
        rankBadge = 'Perlu Perhatian';
        rankCategory = 'warning';
      }

      return {
        studentId: student.id,
        name: student.name,
        grade: student.grade,
        status: student.status,
        hadir,
        ijin,
        alpa,
        totalMeetings: effectiveMeetings,
        percentage,
        rankBadge,
        rankCategory
      };
    });

  return summaries.sort((a, b) => b.percentage - a.percentage || b.hadir - a.hadir || a.name.localeCompare(b.name));
};

// Full Backup & Restore
export const getFullBackupData = () => {
  return {
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    schoolIdentity: getSchoolIdentity(),
    students: getStudents(),
    attendanceRecords: getAttendanceRecords(),
    schedules: getSchedules(),
    activityNotes: getActivityNotes(),
    documentation: getDocumentation()
  };
};

export const exportFullBackupJson = () => {
  const data = getFullBackupData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup_Database_Bulutangkis_SMAN1Tejakula_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const restoreFullBackupData = (backupJson: any): { success: boolean; message: string; counts?: any } => {
  try {
    if (!backupJson || typeof backupJson !== 'object') {
      return { success: false, message: 'Format file backup tidak valid.' };
    }

    if (Array.isArray(backupJson.students)) {
      saveStudents(backupJson.students);
    }
    if (Array.isArray(backupJson.attendanceRecords)) {
      saveAttendanceRecords(backupJson.attendanceRecords);
    }
    if (Array.isArray(backupJson.schedules)) {
      saveSchedules(backupJson.schedules);
    }
    if (Array.isArray(backupJson.activityNotes)) {
      saveActivityNotes(backupJson.activityNotes);
    }
    if (Array.isArray(backupJson.documentation)) {
      saveDocumentation(backupJson.documentation);
    }
    if (backupJson.schoolIdentity) {
      saveSchoolIdentity(backupJson.schoolIdentity);
    }

    return {
      success: true,
      message: 'Data backup berhasil dipulihkan secara penuh!',
      counts: {
        students: backupJson.students?.length || 0,
        attendance: backupJson.attendanceRecords?.length || 0,
        schedules: backupJson.schedules?.length || 0,
        notes: backupJson.activityNotes?.length || 0,
        docs: backupJson.documentation?.length || 0
      }
    };
  } catch (e: any) {
    return { success: false, message: `Gagal memulihkan backup: ${e.message}` };
  }
};

export const importBackupJson = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return restoreFullBackupData(parsed);
  } catch (err: any) {
    return { success: false, message: `Format JSON tidak valid: ${err.message}` };
  }
};

export const resetToInitialDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_NOTES, JSON.stringify(INITIAL_ACTIVITY_NOTES));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTATION, JSON.stringify(INITIAL_DOCUMENTATION));
  localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(DEFAULT_SCHOOL_IDENTITY));
  notifySubscribers();
};
export const resetToInitialData = resetToInitialDemoData;
