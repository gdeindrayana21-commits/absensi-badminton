import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Student,
  AttendanceRecord,
  TrainingSchedule,
  DocumentationItem,
  SchoolIdentity,
  AttendanceSummary,
  AttendanceSummaryRow
} from '../types';
import {
  getStudents,
  getAttendanceRecords,
  getSchedules,
  getDocumentation,
  getSchoolIdentity,
  calculateAttendanceSummaries
} from './storage';

// 1. Export Master Database Excel
export const exportMasterDatabaseExcel = () => {
  const identity = getSchoolIdentity();
  const students = getStudents();
  const attendance = getAttendanceRecords();
  const schedules = getSchedules();
  const docs = getDocumentation();
  const summaries = calculateAttendanceSummaries();

  const workbook = XLSX.utils.book_new();

  // SHEET 1 — DATA_PESERTA
  const sheet1Data = students.map((s) => ({
    'ID': s.id,
    'Nama Peserta': s.name,
    'Kelas': s.grade,
    'Status': s.status,
    'Jenis Kelamin': s.gender || 'L',
    'No Telepon/WA': s.phone || '-',
    'Tanggal Terdaftar': s.joinedAt || '-',
    'Timestamp': new Date().toISOString()
  }));
  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  XLSX.utils.book_append_sheet(workbook, ws1, 'DATA_PESERTA');

  // SHEET 2 — DATA_ABSENSI
  const sheet2Data = attendance.map((a) => ({
    'ID Absensi': a.id,
    'Tanggal': a.date,
    'Hari': a.day,
    'ID Peserta': a.studentId,
    'Nama Peserta': a.studentName,
    'Kelas': a.grade || a.studentGrade,
    'Status': a.status,
    'Jam Mulai': a.startTime,
    'Jam Selesai': a.endTime,
    'Materi': a.material,
    'Catatan': a.notes || '-',
    'Nama Guru Pembina': a.teacherName || identity.teacherName,
    'NIPPPK': a.teacherNip || identity.teacherNip,
    'Timestamp': a.timestamp
  }));
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  XLSX.utils.book_append_sheet(workbook, ws2, 'DATA_ABSENSI');

  // SHEET 3 — JADWAL_LATIHAN
  const sheet3Data = schedules.map((sch) => ({
    'ID': sch.id,
    'Tanggal': sch.date,
    'Hari': sch.day,
    'Jam Mulai': sch.startTime,
    'Jam Selesai': sch.endTime,
    'Tempat': sch.location,
    'Materi': sch.material,
    'Keterangan': sch.notes,
    'Status': sch.status || 'Terjadwal'
  }));
  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  XLSX.utils.book_append_sheet(workbook, ws3, 'JADWAL_LATIHAN');

  // SHEET 4 — DOKUMENTASI
  const sheet4Data = docs.map((d) => ({
    'ID': d.id,
    'Tanggal': d.date,
    'Nama Kegiatan': d.title,
    'Materi': d.material,
    'Link Foto': d.imageUrl,
    'Keterangan': d.description,
    'Timestamp': d.timestamp
  }));
  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);
  XLSX.utils.book_append_sheet(workbook, ws4, 'DOKUMENTASI');

  // SHEET 5 — REKAP_ABSENSI
  const sheet5Data = summaries.map((sm, idx) => ({
    'No': idx + 1,
    'Nama Peserta': sm.name,
    'Kelas': sm.grade,
    'Status Peserta': sm.status,
    'Hadir': sm.hadir,
    'Ijin': sm.ijin,
    'Alpa': sm.alpa,
    'Total Pertemuan': sm.totalMeetings,
    'Persentase Kehadiran (%)': `${sm.percentage}%`,
    'Status Evaluasi': sm.rankBadge
  }));
  const ws5 = XLSX.utils.json_to_sheet(sheet5Data);
  XLSX.utils.book_append_sheet(workbook, ws5, 'REKAP_ABSENSI');

  const fileName = `SMAN1_Tejakula_Database_Bulutangkis_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return fileName;
};

// 2. Export Daily Attendance PDF
export const exportDailyAttendancePdf = (
  records: AttendanceRecord[],
  identity: SchoolIdentity,
  date: string,
  day: string,
  material: string,
  startTime: string,
  endTime: string
) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  // KOP SURAT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('PEMERINTAH PROVINSI BALI', 105, 15, { align: 'center' });
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', 105, 20, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(5, 150, 105);
  doc.text(identity.schoolName, 105, 27, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Alamat: Jl. Raya Singaraja - Amlapura, Tejakula, Buleleng, Bali 81173', 105, 32, { align: 'center' });
  doc.text(`Slogan: "${identity.slogan}"`, 105, 36, { align: 'center' });

  // Divider lines
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(14, 39, 196, 39);
  doc.setLineWidth(0.3);
  doc.line(14, 40.5, 196, 40.5);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('BERITA ACARA & PRESENSI HARIAN BULUTANGKIS', 105, 47, { align: 'center' });

  // Session metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Hari / Tanggal  : ${day}, ${date}`, 14, 54);
  doc.text(`Waktu Latihan  : ${startTime} - ${endTime} WITA`, 14, 59);
  doc.text(`Materi Latihan : ${material}`, 14, 64);
  doc.text(`Guru Pembina   : ${identity.teacherName}`, 120, 54);
  doc.text(`NIPPPK         : ${identity.nipppk || identity.teacherNip}`, 120, 59);

  const tableData = records.map((r, i) => [
    (i + 1).toString(),
    r.studentName,
    r.studentGrade || r.grade,
    r.status,
    r.notes || '-'
  ]);

  autoTable(doc, {
    startY: 68,
    head: [['No', 'Nama Peserta', 'Kelas', 'Status Kehadiran', 'Catatan / Alasan']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 30 },
      4: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const sigY = finalY + 35 > doc.internal.pageSize.height ? 25 : finalY;
  if (finalY + 35 > doc.internal.pageSize.height) doc.addPage();

  doc.setFontSize(9.5);
  doc.text(`Tejakula, ${date}`, 135, sigY);
  doc.text('Guru Pembina Bulutangkis,', 135, sigY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(identity.teacherName, 135, sigY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIPPPK. ${identity.nipppk || identity.teacherNip}`, 135, sigY + 30);

  doc.save(`Presensi_Bulutangkis_${date}_SMAN1Tejakula.pdf`);
};

// 3. Export Daily Attendance Excel
export const exportDailyAttendanceExcel = (
  records: AttendanceRecord[],
  identity: SchoolIdentity,
  date: string,
  day: string,
  material: string,
  startTime: string,
  endTime: string
) => {
  const rows = records.map((r, i) => ({
    'No': i + 1,
    'Tanggal': date,
    'Hari': day,
    'Nama Peserta': r.studentName,
    'Kelas': r.studentGrade || r.grade,
    'Status Kehadiran': r.status,
    'Materi': material,
    'Waktu': `${startTime} - ${endTime} WITA`,
    'Catatan': r.notes || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Presensi_${date}`);
  XLSX.writeFile(wb, `Presensi_Bulutangkis_${date}_SMAN1Tejakula.xlsx`);
};

// 4. Export Attendance Recap Excel
export const exportAttendanceRecapExcel = (
  recapData: AttendanceSummaryRow[],
  identity: SchoolIdentity,
  periodText: string = 'Semua Periode'
) => {
  const rows = recapData.map((r, i) => ({
    'No': i + 1,
    'Nama Peserta': r.student.name,
    'Kelas': r.student.grade,
    'Status Peserta': r.student.status,
    'Hadir': r.hadir,
    'Ijin': r.ijin,
    'Alpa': r.alpa,
    'Total Sesi': r.total,
    '% Kehadiran': `${r.percentage}%`,
    'Predikat': r.predicate
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Kehadiran');
  XLSX.writeFile(wb, `Rekap_Kehadiran_Bulutangkis_${periodText.replace(/\s+/g, '_')}_SMAN1Tejakula.xlsx`);
};

// 5. Export Attendance Recap PDF
export const exportAttendanceRecapPdf = (
  recapData: AttendanceSummaryRow[],
  identity: SchoolIdentity,
  periodText: string = 'Semua Periode'
) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  // KOP SURAT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('PEMERINTAH PROVINSI BALI', 105, 15, { align: 'center' });
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', 105, 20, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(5, 150, 105);
  doc.text(identity.schoolName, 105, 27, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Alamat: Jl. Raya Singaraja - Amlapura, Tejakula, Buleleng, Bali 81173', 105, 32, { align: 'center' });
  doc.text(`Slogan: "${identity.slogan}"`, 105, 36, { align: 'center' });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(14, 39, 196, 39);
  doc.setLineWidth(0.3);
  doc.line(14, 40.5, 196, 40.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN REKAPITULASI KEHADIRAN BULUTANGKIS', 105, 47, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Periode          : ${periodText}`, 14, 54);
  doc.text(`Guru Pembina : ${identity.teacherName}`, 14, 59);
  doc.text(`NIPPPK           : ${identity.nipppk || identity.teacherNip}`, 14, 64);
  doc.text(`Tahun Pelajaran: ${identity.academicYear}`, 130, 54);
  doc.text(`Semester          : ${identity.semester}`, 130, 59);

  const tableData = recapData.map((r, i) => [
    (i + 1).toString(),
    r.student.name,
    r.student.grade,
    r.hadir.toString(),
    r.ijin.toString(),
    r.alpa.toString(),
    r.total.toString(),
    `${r.percentage}%`,
    r.predicate
  ]);

  autoTable(doc, {
    startY: 68,
    head: [['No', 'Nama Peserta', 'Kelas', 'H', 'I', 'A', 'Tot', '% Hadir', 'Predikat']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 62 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 10 },
      5: { halign: 'center', cellWidth: 10 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'center', cellWidth: 20 },
      8: { halign: 'center', cellWidth: 30 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const sigY = finalY + 45 > doc.internal.pageSize.height ? 25 : finalY;
  if (finalY + 45 > doc.internal.pageSize.height) doc.addPage();

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  doc.setFontSize(9.5);
  doc.text(`Tejakula, ${todayFormatted}`, 135, sigY);
  doc.text('Mengetahui,', 20, sigY + 5);
  doc.text('Kepala SMA Negeri 1 Tejakula', 20, sigY + 10);
  doc.text('Guru Pembina Bulutangkis', 135, sigY + 10);

  doc.setFont('helvetica', 'bold');
  doc.text(`( ${identity.headmasterName} )`, 20, sigY + 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${identity.headmasterNip}`, 20, sigY + 41);

  doc.setFont('helvetica', 'bold');
  doc.text(identity.teacherName, 135, sigY + 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIPPPK. ${identity.nipppk || identity.teacherNip}`, 135, sigY + 41);

  doc.save(`Rekap_Absensi_Bulutangkis_${periodText.replace(/\s+/g, '_')}_SMAN1Tejakula.pdf`);
};

// 6. Download Template Excel for Student Import (Tanpa Kolom Jenis Kelamin)
export const downloadStudentTemplateExcel = () => {
  const templateData = [
    { 'Nama Peserta': 'I Gede Aditya Pratama', 'Kelas': 'X.1', 'No Telepon/WA': '081234567890' },
    { 'Nama Peserta': 'Ni Made Bintang Pradnya', 'Kelas': 'X.2', 'No Telepon/WA': '081234567891' },
    { 'Nama Peserta': 'I Komang Candra Wibawa', 'Kelas': 'XI. 1', 'No Telepon/WA': '081234567892' },
    { 'Nama Peserta': 'Ni Ketut Dian Lestari', 'Kelas': 'XII. 3', 'No Telepon/WA': '081234567893' }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Import_Siswa');
  XLSX.writeFile(wb, `Template_Import_Siswa_Bulutangkis_SMAN1Tejakula.xlsx`);
};

// 7. Export Student List Excel
export const exportStudentListExcel = () => {
  const students = getStudents();
  const rows = students.map((s, idx) => ({
    'No': idx + 1,
    'Nama Lengkap': s.name,
    'Kelas': s.grade,
    'Status': s.status,
    'Jenis Kelamin': s.gender === 'P' ? 'Perempuan' : 'Laki-laki',
    'No Kontak/WA': s.phone || '-',
    'Tanggal Masuk': s.joinedAt || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar_Peserta');
  XLSX.writeFile(wb, `Daftar_Peserta_Bulutangkis_SMAN1Tejakula_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportOfficialSchoolPDF = (
  recapData?: AttendanceSummaryRow[],
  identityParam?: SchoolIdentity,
  periodText: string = 'Semua Periode'
) => {
  const identity = identityParam || getSchoolIdentity();
  let dataToUse = recapData;
  if (!dataToUse) {
    const students = getStudents();
    const records = getAttendanceRecords();
    const distinctDates = Array.from(new Set(records.map((r) => r.date)));
    const total = distinctDates.length;
    dataToUse = students.map((s) => {
      const sRecords = records.filter((r) => r.studentId === s.id);
      const hadir = sRecords.filter((r) => r.status === 'Hadir').length;
      const ijin = sRecords.filter((r) => r.status === 'Ijin').length;
      const alpa = sRecords.filter((r) => r.status === 'Alpa').length;
      const percentage = total > 0 ? Number(((hadir / total) * 100).toFixed(1)) : 0;
      let predicate = 'Aktif';
      if (percentage >= 95) predicate = 'Sangat Aktif';
      else if (percentage >= 80) predicate = 'Aktif';
      else if (alpa >= 4 || percentage < 60) predicate = 'Prioritas Pembinaan';
      else if (alpa >= 3 || percentage < 75) predicate = 'Perlu Perhatian';
      return {
        student: s,
        hadir,
        ijin,
        alpa,
        total,
        percentage,
        predicate
      };
    });
  }
  return exportAttendanceRecapPdf(dataToUse, identity, periodText);
};
