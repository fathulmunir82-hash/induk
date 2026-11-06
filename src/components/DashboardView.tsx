import React from 'react';
import { Student, Teacher, MutationLog } from '../types';
import { Users, UserCheck, GraduationCap, Building2, BookOpen, FileText, ArrowUpRight, Award, MapPin } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  mutations: MutationLog[];
  onNavigate: (tab: string) => void;
  onOpenAddStudent: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  teachers,
  mutations,
  onNavigate,
  onOpenAddStudent
}) => {
  const activeStudents = students.filter(s => s.status === 'Aktif');
  const lCount = activeStudents.filter(s => s.jenisKelamin === 'L').length;
  const pCount = activeStudents.filter(s => s.jenisKelamin === 'P').length;

  const classCounts = ['1', '2', '3', '4', '5', '6'].map(cls => {
    const count = activeStudents.filter(s => s.kelas === cls).length;
    const l = activeStudents.filter(s => s.kelas === cls && s.jenisKelamin === 'L').length;
    const p = activeStudents.filter(s => s.kelas === cls && s.jenisKelamin === 'P').length;
    return { kelas: cls, count, l, p };
  });

  const maxClassCount = Math.max(...classCounts.map(c => c.count), 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Sistem Informasi Buku Induk & Administrasi Sekolah Dasar
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {SCHOOL_INFO.operator}
            </h2>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              Pusat pengelolaan data kesiswaan, buku induk digital, mutasi, serta pencetakan QR Code dan administrasi resmi <strong className="text-white">{SCHOOL_INFO.nama}</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-200 pt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{SCHOOL_INFO.alamat}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenAddStudent}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
            <button
              onClick={() => onNavigate('buku-induk')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-sm border border-white/20 backdrop-blur transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buku Induk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Siswa Aktif</p>
            <h3 className="text-2xl font-bold text-slate-800">{activeStudents.length} <span className="text-sm font-normal text-slate-500">Siswa</span></h3>
            <p className="text-xs text-emerald-600 font-medium">L: {lCount} | P: {pCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dewan Guru & Pegawai</p>
            <h3 className="text-2xl font-bold text-slate-800">{teachers.length} <span className="text-sm font-normal text-slate-500">Orang</span></h3>
            <p className="text-xs text-blue-600 font-medium">PNS, PPPK & Honor</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor Pokok Sekolah (NPSN)</p>
            <h3 className="text-xl font-bold text-slate-800">{SCHOOL_INFO.npsn}</h3>
            <p className="text-xs text-amber-600 font-medium">Terakreditasi Sekolah Dasar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Log Mutasi / Riwayat</p>
            <h3 className="text-2xl font-bold text-slate-800">{mutations.length} <span className="text-sm font-normal text-slate-500">Catatan</span></h3>
            <p className="text-xs text-purple-600 font-medium">Sinkronisasi Real-Time</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Class Distribution & Quick Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Distribusi Siswa per Kelas</h3>
              <p className="text-xs text-slate-500">Jumlah siswa aktif di setiap tingkat kelas (Kelas 1 s.d. 6)</p>
            </div>
            <button
              onClick={() => onNavigate('buku-induk')}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {classCounts.map((item) => {
              const percentage = maxClassCount > 0 ? (item.count / maxClassCount) * 100 : 0;
              return (
                <div key={item.kelas} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Kelas {item.kelas}</span>
                    <span className="text-slate-600 font-medium">
                      {item.count} Siswa <span className="text-xs text-slate-400">(L: {item.l}, P: {item.p})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity / Mutation Log Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Riwayat & Mutasi</h3>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded-full">
                Immutable
              </span>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {mutations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Belum ada riwayat mutasi tercatat.</p>
              ) : (
                mutations.map((mut) => (
                  <div key={mut.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{mut.studentName}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {mut.jenisMutasi}
                      </span>
                    </div>
                    <p className="text-slate-600">{mut.keterangan}</p>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>NISN: {mut.nisn}</span>
                      <span>{mut.tanggal}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate('administrasi')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Buat Surat & Administrasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
