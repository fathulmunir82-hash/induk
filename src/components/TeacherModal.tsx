import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { X, Upload, Loader2, UserCheck, Trash2, Camera, Shield, Award, Phone, MapPin } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, SCHOOL_INFO } from '../lib/firebase';
import { NipBarcode } from './NipBarcode';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTeacher: (teacher: Teacher) => void;
  teacherToEdit: Teacher | null;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSaveTeacher,
  teacherToEdit
}) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    nip: '',
    nama: '',
    jabatan: 'Guru Kelas 1',
    pendidikan: 'S1 PGSD',
    kontak: '',
    status: 'PNS',
    tugasTambahan: '',
    pangkatGolongan: '',
    jenisKelamin: 'L',
    tempatLahir: 'Indramayu',
    tanggalLahir: '',
    alamat: 'Desa Rajasinga, Kec. Terisi',
    fotoUrl: ''
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherToEdit) {
      setFormData({ ...teacherToEdit });
    } else {
      setFormData({
        nip: '',
        nama: '',
        jabatan: 'Guru Kelas 1',
        pendidikan: 'S1 PGSD',
        kontak: '',
        status: 'PNS',
        tugasTambahan: '',
        pangkatGolongan: 'Penata Muda / III/a',
        jenisKelamin: 'L',
        tempatLahir: 'Indramayu',
        tanggalLahir: '1990-01-01',
        alamat: 'Desa Rajasinga, Kec. Terisi',
        fotoUrl: ''
      });
    }
    setPhotoError(null);
  }, [teacherToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Berkas harus berupa file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Ukuran file maksimal 5MB.');
      return;
    }

    setPhotoError(null);
    setUploadingPhoto(true);

    try {
      const teacherId = teacherToEdit?.id || 't_' + Date.now();
      const storageRef = ref(storage, `teachers/foto_${teacherId}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setFormData(prev => ({
        ...prev,
        fotoUrl: downloadURL
      }));
    } catch (err) {
      console.warn('Firebase Storage upload error, using offline local reader fallback:', err);
      // Offline fallback: store as base64 DataURL
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          fotoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, fotoUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nama.trim()) {
      alert('Nama guru wajib diisi!');
      return;
    }

    const teacherObj: Teacher = {
      id: teacherToEdit?.id || 't_' + Date.now(),
      nip: (formData.nip && formData.nip.trim()) || '-',
      nama: formData.nama.trim(),
      jabatan: formData.jabatan || 'Guru Kelas',
      pendidikan: formData.pendidikan || 'S1',
      kontak: formData.kontak || '-',
      status: (formData.status as any) || 'PNS',
      tugasTambahan: formData.tugasTambahan || '-',
      pangkatGolongan: formData.pangkatGolongan || '-',
      jenisKelamin: formData.jenisKelamin || 'L',
      tempatLahir: formData.tempatLahir || 'Indramayu',
      tanggalLahir: formData.tanggalLahir || '1990-01-01',
      alamat: formData.alamat || 'Desa Rajasinga',
      fotoUrl: formData.fotoUrl || '',
      updatedAt: Date.now()
    };

    onSaveTeacher(teacherObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {teacherToEdit ? 'Edit Data Guru & Pegawai' : 'Tambah Guru & Pegawai Baru'}
              </h3>
              <p className="text-xs text-slate-500">{SCHOOL_INFO.nama} &bull; NPSN: {SCHOOL_INFO.npsn}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Foto Guru & Barcode Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-6">
            {/* Foto Upload Area */}
            <div className="flex flex-col items-center space-y-3 shrink-0">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-md bg-white flex items-center justify-center">
                  {formData.fotoUrl ? (
                    <img
                      src={formData.fotoUrl}
                      alt={formData.nama || 'Foto Guru'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Camera className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400">Belum ada foto</span>
                    </div>
                  )}
                </div>

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white text-xs font-semibold">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.fotoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>

                {formData.fotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {photoError && (
                <p className="text-[11px] text-rose-600 font-medium">{photoError}</p>
              )}
            </div>

            {/* Live Barcode NIP Preview */}
            <div className="flex-1 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pratinjau Barcode NIP Resmi (Code 39)
              </span>
              <div className="w-full flex justify-center py-1">
                <NipBarcode nip={formData.nip || '19850315 201001 1 008'} height={40} />
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Barcode ini memuat NIP resmi dan akan otomatis tersemat pada Kartu Tanda Pengenal Guru.
              </p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Nama Lengkap & Gelar */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-slate-700">
                Nama Lengkap & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dra. Hj. Siti Nurhayati, M.Pd."
                value={formData.nama || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* NIP */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Nomor Induk Pegawai (NIP / ID)
              </label>
              <input
                type="text"
                placeholder="Contoh: 19850315 201001 1 008"
                value={formData.nip || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              <span className="text-[10px] text-slate-400">Gunakan spasi atau gabungkan 18 digit NIP</span>
            </div>

            {/* Jabatan */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Jabatan di Sekolah</label>
              <select
                value={formData.jabatan || 'Guru Kelas 1'}
                onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              >
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Guru Kelas 1">Guru Kelas 1</option>
                <option value="Guru Kelas 2">Guru Kelas 2</option>
                <option value="Guru Kelas 3">Guru Kelas 3</option>
                <option value="Guru Kelas 4">Guru Kelas 4</option>
                <option value="Guru Kelas 5">Guru Kelas 5</option>
                <option value="Guru Kelas 6">Guru Kelas 6</option>
                <option value="Guru Pendidikan Agama Islam">Guru Pendidikan Agama Islam</option>
                <option value="Guru PJOK / Olahraga">Guru PJOK / Olahraga</option>
                <option value="Operator Sekolah / Guru Kelas">Operator Sekolah / Guru Kelas</option>
                <option value="Tenaga Administrasi / Tata Usaha">Tenaga Administrasi / Tata Usaha</option>
                <option value="Penjaga Sekolah">Penjaga Sekolah</option>
              </select>
            </div>

            {/* Status Kepegawaian */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Status Kepegawaian</label>
              <select
                value={formData.status || 'PNS'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              >
                <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                <option value="PPPK">PPPK (Pegawai Pemerintah dg Perjanjian Kerja)</option>
                <option value="Honor Sekolah">Honor Sekolah / GTT</option>
              </select>
            </div>

            {/* Pangkat & Golongan */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pangkat / Golongan Ruang</label>
              <input
                type="text"
                placeholder="Contoh: Pembina / IV/a atau Penata / III/c"
                value={formData.pangkatGolongan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pangkatGolongan: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Pendidikan Terakhir */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pendidikan Terakhir</label>
              <input
                type="text"
                placeholder="Contoh: S1 PGSD, S1 Tarbiyah, S2 Manajemen Pendidikan"
                value={formData.pendidikan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pendidikan: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* No. Kontak / WhatsApp */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">No. WhatsApp / Kontak</label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={formData.kontak || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, kontak: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Jenis Kelamin</label>
              <select
                value={formData.jenisKelamin || 'L'}
                onChange={(e) => setFormData(prev => ({ ...prev, jenisKelamin: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            {/* Tempat & Tanggal Lahir */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="Indramayu"
                  value={formData.tempatLahir || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempatLahir: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tanggalLahir || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Tugas Tambahan */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-slate-700">Tugas Tambahan / Peran Sekolah</label>
              <input
                type="text"
                placeholder="Contoh: Bendahara BOS, Pembina Pramuka, Operator Dapodik, Tim IT Sekolah"
                value={formData.tugasTambahan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tugasTambahan: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-slate-700">Alamat Tempat Tinggal</label>
              <input
                type="text"
                placeholder="Contoh: Blok Lapang RT 02/01 Desa Rajasinga, Kec. Terisi"
                value={formData.alamat || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploadingPhoto}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{teacherToEdit ? 'Simpan Perubahan' : 'Tambahkan Guru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
