import React, { useState } from 'react';
import { Teacher } from '../types';
import { Users, Search, Plus, Award, Phone, ShieldCheck, FileSpreadsheet, Edit, Trash2, Printer, Filter, QrCode } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';
import { TeacherModal } from './TeacherModal';
import { TeacherCardModal } from './TeacherCardModal';
import { NipBarcode } from './NipBarcode';
import { formatNip } from '../utils/barcode';

interface GuruViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onOpenImportModal: () => void;
}

export const GuruView: React.FC<GuruViewProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onOpenImportModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [teacherToPrint, setTeacherToPrint] = useState<Teacher | null>(null);

  // Statistics
  const totalCount = teachers.length;
  const pnsCount = teachers.filter(t => t.status === 'PNS').length;
  const pppkCount = teachers.filter(t => t.status === 'PPPK').length;
  const honorCount = teachers.filter(t => t.status === 'Honor Sekolah').length;

  // Filtered teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setTeacherToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setIsFormModalOpen(true);
  };

  const handleOpenCardModal = (teacher: Teacher) => {
    setTeacherToPrint(teacher);
    setIsCardModalOpen(true);
  };

  const handleDelete = (teacher: Teacher) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data guru ${teacher.nama} (NIP: ${teacher.nip})?`)) {
      onDeleteTeacher(teacher.id);
    }
  };

  const handleSaveTeacher = (teacher: Teacher) => {
    if (teacherToEdit) {
      onUpdateTeacher(teacher);
    } else {
      onAddTeacher(teacher);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Guru & Pegawai</h2>
          <p className="text-xs text-slate-500">
            Daftar dewan guru, foto resmi, cetak kartu dengan Barcode NIP &bull; {SCHOOL_INFO.nama}
          </p>
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
            onClick={handleOpenAddModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru / Pegawai</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Pegawai</p>
            <h4 className="text-lg font-bold text-slate-800">{totalCount} Orang</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            PNS
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pegawai PNS</p>
            <h4 className="text-lg font-bold text-blue-800">{pnsCount} Orang</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            P3K
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pegawai PPPK</p>
            <h4 className="text-lg font-bold text-amber-800">{pppkCount} Orang</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            GTT
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Honor Sekolah</p>
            <h4 className="text-lg font-bold text-purple-800">{honorCount} Orang</h4>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Status ({totalCount})</option>
            <option value="PNS">PNS ({pnsCount})</option>
            <option value="PPPK">PPPK ({pppkCount})</option>
            <option value="Honor Sekolah">Honor Sekolah ({honorCount})</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-600">Tidak ada data guru yang sesuai kriteria pencarian.</p>
          <p className="text-xs text-slate-400 mt-1">Silakan sesuaikan kata kunci atau filter status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Profile with Photo & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={
                        teacher.fotoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={teacher.nama}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600/30 shadow-sm shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate" title={teacher.nama}>
                        {teacher.nama}
                      </h3>
                      <p className="text-xs text-emerald-700 font-semibold truncate">
                        {teacher.jabatan}
                      </p>
                      {teacher.pangkatGolongan && teacher.pangkatGolongan !== '-' && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {teacher.pangkatGolongan}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      teacher.status === 'PNS'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : teacher.status === 'PPPK'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {teacher.status}
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">NIP:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatNip(teacher.nip)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pendidikan:</span>
                    <span className="font-medium text-slate-700">{teacher.pendidikan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tugas Tambahan:</span>
                    <span className="font-semibold text-emerald-700 truncate max-w-[170px]" title={teacher.tugasTambahan || '-'}>
                      {teacher.tugasTambahan || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kontak:</span>
                    <span className="font-medium text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {teacher.kontak}
                    </span>
                  </div>
                </div>

                {/* Compact Barcode Preview */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center">
                  <NipBarcode nip={teacher.nip} height={26} narrowWidth={1.1} showText={false} />
                  <span className="text-[9px] font-mono text-slate-500 font-semibold tracking-wider pt-0.5">
                    BARCODE NIP &bull; {formatNip(teacher.nip)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Cetak Kartu, Edit, Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCardModal(teacher)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  title="Cetak Kartu Tanda Pengenal Guru"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Kartu</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(teacher)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition"
                  title="Edit Data Guru & Foto"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(teacher)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition"
                  title="Hapus Data Guru"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <TeacherModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaveTeacher={handleSaveTeacher}
        teacherToEdit={teacherToEdit}
      />

      <TeacherCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        teacher={teacherToPrint}
      />
    </div>
  );
};
