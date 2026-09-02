import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Student, CLASS_OPTIONS, AttendanceRecord } from '../types';
import {
  addStudent,
  updateStudent,
  deleteStudent,
  deleteAllStudents,
  getAttendanceRecords
} from '../utils/storage';
import {
  downloadStudentTemplateExcel,
  exportStudentListExcel
} from '../utils/exportUtils';
import {
  Plus,
  Search,
  Upload,
  Download,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { showToast } from './Toast';

interface StudentManagementProps {
  students?: Student[];
  onSelectStudentProfile: (student: Student) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students = [],
  onSelectStudentProfile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAttendanceToo, setDeleteAttendanceToo] = useState(true);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    grade: string;
    absenNo: number;
    status: 'Aktif' | 'Tidak Aktif';
    gender?: 'L' | 'P';
    phone?: string;
  }>({
    name: '',
    grade: 'X.1',
    absenNo: 1,
    status: 'Aktif',
    gender: 'L',
    phone: ''
  });

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Excel Import States
  const [importedRows, setImportedRows] = useState<Array<{ name: string; grade: string; absenNo: number; isDuplicate: boolean }>>([]);
  const [importFileName, setImportFileName] = useState('');

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.absenNo.toString().includes(searchTerm);
      const matchGrade = !selectedGrade || s.grade === selectedGrade;
      const matchStatus = !selectedStatus || s.status === selectedStatus;
      return matchSearch && matchGrade && matchStatus;
    });
  }, [students, searchTerm, selectedGrade, selectedStatus]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      grade: 'X.1',
      absenNo: 1,
      status: 'Aktif',
      gender: 'L',
      phone: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setFormData({
      id: student.id,
      name: student.name,
      grade: student.grade,
      absenNo: student.absenNo,
      status: student.status,
      gender: student.gender || 'L',
      phone: student.phone || ''
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  // Save Add Student
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama peserta tidak boleh kosong', 'warning');
      return;
    }

    const res = addStudent({
      name: formData.name.trim(),
      grade: formData.grade,
      absenNo: Number(formData.absenNo),
      status: formData.status,
      gender: formData.gender,
      phone: formData.phone
    });

    if (res.success) {
      showToast(res.message, 'success');
      setIsAddModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Save Edit Student
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name.trim()) return;

    const res = updateStudent(formData.id, {
      name: formData.name.trim(),
      grade: formData.grade,
      absenNo: Number(formData.absenNo),
      status: formData.status,
      gender: formData.gender,
      phone: formData.phone
    });

    if (res.success) {
      showToast(res.message, 'success');
      setIsEditModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Confirm Delete Single Student
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const res = deleteStudent(studentToDelete.id);
    if (res.success) {
      showToast(res.message, 'success');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  // Confirm Delete All Students
  const handleConfirmDeleteAll = () => {
    if (deleteAllConfirmText.trim().toUpperCase() !== 'HAPUS SEMUA') {
      showToast('Ketik konfirmasi "HAPUS SEMUA" dengan benar untuk melanjutkan.', 'warning');
      return;
    }
    const res = deleteAllStudents(deleteAttendanceToo);
    if (res.success) {
      showToast(res.message, 'success');
      setIsDeleteAllModalOpen(false);
      setDeleteAllConfirmText('');
    }
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          showToast('File Excel kosong atau format tidak sesuai', 'error');
          return;
        }

        const parsed = rawData.map((row) => {
          const name = row['Nama Peserta'] || row['Nama'] || row['nama'] || row['NAMA'] || '';
          const grade = row['Kelas'] || row['kelas'] || row['KELAS'] || 'X.1';
          const absenNo = Number(row['No Absen'] || row['Absen'] || row['no_absen'] || 1);

          // Duplicate check against current students list
          const isDuplicate = students.some(
            (s) => s.name.trim().toLowerCase() === String(name).trim().toLowerCase() && s.grade === String(grade)
          );

          return {
            name: String(name).trim(),
            grade: String(grade).trim(),
            absenNo: isNaN(absenNo) ? 1 : absenNo,
            isDuplicate
          };
        }).filter((r) => r.name.length > 0);

        setImportedRows(parsed);
      } catch (err: any) {
        showToast(`Gagal membaca Excel: ${err.message}`, 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Import
  const handleProcessImport = () => {
    let addedCount = 0;
    let duplicateCount = 0;

    importedRows.forEach((row) => {
      if (!row.isDuplicate) {
        const res = addStudent({
          name: row.name,
          grade: row.grade,
          absenNo: row.absenNo,
          status: 'Aktif'
        });
        if (res.success) addedCount++;
      } else {
        duplicateCount++;
      }
    });

    if (addedCount > 0) {
      showToast(`${addedCount} data peserta berhasil diimpor!`, 'success');
    }
    if (duplicateCount > 0) {
      showToast(`${duplicateCount} data dilewati karena sudah ada.`, 'warning');
    }

    setIsImportModalOpen(false);
    setImportedRows([]);
    setImportFileName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
              👥 DATA PESERTA EKSTRAKURIKULER
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Total terdaftar: <span className="text-emerald-400 font-bold">{students.length} Siswa</span> • Aktif: <span className="text-emerald-300 font-bold">{students.filter(s => s.status === 'Aktif').length}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setDeleteAllConfirmText('');
              setIsDeleteAllModalOpen(true);
            }}
            disabled={students.length === 0}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/40 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Hapus seluruh data peserta"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Hapus Semua</span>
          </button>

          <button
            onClick={downloadStudentTemplateExcel}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download Format Template Excel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Template Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>📥 IMPORT DARI EXCEL</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>➕ TAMBAH PESERTA</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Section 29: Pencarian Cepat) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 Cari nama, kelas, no absen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">Semua Kelas (X.1 - XII.7)</option>
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">Semua Status Peserta</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (< md) for optimal touch response on smartphones */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, idx) => (
            <div
              key={student.id}
              className="sports-glass p-4 rounded-2xl border-slate-800 hover:border-emerald-500/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <button
                      onClick={() => onSelectStudentProfile(student)}
                      className="font-bold text-white text-sm hover:text-emerald-400 text-left transition-colors flex items-center gap-1.5"
                    >
                      <span>{student.name}</span>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Kelas <span className="text-emerald-400 font-semibold">{student.grade}</span> • No. Absen <span className="text-slate-300 font-mono">{student.absenNo}</span> • JK: <span className="text-cyan-400">{student.gender || 'L'}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    student.status === 'Aktif'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {student.status}
                </span>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectStudentProfile(student)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-950/40"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lihat Profil</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(student)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                    title="Edit Peserta"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(student)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                    title="Hapus Peserta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="sports-glass p-8 text-center rounded-2xl border-slate-800 text-slate-400 text-xs">
            Tidak ada data peserta yang cocok dengan pencarian.
          </div>
        )}
      </div>

      {/* Main Table for Desktop and Tablet (hidden on mobile, visible on md+) */}
      <div className="hidden md:block sports-glass rounded-3xl border-emerald-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-300 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Peserta</th>
                <th className="py-3.5 px-4 text-center">Kelas</th>
                <th className="py-3.5 px-4 text-center">No Absen</th>
                <th className="py-3.5 px-4 text-center">JK</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="hover:bg-emerald-950/20 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <button
                        onClick={() => onSelectStudentProfile(student)}
                        className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                        title="Klik untuk melihat Profil Kehadiran"
                      >
                        <span>{student.name}</span>
                        <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-emerald-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {student.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {student.absenNo}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          student.gender === 'P'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {student.gender || 'L'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          student.status === 'Aktif'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'Aktif' ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition-colors"
                          title="✏️ Edit Peserta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                          title="🗑️ Hapus Peserta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data peserta yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah Peserta Manual (Section 4) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                TAMBAH PESERTA
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nama Lengkap Peserta *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: I Kadek Arya Wiratama"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Kelas *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    No Absen *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.absenNo}
                    onChange={(e) => setFormData({ ...formData, absenNo: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender || 'L'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Status Peserta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Peserta (Section 6) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                EDIT PESERTA
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nama Lengkap Peserta *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Kelas *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    No Absen *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.absenNo}
                    onChange={(e) => setFormData({ ...formData, absenNo: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender || 'L'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Status Peserta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation Modal (Section 6) */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                Konfirmasi Hapus Peserta
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Apakah Anda yakin ingin menghapus peserta ini?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <p className="font-bold text-white">{studentToDelete.name}</p>
                <p className="text-slate-400">
                  Kelas {studentToDelete.grade} • No Absen {studentToDelete.absenNo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3B: Delete All Students Confirmation Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white uppercase font-heading">
                ⚠️ HAPUS SEMUA PESERTA
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Tindakan ini akan menghapus total <strong className="text-rose-400">{students.length} peserta</strong> yang terdaftar dalam ekstrakurikuler bulutangkis.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={deleteAttendanceToo}
                  onChange={(e) => setDeleteAttendanceToo(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs">
                  Bersihkan juga seluruh riwayat absensi & catatan kehadiran
                </span>
              </label>

              <p className="text-[11px] text-amber-400/90 pt-1 border-t border-slate-800/80">
                💡 Saran: Unduh backup data melalui menu <strong>Pengaturan / Backup</strong> terlebih dahulu jika diperlukan.
              </p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400">
                Ketik <span className="font-mono text-rose-400 font-bold">HAPUS SEMUA</span> di bawah untuk konfirmasi:
              </label>
              <input
                type="text"
                value={deleteAllConfirmText}
                onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                placeholder="HAPUS SEMUA"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-500/40 rounded-xl text-white text-xs font-mono tracking-wider focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAllModalOpen(false);
                  setDeleteAllConfirmText('');
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                disabled={deleteAllConfirmText.trim().toUpperCase() !== 'HAPUS SEMUA'}
                onClick={handleConfirmDeleteAll}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                HAPUS SEMUA ({students.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Import Siswa Dari Excel (Section 5) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  IMPORT DATA SISWA DARI EXCEL
                </h3>
                <p className="text-xs text-slate-400">
                  Format Kolom: <strong>Nama Peserta | Kelas | No Absen</strong>
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* File Upload Box */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 text-center transition-colors">
                <input
                  type="file"
                  id="excel-file-input"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="excel-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-emerald-400 hover:underline">
                      📂 UPLOAD EXCEL
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {importFileName ? `File terpilih: ${importFileName}` : 'Pilih file .xlsx / .xls dari komputer/HP'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Preview Table */}
              {importedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      Preview Data ({importedRows.length} baris terbaca)
                    </span>
                    <span className="text-amber-400 font-semibold">
                      {importedRows.filter((r) => r.isDuplicate).length} data duplikat terdeteksi
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 sticky top-0 text-slate-400">
                        <tr>
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Nama Peserta</th>
                          <th className="py-2 px-3 text-center">Kelas</th>
                          <th className="py-2 px-3 text-center">No Absen</th>
                          <th className="py-2 px-3 text-center">Status Validasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {importedRows.map((r, i) => (
                          <tr
                            key={i}
                            className={r.isDuplicate ? 'bg-rose-950/20 text-rose-300' : 'text-slate-200'}
                          >
                            <td className="py-1.5 px-3 font-mono">{i + 1}</td>
                            <td className="py-1.5 px-3 font-medium">{r.name}</td>
                            <td className="py-1.5 px-3 text-center">{r.grade}</td>
                            <td className="py-1.5 px-3 text-center font-mono">{r.absenNo}</td>
                            <td className="py-1.5 px-3 text-center">
                              {r.isDuplicate ? (
                                <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 text-[10px] font-bold">
                                  Data sudah tersedia
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-bold">
                                  Siap Impor
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={downloadStudentTemplateExcel}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template Excel</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportedRows([]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  disabled={importedRows.length === 0}
                  onClick={handleProcessImport}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 cursor-pointer"
                >
                  IMPORT KE DATABASE ({importedRows.filter(r => !r.isDuplicate).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
