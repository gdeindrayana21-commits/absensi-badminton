import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  TrainingSchedule,
  ActivityNote,
  DocumentationItem,
  SchoolIdentity,
  UserAccount
} from './types';
import {
  getStudents,
  getAttendanceRecords,
  getSchedules,
  getActivityNotes,
  getDocumentation,
  getIdentity,
  subscribeToStorage
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { AttendanceDaily } from './components/AttendanceDaily';
import { AttendanceQuickMobile } from './components/AttendanceQuickMobile';
import { ScheduleManagement } from './components/ScheduleManagement';
import { ActivityNotes } from './components/ActivityNotes';
import { DocumentationGallery } from './components/DocumentationGallery';
import { AttendanceRecap } from './components/AttendanceRecap';
import { AttendanceHistory } from './components/AttendanceHistory';
import { SettingsPage } from './components/SettingsPage';
import { StudentProfileModal } from './components/StudentProfileModal';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Default true
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Modal Student Profile State
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

  // Application Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [activityNotes, setActivityNotes] = useState<ActivityNote[]>([]);
  const [documentation, setDocumentation] = useState<DocumentationItem[]>([]);
  const [identity, setIdentity] = useState<SchoolIdentity>(getIdentity());

  const currentUser: UserAccount = {
    username: 'bayu_indrayana',
    name: identity.teacherName,
    role: 'guru_pembina',
    nip: identity.teacherNip
  };

  // Load all initial data & subscribe to real-time updates
  const loadAllData = () => {
    setStudents(getStudents());
    setAttendanceRecords(getAttendanceRecords());
    setSchedules(getSchedules());
    setActivityNotes(getActivityNotes());
    setDocumentation(getDocumentation());
    setIdentity(getIdentity());
  };

  useEffect(() => {
    loadAllData();
    const unsubscribe = subscribeToStorage(() => {
      loadAllData();
    });
    return () => unsubscribe();
  }, []);

  // Listen for Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Toast Notification Container */}
      <Toast />

      {/* Top Professional Header Navbar */}
      <Navbar
        identity={identity}
        user={isLoggedIn ? currentUser : null}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onLogout={handleLogout}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              attendanceRecords={attendanceRecords}
              schedules={schedules}
              identity={identity}
              onNavigate={handleNavigate}
              onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement
              students={students}
              onSelectStudentProfile={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceDaily
              students={students}
              attendanceRecords={attendanceRecords}
              identity={identity}
              onNavigateToQuick={() => handleNavigate('quick-absent')}
            />
          )}

          {(activeTab === 'quick-absent' || activeTab === 'quick') && (
            <AttendanceQuickMobile
              students={students}
              attendanceRecords={attendanceRecords}
              onSwitchToTable={() => handleNavigate('attendance')}
            />
          )}

          {activeTab === 'schedules' && (
            <ScheduleManagement
              schedules={schedules}
              onNavigateToAttendance={(date) => {
                handleNavigate('attendance');
              }}
            />
          )}

          {(activeTab === 'activities' || activeTab === 'notes') && (
            <ActivityNotes
              activityNotes={activityNotes}
              identity={identity}
            />
          )}

          {(activeTab === 'documentation' || activeTab === 'docs') && (
            <DocumentationGallery
              documentation={documentation}
            />
          )}

          {(activeTab === 'recap' || activeTab === 'export') && (
            <AttendanceRecap
              students={students}
              attendanceRecords={attendanceRecords}
              identity={identity}
              onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {activeTab === 'history' && (
            <AttendanceHistory
              attendanceRecords={attendanceRecords}
              students={students}
              identity={identity}
              onNavigateToAttendance={(date) => {
                handleNavigate('attendance');
              }}
            />
          )}

          {(activeTab === 'settings' || activeTab === 'backup') && (
            <SettingsPage
              identity={identity}
              onIdentityUpdate={(newId) => setIdentity(newId)}
            />
          )}
        </main>
      </div>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">
          {identity.schoolName} — Sistem Informasi Absensi Ekstrakurikuler Bulutangkis
        </p>
        <p className="text-[11px] text-slate-600">
          Guru Pembina: {identity.teacherName} (NIPPPK: {identity.nipppk || identity.teacherNip}) • Slogan: “{identity.slogan}”
        </p>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          identity={identity}
          onSuccess={() => {
            setIsLoggedIn(true);
            setIsLoginModalOpen(false);
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Student Individual Profile Modal */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          attendanceRecords={attendanceRecords}
          identity={identity}
          onClose={() => setSelectedStudentForProfile(null)}
        />
      )}
    </div>
  );
}
