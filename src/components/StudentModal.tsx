import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { X, Save, GraduationCap, Upload, Loader2, FileText, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  editingStudent?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    nis: '',
    nisn: '',
    nik: '',
    namaLengkap: '',
    tempatLahir: 'Indramayu',
    tanggalLahir: '2015-01-01',
    jenisKelamin: 'L',
    agama: 'Islam',
    namaAyah: '',
    namaIbu: '',
    pekerjaanOrtu: 'Petani',
    alamat: '',
    kelas: '1',
    status: 'Aktif',
    tahunMasuk: '2025',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    tanggalKeluar: '',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    kkPdfUrl: '',
    kkFileName: '',
    kkUploadedAt: '',
    aktePdfUrl: '',
    akteFileName: '',
    akteUploadedAt: '',
    legerDokumen: [],
    kelulusanInfo: {
      statusKelulusan: 'Belum Lulus',
      nomorIjazah: '',
      catatanKelulusan: ''
    }
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingKk, setUploadingKk] = useState(false);
  const [uploadingAkte, setUploadingAkte] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      setFormData(editingStudent);
    } else {
      setFormData({
        nis: '',
        nisn: '',
        nik: '',
        namaLengkap: '',
        tempatLahir: 'Indramayu',
        tanggalLahir: '2015-01-01',
        jenisKelamin: 'L',
        agama: 'Islam',
        namaAyah: '',
        namaIbu: '',
        pekerjaanOrtu: 'Petani',
        alamat: '',
        kelas: '1',
        status: 'Aktif',
        tahunMasuk: '2025',
        tanggalMasuk: new Date().toISOString().split('T')[0],
        tanggalKeluar: '',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        kkPdfUrl: '',
        kkFileName: '',
        kkUploadedAt: '',
        aktePdfUrl: '',
        akteFileName: '',
        akteUploadedAt: '',
        legerDokumen: [],
        kelulusanInfo: {
          statusKelulusan: 'Belum Lulus',
          nomorIjazah: '',
          catatanKelulusan: ''
        }
      });
    }
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  // Handle Photo File Upload to Firebase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const studentId = editingStudent ? editingStudent.id : 's_' + Date.now();
      const storageRef = ref(storage, `student_photos/${studentId}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, fotoUrl: downloadURL }));
    } catch (err) {
      console.warn('Firebase Storage photo upload failed or offline, falling back to local reader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, fotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Kartu Keluarga (KK) PDF Upload
  const handleKkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Format berkas harus berupa file PDF.');
      return;
    }

    setUploadingKk(true);
    try {
      const studentId = editingStudent ? editingStudent.id : 's_' + Date.now();
      const storageRef = ref(storage, `student_documents/kk_${studentId}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({
        ...prev,
        kkPdfUrl: downloadURL,
        kkFileName: file.name,
        kkUploadedAt: new Date().toISOString().split('T')[0]
      }));
    } catch (err) {
      console.warn('Firebase Storage KK upload failed, using fallback data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          kkPdfUrl: reader.result as string,
          kkFileName: file.name,
          kkUploadedAt: new Date().toISOString().split('T')[0]
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingKk(false);
    }
  };

  // Handle Akta Kelahiran (Akte) PDF Upload
  const handleAkteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Format berkas harus berupa file PDF.');
      return;
    }

    setUploadingAkte(true);
    try {
      const studentId = editingStudent ? editingStudent.id : 's_' + Date.now();
      const storageRef = ref(storage, `student_documents/akte_${studentId}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({
        ...prev,
        aktePdfUrl: downloadURL,
        akteFileName: file.name,
        akteUploadedAt: new Date().toISOString().split('T')[0]
      }));
    } catch (err) {
      console.warn('Firebase Storage Akte upload failed, using fallback data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          aktePdfUrl: reader.result as string,
          akteFileName: file.name,
          akteUploadedAt: new Date().toISOString().split('T')[0]
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAkte(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nisn || !formData.nis) return;

    const studentObj: Student = {
      id: editingStudent ? editingStudent.id : 's_' + Date.now(),
      nis: formData.nis || '',
      nisn: formData.nisn || '',
      nik: formData.nik || '',
      namaLengkap: formData.namaLengkap || '',
      tempatLahir: formData.tempatLahir || 'Indramayu',
      tanggalLahir: formData.tanggalLahir || '2015-01-01',
      jenisKelamin: (formData.jenisKelamin as 'L' | 'P') || 'L',
      agama: formData.agama || 'Islam',
      namaAyah: formData.namaAyah || '',
      namaIbu: formData.namaIbu || '',
      pekerjaanOrtu: formData.pekerjaanOrtu || '-',
      alamat: formData.alamat || '',
      kelas: (formData.kelas as any) || '1',
      status: (formData.status as any) || 'Aktif',
      tahunMasuk: formData.tahunMasuk || '2025',
      tanggalMasuk: formData.tanggalMasuk || new Date().toISOString().split('T')[0],
      tanggalKeluar: formData.tanggalKeluar || '',
      kkPdfUrl: formData.kkPdfUrl || '',
      kkFileName: formData.kkFileName || '',
      kkUploadedAt: formData.kkUploadedAt || '',
      aktePdfUrl: formData.aktePdfUrl || '',
      akteFileName: formData.akteFileName || '',
      akteUploadedAt: formData.akteUploadedAt || '',
      legerDokumen: formData.legerDokumen || [],
      kelulusanInfo: formData.kelulusanInfo || { statusKelulusan: 'Belum Lulus', nomorIjazah: '', catatanKelulusan: '' },
      fotoUrl: formData.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: editingStudent ? editingStudent.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    onSave(studentObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-scaleUp">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {editingStudent ? 'Edit Data Buku Induk Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <p className="text-xs text-slate-500">UPTD SDN RAJASINGA 2 &bull; Sistem Administrasi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[80vh] overflow-y-auto pr-1">
          {/* Photo & Upload section */}
          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <img
              src={formData.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Pas Foto"
              className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-sm shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold text-slate-700 block">Pas Foto Siswa (Firebase Storage)</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5">
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploadingPhoto ? 'Mengunggah...' : 'Unggah Foto Baru'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <span className="text-[11px] text-slate-400">Tersimpan ke Firebase Storage</span>
              </div>
            </div>
          </div>

          {/* Section: Berkas Unggah KK & Akte (PDF) */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-950">
                  Unggah Dokumen Berkas Pendukung (Format PDF)
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Firebase Storage
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* KK (Kartu Keluarga) Upload Card */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1. Kartu Keluarga (KK)</span>
                  {formData.kkPdfUrl ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Terunggah
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Belum ada</span>
                  )}
                </div>

                {formData.kkPdfUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <div className="truncate flex-1 pr-2">
                        <p className="font-mono text-[11px] font-semibold text-slate-700 truncate">
                          {formData.kkFileName || 'Dokumen_KK.pdf'}
                        </p>
                        {formData.kkUploadedAt && (
                          <p className="text-[10px] text-slate-400">Diunggah: {formData.kkUploadedAt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={formData.kkPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          title="Buka Dokumen KK PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, kkPdfUrl: '', kkFileName: '', kkUploadedAt: '' }))}
                          className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Hapus Berkas KK"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800">
                      <Upload className="w-3 h-3" />
                      <span>Ganti File PDF KK</span>
                      <input type="file" accept="application/pdf" onChange={handleKkUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer w-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-dashed border-slate-300 hover:border-emerald-400 py-3 rounded-xl text-xs font-semibold transition flex flex-col items-center justify-center gap-1">
                      {uploadingKk ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Mengunggah KK...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>Pilih File PDF KK</span>
                          <span className="text-[10px] text-slate-400 font-normal">Maks. 10MB (.pdf)</span>
                        </>
                      )}
                      <input type="file" accept="application/pdf" onChange={handleKkUpload} className="hidden" disabled={uploadingKk} />
                    </label>
                  </div>
                )}
              </div>

              {/* Akte Kelahiran Upload Card */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">2. Akta Kelahiran (Akte)</span>
                  {formData.aktePdfUrl ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      Terunggah
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Belum ada</span>
                  )}
                </div>

                {formData.aktePdfUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <div className="truncate flex-1 pr-2">
                        <p className="font-mono text-[11px] font-semibold text-slate-700 truncate">
                          {formData.akteFileName || 'Dokumen_Akta_Kelahiran.pdf'}
                        </p>
                        {formData.akteUploadedAt && (
                          <p className="text-[10px] text-slate-400">Diunggah: {formData.akteUploadedAt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={formData.aktePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          title="Buka Akta Kelahiran PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, aktePdfUrl: '', akteFileName: '', akteUploadedAt: '' }))}
                          className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Hapus Berkas Akte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800">
                      <Upload className="w-3 h-3" />
                      <span>Ganti File PDF Akte</span>
                      <input type="file" accept="application/pdf" onChange={handleAkteUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer w-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-dashed border-slate-300 hover:border-blue-400 py-3 rounded-xl text-xs font-semibold transition flex flex-col items-center justify-center gap-1">
                      {uploadingAkte ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Mengunggah Akte...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>Pilih File PDF Akte</span>
                          <span className="text-[10px] text-slate-400 font-normal">Maks. 10MB (.pdf)</span>
                        </>
                      )}
                      <input type="file" accept="application/pdf" onChange={handleAkteUpload} className="hidden" disabled={uploadingAkte} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Nama Lengkap Siswa *</label>
              <input
                type="text"
                required
                placeholder="Nama lengkap sesuai akta"
                value={formData.namaLengkap || ''}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">NIS (Nomor Induk Sekolah) *</label>
              <input
                type="text"
                required
                placeholder="Nomor induk sekolah (misal: 1001)"
                value={formData.nis || ''}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">NISN (Nomor Induk Siswa Nasional) *</label>
              <input
                type="text"
                required
                placeholder="10 digit NISN"
                value={formData.nisn || ''}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">NIK (Nomor Induk Kependudukan)</label>
              <input
                type="text"
                placeholder="16 digit NIK KK"
                value={formData.nik || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Kelas</label>
                <select
                  value={formData.kelas || '1'}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                >
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Mutasi Keluar">Mutasi Keluar</option>
                  <option value="Pindah Masuk">Pindah Masuk</option>
                  <option value="Lulus">Lulus</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates: Tanggal Masuk & Tanggal Keluar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tanggal Masuk (Enrollment Date)</label>
              <input
                type="date"
                value={formData.tanggalMasuk || ''}
                onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tanggal Keluar / Lulus (Departure Date)</label>
              <input
                type="date"
                value={formData.tanggalKeluar || ''}
                onChange={(e) => setFormData({ ...formData, tanggalKeluar: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tempat Lahir</label>
              <input
                type="text"
                placeholder="Indramayu"
                value={formData.tempatLahir || ''}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.tanggalLahir || ''}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Jenis Kelamin</label>
              <select
                value={formData.jenisKelamin || 'L'}
                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Nama Ayah</label>
              <input
                type="text"
                placeholder="Nama Ayah Kandung"
                value={formData.namaAyah || ''}
                onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Nama Ibu</label>
              <input
                type="text"
                placeholder="Nama Ibu Kandung"
                value={formData.namaIbu || ''}
                onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Pekerjaan Orang Tua</label>
              <input
                type="text"
                placeholder="Petani / Buruh"
                value={formData.pekerjaanOrtu || ''}
                onChange={(e) => setFormData({ ...formData, pekerjaanOrtu: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Alamat Lengkap</label>
            <textarea
              rows={2}
              placeholder="Blok, RT/RW, Desa Rajasinga, Terisi, Indramayu"
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Buku Induk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
