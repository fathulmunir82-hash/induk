import React, { useState } from 'react';
import { Student } from '../types';
import { Search, Plus, Eye, Edit, Trash2, QrCode, Filter, UserCheck, UserX, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

interface BukuIndukViewProps {
  students: Student[];
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
  onOpenDetailModal: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenImportModal: () => void;
}

export const BukuIndukView: React.FC<BukuIndukViewProps> = ({
  students,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteStudent,
  onOpenImportModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('Aktif');
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nik.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.kelas === selectedClass;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

    let matchesDoc = true;
    if (selectedDocFilter === 'lengkap') {
      matchesDoc = Boolean(student.kkPdfUrl && student.aktePdfUrl);
    } else if (selectedDocFilter === 'has_kk') {
      matchesDoc = Boolean(student.kkPdfUrl);
    } else if (selectedDocFilter === 'has_akte') {
      matchesDoc = Boolean(student.aktePdfUrl);
    } else if (selectedDocFilter === 'missing_any') {
      matchesDoc = !student.kkPdfUrl || !student.aktePdfUrl;
    }

    return matchesSearch && matchesClass && matchesStatus && matchesDoc;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Buku Induk Digital Siswa</h2>
          <p className="text-xs text-slate-500">Pengelolaan data lengkap siswa UPTD SDN RAJASINGA 2</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenImportModal}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-4 py-2.5 rounded-xl text-sm border border-emerald-300 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Impor Excel / CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan Nama, NIS, NISN, atau NIK..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kelas:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Mutasi Keluar">Mutasi Keluar</option>
            <option value="Pindah Masuk">Pindah Masuk</option>
            <option value="Lulus">Lulus</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-2">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dokumen PDF:</span>
          </div>
          <select
            value={selectedDocFilter}
            onChange={(e) => {
              setSelectedDocFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Dokumen</option>
            <option value="lengkap">KK & Akte Lengkap</option>
            <option value="has_kk">Ada KK (PDF)</option>
            <option value="has_akte">Ada Akte (PDF)</option>
            <option value="missing_any">Belum Lengkap</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">TTL</th>
                <th className="py-3 px-4 text-center">JK</th>
                <th className="py-3 px-4 text-center">Kelas</th>
                <th className="py-3 px-4">Nama Orang Tua</th>
                <th className="py-3 px-4 text-center">Berkas (KK / Akte)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={student.namaLengkap}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{student.namaLengkap}</p>
                          <p className="text-xs text-slate-400">Masuk: {student.tahunMasuk}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700">NIS: {student.nis || '-'}</p>
                      <p className="text-xs text-slate-400">NISN: {student.nisn}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {student.tempatLahir}, {student.tanggalLahir}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        student.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {student.kelas}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <p className="font-medium text-slate-700">Ayah: {student.namaAyah}</p>
                      <p className="text-slate-400">Ibu: {student.namaIbu}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {student.kkPdfUrl ? (
                          <a
                            href={student.kkPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                            title={`Buka Berkas KK: ${student.kkFileName || 'KK.pdf'}`}
                          >
                            <FileText className="w-3 h-3 text-emerald-600" />
                            <span>KK</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100 font-medium">
                            KK: -
                          </span>
                        )}

                        {student.aktePdfUrl ? (
                          <a
                            href={student.aktePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition"
                            title={`Buka Berkas Akte: ${student.akteFileName || 'Akta.pdf'}`}
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Akte</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100 font-medium">
                            Akte: -
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : student.status === 'Lulus'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {student.status === 'Aktif' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        <span>{student.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onOpenDetailModal(student)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                          title="Lihat Detail & QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenDetailModal(student)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition"
                          title="Detail Siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(student)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition"
                          title="Edit Siswa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data siswa ${student.namaLengkap}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} siswa
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-100"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-100"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
