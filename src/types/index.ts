export interface LegerDocument {
  id: string;
  tahunAjaran: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  kelas: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface KelulusanInfo {
  statusKelulusan: 'Belum Lulus' | 'Lulus' | 'Tidak Lulus';
  nomorIjazah?: string;
  tanggalKeluar?: string;
  catatanKelulusan?: string;
}

export interface Student {
  id: string;
  nis: string; // Nomor Induk Siswa (Internal school ID)
  nisn: string; // Nomor Induk Siswa Nasional
  nik: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  agama: string;
  namaAyah: string;
  namaIbu: string;
  pekerjaanOrtu: string;
  alamat: string;
  kelas: '1' | '2' | '3' | '4' | '5' | '6';
  status: 'Aktif' | 'Mutasi Keluar' | 'Pindah Masuk' | 'Lulus';
  fotoUrl?: string;
  tahunMasuk: string;
  tanggalMasuk: string; // Enrollment Date
  tanggalKeluar?: string; // Departure or Graduation Date
  // Berkas Dokumen Pendukung (PDF)
  kkPdfUrl?: string;
  kkFileName?: string;
  kkUploadedAt?: string;
  aktePdfUrl?: string;
  akteFileName?: string;
  akteUploadedAt?: string;
  // Leger & Kelulusan
  legerDokumen?: LegerDocument[]; // Leger PDF Ganjil & Genap
  kelulusanInfo?: KelulusanInfo;
  createdAt?: number;
  updatedAt?: number;
}

export interface MutationLog {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  jenisMutasi: 'Masuk' | 'Keluar' | 'Kenaikan Kelas' | 'Kelulusan';
  keterangan: string;
  tanggal: string;
  kelasAsal?: string;
  kelasTujuan?: string;
  operator: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  pendidikan: string;
  kontak: string;
  status: 'PNS' | 'PPPK' | 'Honor Sekolah';
  tugasTambahan?: string;
  fotoUrl?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'L' | 'P';
  alamat?: string;
  pangkatGolongan?: string;
  updatedAt?: number;
}

export interface SystemUser {
  id: string;
  nip: string; // Used as Username and Password
  nama: string;
  email: string;
  role: 'Operator' | 'Kepala Sekolah' | 'Guru Kelas' | 'Tata Usaha';
  kelasPegang?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: number;
}

export interface SchoolProfile {
  nama: string;
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  operator: string;
}
