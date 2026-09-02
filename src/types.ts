export type AttendanceStatus = 'Hadir' | 'Ijin' | 'Alpa';
export type StudentStatus = 'Aktif' | 'Tidak Aktif';

export interface Student {
  id: string;
  name: string;
  grade: string; // e.g. 'X.1', 'XI.2', 'XII.3'
  absenNo: number;
  status: StudentStatus;
  gender?: 'L' | 'P';
  phone?: string;
  joinedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // Senin, Selasa, Rabu, etc.
  studentId: string;
  studentName: string;
  grade: string;
  absenNo: number;
  studentGrade?: string;
  studentAbsenNo?: number;
  status: AttendanceStatus;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  material: string;
  notes?: string;
  teacherName?: string;
  teacherNip?: string;
  timestamp: string; // ISO string
  updatedAt?: string;
}

export interface TrainingSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  day: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  material: string;
  notes: string;
  status?: 'Terjadwal' | 'Selesai' | 'Dibatalkan';
}

export interface ActivityNote {
  id: string;
  date: string;
  material: string;
  participantCondition: string;
  goodPoints: string;
  obstacles: string;
  followUp: string;
  teacherNotes: string;
  timestamp: string;
}

export interface DocumentationItem {
  id: string;
  date: string;
  title: string;
  material: string;
  imageUrl: string;
  description: string;
  timestamp: string;
}

export interface SchoolIdentity {
  schoolName: string;
  appTitle: string;
  slogan: string;
  teacherName: string;
  teacherNip: string;
  nipppk: string;
  academicYear: string;
  semester: string;
  headmasterName: string;
  headmasterNip: string;
  locationCity: string;
  defaultLocation?: string;
  defaultSchedule?: string;
  defaultTime?: string;
  adminPassword?: string;
  teacherPhoto?: string;
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'admin' | 'guru_pembina';
  nip: string;
}

export interface AttendanceSummary {
  studentId: string;
  name: string;
  grade: string;
  absenNo: number;
  status: StudentStatus;
  hadir: number;
  ijin: number;
  alpa: number;
  totalMeetings: number;
  percentage: number;
  rankBadge: 'Sangat Aktif' | 'Aktif' | 'Perlu Perhatian' | 'Prioritas Pembinaan';
  rankCategory: 'gold' | 'silver' | 'bronze' | 'normal' | 'warning' | 'danger';
}

export interface AttendanceSummaryRow {
  student: Student;
  hadir: number;
  ijin: number;
  alpa: number;
  total: number;
  percentage: number;
  predicate: string;
}

export const CLASS_OPTIONS = [
  'X.1', 'X.2', 'X.3', 'X.4', 'X.5', 'X.6', 'X.7', 'X.8',
  'XI. 1', 'XI. 2', 'XI. 3', 'XI. 4', 'XI. 5', 'XI. 6', 'XI. 7', 'XI. 8', 'XI. 9',
  'XII. 1', 'XII. 2', 'XII. 3', 'XII. 4', 'XII. 5', 'XII. 6', 'XII. 7'
];

export const BADMINTON_MATERIALS = [
  'Grip & Cara Memegang Raket (Forehand / Backhand)',
  'Sikap Siap (Ready Stance) & Footwork Dasar',
  'Footwork Maju Mundur & Samping',
  'Servis Pendek & Servis Panjang (Forehand & Backhand)',
  'Pukulan Lob / Clear (Serang & Bertahan)',
  'Pukulan Dropshot (Slow & Fast Dropshot)',
  'Pukulan Smash (Jumping Smash & Standing Smash)',
  'Pukulan Drive Cepat & Silang',
  'Permainan Netting Tipis & Net Kill',
  'Simulasi Permainan Tunggal (Single Strategy)',
  'Simulasi Permainan Ganda (Rotasi & Formasi)',
  'Fisik, Kelincahan (Agility Ladder) & Daya Tahan',
  'Evaluasi Taktik, Penempatan Bola & Mental Bertanding'
];

export const DEFAULT_SCHOOL_IDENTITY: SchoolIdentity = {
  schoolName: 'SMA NEGERI 1 TEJAKULA',
  appTitle: 'ABSENSI EKSTRAKURIKULER BULUTANGKIS / BADMINTON',
  slogan: 'Cerdas, Berkarakter, Berjiwa Pancasila',
  teacherName: 'Gde Bayu Indrayana, S.Pd.',
  teacherNip: '198801222022211011',
  nipppk: '198801222022211011',
  academicYear: '2026/2027',
  semester: 'Ganjil',
  headmasterName: 'Drs. I Ketut Sumarta, M.Pd.',
  headmasterNip: '196805141994031008',
  locationCity: 'Tejakula, Buleleng, Bali',
  defaultLocation: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
  defaultSchedule: 'Setiap Hari Sabtu',
  defaultTime: '07:30 - 09:00 WITA',
  adminPassword: 'admin'
};
