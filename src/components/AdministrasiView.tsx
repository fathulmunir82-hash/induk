import React, { useState } from 'react';
import { Student } from '../types';
import { SCHOOL_INFO } from '../lib/firebase';
import { FileText, Printer, Award, UserCheck, ArrowRightLeft } from 'lucide-react';

interface AdministrasiViewProps {
  students: Student[];
}

export const AdministrasiView: React.FC<AdministrasiViewProps> = ({ students }) => {
  const [letterType, setLetterType] = useState<'aktif' | 'masuk' | 'pindah' | 'rekap'>('aktif');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [destinationSchool, setDestinationSchool] = useState('');
  const [originSchool, setOriginSchool] = useState('SD Asal Sebelumnya');
  const [reasonMutation, setReasonMutation] = useState('Pindah mengikuti orang tua');

  const activeStudents = students.filter(s => s.status === 'Aktif');
  const mutasiMasukStudents = students.filter(s => s.status === 'Pindah Masuk');
  const mutasiKeluarStudents = students.filter(s => s.status === 'Mutasi Keluar');

  // Determine available students based on letter type
  const targetStudents =
    letterType === 'masuk' ? (mutasiMasukStudents.length > 0 ? mutasiMasukStudents : students) :
    letterType === 'pindah' ? (mutasiKeluarStudents.length > 0 ? mutasiKeluarStudents : students) :
    activeStudents;

  const selectedStudent = students.find(s => s.id === selectedStudentId) || targetStudents[0] || students[0];

  // Titimangsa date based on student input
  const letterDate =
    letterType === 'masuk' && selectedStudent?.tanggalMasuk ? selectedStudent.tanggalMasuk :
    letterType === 'pindah' && selectedStudent?.tanggalKeluar ? selectedStudent.tanggalKeluar :
    new Date().toISOString().split('T')[0];

  const formattedDate = new Date(letterDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Administrasi & Surat Resmi Sekolah</h2>
          <p className="text-xs text-slate-500">Pusat pencetakan surat keterangan, surat tanda diterima mutasi masuk, surat mutasi keluar, dan rekapitulasi</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen</span>
        </button>
      </div>

      {/* Letter Type Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 print:hidden">
        <button
          onClick={() => setLetterType('aktif')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            letterType === 'aktif' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Surat Keterangan Aktif</span>
        </button>
        <button
          onClick={() => setLetterType('masuk')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            letterType === 'masuk' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Surat Tanda Diterima (Mutasi Masuk)</span>
        </button>
        <button
          onClick={() => setLetterType('pindah')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            letterType === 'pindah' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Surat Mutasi Keluar</span>
        </button>
        <button
          onClick={() => setLetterType('rekap')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            letterType === 'rekap' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rekapitulasi Keadaan Siswa</span>
        </button>
      </div>

      {/* Configuration Form for Selected Letter */}
      {letterType !== 'rekap' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 print:hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">
              {letterType === 'masuk' ? 'Pilih Siswa Mutasi Masuk' :
               letterType === 'pindah' ? 'Pilih Siswa Mutasi Keluar' : 'Pilih Siswa Aktif'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Titimangsa otomatis dari Tanggal Input Identitas</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Siswa</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {targetStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.namaLengkap} (Kelas {s.kelas} - NISN: {s.nisn} - Status: {s.status})
                  </option>
                ))}
              </select>
            </div>

            {letterType === 'masuk' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Sekolah Asal</label>
                <input
                  type="text"
                  placeholder="Nama SD Asal Sebelumnya"
                  value={originSchool}
                  onChange={(e) => setOriginSchool(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}

            {letterType === 'pindah' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Sekolah Tujuan Pindah</label>
                  <input
                    type="text"
                    placeholder="Nama Sekolah Tujuan"
                    value={destinationSchool}
                    onChange={(e) => setDestinationSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Alasan Pindah</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mengikuti perpindahan tugas orang tua"
                    value={reasonMutation}
                    onChange={(e) => setReasonMutation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Official Letter Preview Paper with Official Kop Surat */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-md border border-slate-200 max-w-4xl mx-auto space-y-8 text-slate-800 print:shadow-none print:border-none print:p-0">
        {/* Official Kop Surat with School Logo */}
        <div className="border-b-4 border-double border-slate-900 pb-4 flex items-center space-x-4">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/Screenshot_2026-10-16_170955_17080eba.png"
              alt="Logo UPTD SDN RAJASINGA 2"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 text-center space-y-0.5 pr-16">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              PEMERINTAH KABUPATEN INDRAMAYU
            </p>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </p>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
              {SCHOOL_INFO.nama}
            </h1>
            <p className="text-[11px] sm:text-xs font-medium text-slate-600">
              NPSN: {SCHOOL_INFO.npsn} &bull; Alamat: {SCHOOL_INFO.alamat}
            </p>
          </div>
        </div>

        {letterType === 'aktif' && selectedStudent && (
          <div className="space-y-6 text-sm leading-relaxed">
            <div className="text-center space-y-1 pt-2">
              <h3 className="font-bold uppercase underline text-base text-slate-900 tracking-wide">
                SURAT KETERANGAN SISWA AKTIF
              </h3>
              <p className="text-xs text-slate-500">Nomor: 421.2 / {Math.floor(Math.random() * 899 + 100)} / SDN.RJS-2 / {new Date().getFullYear()}</p>
            </div>

            <p className="text-slate-700">
              Yang bertanda tangan di bawah ini Kepala <strong className="text-slate-900">{SCHOOL_INFO.nama}</strong>, Kecamatan Terisi, Kabupaten Indramayu, menerangkan dengan sebenarnya bahwa:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3 font-medium text-slate-800">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {selectedStudent.namaLengkap}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nomor Induk Siswa (NISN)</span>
                <span className="col-span-2">: {selectedStudent.nisn}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">NIK Siswa</span>
                <span className="col-span-2">: {selectedStudent.nik}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                <span className="col-span-2">: {selectedStudent.tempatLahir}, {selectedStudent.tanggalLahir}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Jenis Kelamin</span>
                <span className="col-span-2">: {selectedStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Kelas</span>
                <span className="col-span-2 font-bold text-emerald-800">: Kelas {selectedStudent.kelas}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nama Orang Tua / Wali</span>
                <span className="col-span-2">: {selectedStudent.namaAyah} / {selectedStudent.namaIbu}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Alamat</span>
                <span className="col-span-2">: {selectedStudent.alamat}</span>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Nama tersebut di atas adalah benar-benar siswa yang aktif belajar pada <strong className="text-slate-900">{SCHOOL_INFO.nama}</strong> tahun ajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}.
            </p>
            <p className="text-slate-700">
              Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya bagi pihak yang berkepentingan.
            </p>

            <div className="flex justify-between items-end pt-12">
              <div className="text-xs text-slate-500 space-y-1">
                <p>Mengetahui,</p>
                <p className="font-semibold text-slate-700">Pengawas Sekolah Dasar</p>
                <div className="h-16"></div>
                <p className="underline font-semibold text-slate-800">( ........................................ )</p>
              </div>
              <div className="text-xs text-slate-700 space-y-1 text-right">
                <p>Rajasinga, {formattedDate}</p>
                <p className="font-semibold">Kepala {SCHOOL_INFO.nama}</p>
                <div className="h-12"></div>
                <p className="font-bold text-slate-900 underline">{SCHOOL_INFO.kepalaSekolah}</p>
                <p className="text-slate-600">NIP. {SCHOOL_INFO.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        )}

        {/* Surat Tanda Diterima (Mutasi Masuk) */}
        {letterType === 'masuk' && selectedStudent && (
          <div className="space-y-6 text-sm leading-relaxed">
            <div className="text-center space-y-1 pt-2">
              <h3 className="font-bold uppercase underline text-base text-slate-900 tracking-wide">
                SURAT TANDA DITERIMA (MUTASI MASUK)
              </h3>
              <p className="text-xs text-slate-500">Nomor: 421.2 / {Math.floor(Math.random() * 899 + 100)} / S.TERIMA / SDN.RJS-2 / {new Date().getFullYear()}</p>
            </div>

            <p className="text-slate-700">
              Kepala <strong className="text-slate-900">{SCHOOL_INFO.nama}</strong> Kecamatan Terisi Kabupaten Indramayu menerangkan dengan sebenarnya bahwa berdasarkan permohonan pindah dan berkas mutasi dari sekolah asal, siswa di bawah ini:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3 font-medium text-slate-800">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {selectedStudent.namaLengkap}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">NISN / NIK</span>
                <span className="col-span-2">: {selectedStudent.nisn} / {selectedStudent.nik}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                <span className="col-span-2">: {selectedStudent.tempatLahir}, {selectedStudent.tanggalLahir}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Jenis Kelamin</span>
                <span className="col-span-2">: {selectedStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Diterima di Kelas</span>
                <span className="col-span-2 font-bold text-emerald-800">: Kelas {selectedStudent.kelas}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Asal Sekolah</span>
                <span className="col-span-2 font-bold text-blue-800">: {originSchool}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tanggal Diterima</span>
                <span className="col-span-2 font-semibold text-slate-800">: {selectedStudent.tanggalMasuk || formattedDate}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nama Orang Tua / Wali</span>
                <span className="col-span-2">: {selectedStudent.namaAyah} / {selectedStudent.namaIbu}</span>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Telah <strong>DITERIMA</strong> secara resmi sebagai siswa di <strong className="text-slate-900">{SCHOOL_INFO.nama}</strong> terhitung mulai tanggal tersebut di atas dengan status <strong>Pindah Masuk</strong>.
            </p>

            <div className="flex justify-between items-end pt-12">
              <div className="text-xs text-slate-500 space-y-1">
                <p>Orang Tua / Wali Murid,</p>
                <div className="h-16"></div>
                <p className="underline font-semibold text-slate-800">( {selectedStudent.namaAyah || 'Orang Tua'} )</p>
              </div>
              <div className="text-xs text-slate-700 space-y-1 text-right">
                <p>Rajasinga, {formattedDate}</p>
                <p className="font-semibold">Kepala {SCHOOL_INFO.nama}</p>
                <div className="h-12"></div>
                <p className="font-bold text-slate-900 underline">{SCHOOL_INFO.kepalaSekolah}</p>
                <p className="text-slate-600">NIP. {SCHOOL_INFO.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        )}

        {/* Surat Mutasi Keluar */}
        {letterType === 'pindah' && selectedStudent && (
          <div className="space-y-6 text-sm leading-relaxed">
            <div className="text-center space-y-1 pt-2">
              <h3 className="font-bold uppercase underline text-base text-slate-900 tracking-wide">
                SURAT KETERANGAN PINDAH SEKOLAH (MUTASI KELUAR)
              </h3>
              <p className="text-xs text-slate-500">Nomor: 421.2 / {Math.floor(Math.random() * 899 + 100)} / MUT / SDN.RJS-2 / {new Date().getFullYear()}</p>
            </div>

            <p className="text-slate-700">
              Kepala <strong className="text-slate-900">{SCHOOL_INFO.nama}</strong> Kecamatan Terisi Kabupaten Indramayu menerangkan bahwa siswa:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3 font-medium text-slate-800">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {selectedStudent.namaLengkap}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">NISN / NIK</span>
                <span className="col-span-2">: {selectedStudent.nisn} / {selectedStudent.nik}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                <span className="col-span-2">: {selectedStudent.tempatLahir}, {selectedStudent.tanggalLahir}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Kelas / Tingkat</span>
                <span className="col-span-2 font-bold text-emerald-800">: Kelas {selectedStudent.kelas}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Pindah Ke Sekolah</span>
                <span className="col-span-2 font-bold text-blue-800">: {destinationSchool || '[Nama Sekolah Tujuan Belum Diisi]'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tanggal Efektif Pindah</span>
                <span className="col-span-2 font-semibold text-slate-800">: {selectedStudent.tanggalKeluar || formattedDate}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Alasan Pindah</span>
                <span className="col-span-2">: {reasonMutation}</span>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Siswa tersebut di atas terhitung mulai tanggal <strong className="text-slate-900">{selectedStudent.tanggalKeluar || formattedDate}</strong> telah resmi mutasi keluar atas permintaan orang tua/wali murid. Kami mengucapkan terima kasih dan semoga sukses di sekolah yang baru.
            </p>

            <div className="flex justify-between items-end pt-12">
              <div className="text-xs text-slate-500 space-y-1">
                <p>Orang Tua / Wali Murid,</p>
                <div className="h-16"></div>
                <p className="underline font-semibold text-slate-800">( {selectedStudent.namaAyah || 'Orang Tua'} )</p>
              </div>
              <div className="text-xs text-slate-700 space-y-1 text-right">
                <p>Rajasinga, {formattedDate}</p>
                <p className="font-semibold">Kepala {SCHOOL_INFO.nama}</p>
                <div className="h-12"></div>
                <p className="font-bold text-slate-900 underline">{SCHOOL_INFO.kepalaSekolah}</p>
                <p className="text-slate-600">NIP. {SCHOOL_INFO.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rekapitulasi Keadaan Siswa */}
        {letterType === 'rekap' && (
          <div className="space-y-6 text-sm">
            <div className="text-center space-y-1 pt-2">
              <h3 className="font-bold uppercase underline text-base text-slate-900 tracking-wide">
                REKAPITULASI KEADAAN SISWA BERDASARKAN STATUS
              </h3>
              <p className="text-xs text-slate-500">{SCHOOL_INFO.nama} - NPSN: {SCHOOL_INFO.npsn}</p>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-2.5 text-center">Kelas</th>
                  <th className="border border-slate-300 p-2.5 text-center">Aktif (L / P)</th>
                  <th className="border border-slate-300 p-2.5 text-center">Pindah Masuk</th>
                  <th className="border border-slate-300 p-2.5 text-center">Mutasi Keluar</th>
                  <th className="border border-slate-300 p-2.5 text-center">Lulus</th>
                  <th className="border border-slate-300 p-2.5 text-center">Total Siswa</th>
                </tr>
              </thead>
              <tbody>
                {['1', '2', '3', '4', '5', '6'].map(cls => {
                  const classStudents = students.filter(s => s.kelas === cls);
                  const aktifL = classStudents.filter(s => s.status === 'Aktif' && s.jenisKelamin === 'L').length;
                  const aktifP = classStudents.filter(s => s.status === 'Aktif' && s.jenisKelamin === 'P').length;
                  const masuk = classStudents.filter(s => s.status === 'Pindah Masuk').length;
                  const keluar = classStudents.filter(s => s.status === 'Mutasi Keluar').length;
                  const lulus = classStudents.filter(s => s.status === 'Lulus').length;
                  const total = classStudents.length;

                  return (
                    <tr key={cls} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2.5 text-center font-bold">Kelas {cls}</td>
                      <td className="border border-slate-300 p-2.5 text-center">{aktifL} / {aktifP}</td>
                      <td className="border border-slate-300 p-2.5 text-center text-blue-700 font-semibold">{masuk}</td>
                      <td className="border border-slate-300 p-2.5 text-center text-amber-700 font-semibold">{keluar}</td>
                      <td className="border border-slate-300 p-2.5 text-center text-purple-700 font-semibold">{lulus}</td>
                      <td className="border border-slate-300 p-2.5 text-center font-bold text-emerald-800">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="border border-slate-300 p-2.5 text-center">TOTAL KESELURUHAN</td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    {students.filter(s => s.status === 'Aktif' && s.jenisKelamin === 'L').length} / {students.filter(s => s.status === 'Aktif' && s.jenisKelamin === 'P').length}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    {students.filter(s => s.status === 'Pindah Masuk').length}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    {students.filter(s => s.status === 'Mutasi Keluar').length}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    {students.filter(s => s.status === 'Lulus').length}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center text-emerald-900 text-sm">
                    {students.length} Siswa
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-end pt-12">
              <div className="text-xs text-slate-700 space-y-1 text-right">
                <p>Rajasinga, {formattedDate}</p>
                <p className="font-semibold">Operator Dapodik / Tata Usaha</p>
                <div className="h-12"></div>
                <p className="font-bold text-slate-900 underline">{SCHOOL_INFO.operator}</p>
                <p className="text-slate-600">NIP. -</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
