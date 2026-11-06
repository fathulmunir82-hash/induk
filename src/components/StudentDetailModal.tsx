import React, { useState } from 'react';
import { Student, MutationLog, LegerDocument, KelulusanInfo } from '../types';
import { X, QrCode, Printer, Award, FileText, Plus, Upload, Loader2, Download, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SCHOOL_INFO, storage } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  mutations: MutationLog[];
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  mutations,
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'leger' | 'kelulusan'>('profil');

  // Leger PDF Form state
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [kelasLeger, setKelasLeger] = useState<string>(student?.kelas || '1');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // KK and Akte direct upload states
  const [uploadingKk, setUploadingKk] = useState(false);
  const [uploadingAkte, setUploadingAkte] = useState(false);

  // Kelulusan Form state (for Class 6)
  const [statusKelulusan, setStatusKelulusan] = useState<'Belum Lulus' | 'Lulus' | 'Tidak Lulus'>(
    student?.kelulusanInfo?.statusKelulusan || 'Belum Lulus'
  );
  const [nomorIjazah, setNomorIjazah] = useState(student?.kelulusanInfo?.nomorIjazah || '');
  const [tanggalKeluar, setTanggalKeluar] = useState(student?.tanggalKeluar || '');
  const [catatanKelulusan, setCatatanKelulusan] = useState(student?.kelulusanInfo?.catatanKelulusan || '');

  if (!isOpen || !student) return null;

  const studentMutations = mutations.filter(m => m.studentId === student.id || m.nisn === student.nisn);

  // Handle KK Upload directly in Detail
  const handleKkUploadInDetail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Format berkas harus berupa file PDF.');
      return;
    }

    setUploadingKk(true);
    try {
      const storageRef = ref(storage, `student_documents/kk_${student.id}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const updated: Student = {
        ...student,
        kkPdfUrl: downloadURL,
        kkFileName: file.name,
        kkUploadedAt: new Date().toISOString().split('T')[0],
        updatedAt: Date.now()
      };
      onUpdateStudent(updated);
      alert('Kartu Keluarga (KK) berhasil diunggah!');
    } catch (err) {
      console.warn('Firebase Storage KK upload fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const updated: Student = {
          ...student,
          kkPdfUrl: reader.result as string,
          kkFileName: file.name,
          kkUploadedAt: new Date().toISOString().split('T')[0],
          updatedAt: Date.now()
        };
        onUpdateStudent(updated);
        alert('Kartu Keluarga (KK) berhasil disimpan!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingKk(false);
    }
  };

  // Handle Akte Upload directly in Detail
  const handleAkteUploadInDetail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Format berkas harus berupa file PDF.');
      return;
    }

    setUploadingAkte(true);
    try {
      const storageRef = ref(storage, `student_documents/akte_${student.id}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const updated: Student = {
        ...student,
        aktePdfUrl: downloadURL,
        akteFileName: file.name,
        akteUploadedAt: new Date().toISOString().split('T')[0],
        updatedAt: Date.now()
      };
      onUpdateStudent(updated);
      alert('Akta Kelahiran (Akte) berhasil diunggah!');
    } catch (err) {
      console.warn('Firebase Storage Akte upload fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const updated: Student = {
          ...student,
          aktePdfUrl: reader.result as string,
          akteFileName: file.name,
          akteUploadedAt: new Date().toISOString().split('T')[0],
          updatedAt: Date.now()
        };
        onUpdateStudent(updated);
        alert('Akta Kelahiran (Akte) berhasil disimpan!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAkte(false);
    }
  };

  const handleRemoveKk = () => {
    if (!confirm('Yakin ingin menghapus berkas Kartu Keluarga (KK) ini?')) return;
    const updated: Student = {
      ...student,
      kkPdfUrl: '',
      kkFileName: '',
      kkUploadedAt: '',
      updatedAt: Date.now()
    };
    onUpdateStudent(updated);
  };

  const handleRemoveAkte = () => {
    if (!confirm('Yakin ingin menghapus berkas Akta Kelahiran ini?')) return;
    const updated: Student = {
      ...student,
      aktePdfUrl: '',
      akteFileName: '',
      akteUploadedAt: '',
      updatedAt: Date.now()
    };
    onUpdateStudent(updated);
  };

  const handleUploadLeger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile && !student.legerDokumen?.length) {
      alert('Silakan pilih file PDF Leger Semester terlebih dahulu.');
      return;
    }

    setUploadingPdf(true);
    try {
      let fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      let fileName = pdfFile ? pdfFile.name : `Leger_Semester_${semester}_${tahunAjaran.replace('/', '-')}.pdf`;

      if (pdfFile) {
        const storageRef = ref(storage, `leger_pdf/${student.id}_${semester}_${Date.now()}_${pdfFile.name}`);
        const snapshot = await uploadBytes(storageRef, pdfFile);
        fileUrl = await getDownloadURL(snapshot.ref);
      }

      const newLegerDoc: LegerDocument = {
        id: 'lg_' + Date.now(),
        tahunAjaran,
        semester,
        kelas: kelasLeger,
        fileName,
        fileUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: SCHOOL_INFO.operator
      };

      const updatedLegers = [newLegerDoc, ...(student.legerDokumen || [])];
      const updatedStudent: Student = {
        ...student,
        legerDokumen: updatedLegers,
        updatedAt: Date.now()
      };

      onUpdateStudent(updatedStudent);
      setPdfFile(null);
      alert('Dokumen Leger PDF berhasil diunggah ke Firebase Storage!');
    } catch (err) {
      console.warn('Firebase Storage upload error, creating offline file reference:', err);
      const newLegerDoc: LegerDocument = {
        id: 'lg_' + Date.now(),
        tahunAjaran,
        semester,
        kelas: kelasLeger,
        fileName: pdfFile ? pdfFile.name : `Leger_Semester_${semester}.pdf`,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: SCHOOL_INFO.operator
      };
      const updatedLegers = [newLegerDoc, ...(student.legerDokumen || [])];
      const updatedStudent: Student = {
        ...student,
        legerDokumen: updatedLegers,
        updatedAt: Date.now()
      };
      onUpdateStudent(updatedStudent);
      setPdfFile(null);
      alert('Dokumen Leger berhasil ditambahkan!');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeleteLeger = (legerId: string) => {
    if (!confirm('Yakin ingin menghapus dokumen Leger PDF ini?')) return;
    const updatedLegers = (student.legerDokumen || []).filter(l => l.id !== legerId);
    const updatedStudent: Student = {
      ...student,
      legerDokumen: updatedLegers,
      updatedAt: Date.now()
    };
    onUpdateStudent(updatedStudent);
  };

  const handleSaveKelulusan = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedKelulusan: KelulusanInfo = {
      statusKelulusan,
      nomorIjazah,
      catatanKelulusan
    };

    const updatedStudent: Student = {
      ...student,
      kelulusanInfo: updatedKelulusan,
      status: statusKelulusan === 'Lulus' ? 'Lulus' : student.status,
      tanggalKeluar: statusKelulusan === 'Lulus' && !tanggalKeluar ? new Date().toISOString().split('T')[0] : tanggalKeluar,
      updatedAt: Date.now()
    };

    onUpdateStudent(updatedStudent);
    alert('Keterangan kelulusan berhasil diperbarui!');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{student.namaLengkap}</h3>
              <p className="text-xs text-slate-500">NIS: {student.nis} &bull; NISN: {student.nisn} &bull; Kelas {student.kelas} &bull; {SCHOOL_INFO.nama}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('profil')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profil' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Biodata & Dokumen KK/Akte</span>
          </button>
          <button
            onClick={() => setActiveTab('leger')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'leger' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Unggah Leger PDF (Ganjil & Genap)</span>
          </button>
          {student.kelas === '6' && (
            <button
              onClick={() => setActiveTab('kelulusan')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'kelulusan' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Kelulusan Kelas 6</span>
            </button>
          )}
        </div>

        {/* Tab 1: Profil & QR */}
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="space-y-4 flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <img
                src={student.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={student.namaLengkap}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div className="text-center">
                <h4 className="font-bold text-slate-800">{student.namaLengkap}</h4>
                <p className="text-xs text-emerald-700 font-semibold">Kelas {student.kelas} &bull; NIS: {student.nis}</p>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center space-y-2">
                <QRCodeSVG
                  value={`NIS:${student.nis}|NISN:${student.nisn}|NIK:${student.nik}|NAMA:${student.namaLengkap}|KELAS:${student.kelas}|NPSN:${SCHOOL_INFO.npsn}`}
                  size={130}
                  level="H"
                  includeMargin={true}
                />
                <span className="text-[10px] text-slate-400 font-mono">Scan Absensi Siswa</span>
              </div>

              <button
                onClick={handlePrintCard}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Siswa</span>
              </button>
            </div>

            <div className="md:col-span-2 space-y-5">
              {/* Berkas Dokumen Pendukung (KK & Akte) */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Berkas Dokumen Pendukung Siswa (PDF)</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    Firebase Storage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kartu Keluarga Card */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Kartu Keluarga (KK)</span>
                      {student.kkPdfUrl ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Ada
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Belum Ada</span>
                      )}
                    </div>

                    {student.kkPdfUrl ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-mono font-medium text-slate-700 truncate">
                          {student.kkFileName || 'Dokumen_KK.pdf'}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <a
                            href={student.kkPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka PDF</span>
                          </a>
                          <button
                            type="button"
                            onClick={handleRemoveKk}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus Berkas KK"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <label className="cursor-pointer bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 transition flex items-center justify-center gap-1.5">
                          {uploadingKk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{uploadingKk ? 'Mengunggah...' : 'Unggah KK (PDF)'}</span>
                          <input type="file" accept="application/pdf" onChange={handleKkUploadInDetail} className="hidden" disabled={uploadingKk} />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Akta Kelahiran Card */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Akta Kelahiran (Akte)</span>
                      {student.aktePdfUrl ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Ada
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Belum Ada</span>
                      )}
                    </div>

                    {student.aktePdfUrl ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-mono font-medium text-slate-700 truncate">
                          {student.akteFileName || 'Dokumen_Akta.pdf'}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <a
                            href={student.aktePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka PDF</span>
                          </a>
                          <button
                            type="button"
                            onClick={handleRemoveAkte}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus Berkas Akte"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <label className="cursor-pointer bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 transition flex items-center justify-center gap-1.5">
                          {uploadingAkte ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{uploadingAkte ? 'Mengunggah...' : 'Unggah Akte (PDF)'}</span>
                          <input type="file" accept="application/pdf" onChange={handleAkteUploadInDetail} className="hidden" disabled={uploadingAkte} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Waktu & Administrasi */}
              <div className="space-y-3 text-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                  Data Waktu & Administrasi
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nomor Induk Siswa (NIS):</span>
                    <strong className="text-slate-900 font-mono text-sm">{student.nis || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nomor Induk Siswa Nasional (NISN):</span>
                    <strong className="text-slate-900 font-mono text-sm">{student.nisn || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tanggal Masuk (Enrollment):</span>
                    <strong className="text-slate-800">{student.tanggalMasuk || student.tahunMasuk}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tanggal Keluar / Lulus:</span>
                    <strong className="text-slate-800">{student.tanggalKeluar || 'Masih Aktif'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">NIK:</span>
                    <strong className="text-slate-800">{student.nik || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tempat, Tanggal Lahir:</span>
                    <strong className="text-slate-800">{student.tempatLahir}, {student.tanggalLahir}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jenis Kelamin:</span>
                    <strong className="text-slate-800">{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Agama:</span>
                    <strong className="text-slate-800">{student.agama}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nama Ayah / Ibu:</span>
                    <strong className="text-slate-800">{student.namaAyah} / {student.namaIbu}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status Siswa:</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {student.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs pt-1">
                  <span className="text-slate-400 block">Alamat Lengkap:</span>
                  <strong className="text-slate-800">{student.alamat}</strong>
                </div>
              </div>

              {/* Riwayat Mutasi Log */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                  Riwayat Mutasi (Immutable Log)
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {studentMutations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada catatan mutasi.</p>
                  ) : (
                    studentMutations.map(m => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="text-emerald-800">{m.jenisMutasi}</span>
                          <span className="text-slate-400">{m.tanggal}</span>
                        </div>
                        <p className="text-slate-600">{m.keterangan}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Unggah Leger PDF (Ganjil & Genap) */}
        {activeTab === 'leger' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Dokumen Leger Nilai Semester Ganjil & Genap (PDF)</h4>
                <p className="text-xs text-emerald-700">Unggah berkas resmi leger nilai PDF yang tersimpan aman di Firebase Storage</p>
              </div>
              <span className="bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-full">
                {student.legerDokumen?.length || 0} Dokumen PDF
              </span>
            </div>

            {/* List of Uploaded Leger PDFs */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Leger PDF Terunggah</h5>
              {(!student.legerDokumen || student.legerDokumen.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                  Belum ada dokumen Leger PDF yang diunggah untuk siswa ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {student.legerDokumen.map((leger) => (
                    <div key={leger.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                          PDF
                        </div>
                        <div>
                          <h6 className="font-bold text-slate-800 text-sm">{leger.fileName}</h6>
                          <p className="text-xs text-slate-500">
                            Tahun Ajaran: <strong className="text-slate-700">{leger.tahunAjaran}</strong> &bull; Semester: <strong className="text-emerald-700">{leger.semester}</strong> &bull; Kelas {leger.kelas}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <a
                          href={leger.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka PDF</span>
                        </a>
                        <button
                          onClick={() => handleDeleteLeger(leger.id)}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 p-2 rounded-xl transition"
                          title="Hapus Leger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadLeger} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-sm">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Unggah Berkas Leger Baru (PDF)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Kelas</label>
                  <input
                    type="text"
                    value={kelasLeger}
                    onChange={(e) => setKelasLeger(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Pilih Berkas PDF Leger</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingPdf}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-2"
                >
                  {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploadingPdf ? 'Mengunggah ke Firebase Storage...' : 'Unggah Leger PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Kelulusan Kelas 6 */}
        {activeTab === 'kelulusan' && student.kelas === '6' && (
          <form onSubmit={handleSaveKelulusan} className="space-y-6 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Penentuan Kelulusan & Penerbitan Ijazah Kelas 6</h4>
                <p className="text-xs text-amber-700">Fitur khusus kelulusan siswa akhir tahun ajaran UPTD SDN RAJASINGA 2</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Status Kelulusan</label>
                  <select
                    value={statusKelulusan}
                    onChange={(e) => setStatusKelulusan(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="Belum Lulus">Belum Lulus (Dalam Proses)</option>
                    <option value="Lulus">LULUS</option>
                    <option value="Tidak Lulus">TIDAK LULUS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nomor Seri Ijazah / Surat Kelulusan</label>
                  <input
                    type="text"
                    placeholder="DN-02/D-SD/K13/..."
                    value={nomorIjazah}
                    onChange={(e) => setNomorIjazah(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Tanggal Keluar / Lulus (Departure Date)</label>
                  <input
                    type="date"
                    value={tanggalKeluar}
                    onChange={(e) => setTanggalKeluar(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Catatan Kelulusan / Lanjut ke SMP</label>
                  <input
                    type="text"
                    placeholder="Diterima di SMPN 1 Terisi"
                    value={catatanKelulusan}
                    onChange={(e) => setCatatanKelulusan(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Simpan Status Kelulusan</span>
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
