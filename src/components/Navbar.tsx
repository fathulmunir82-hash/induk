import React from 'react';
import { Users, BookOpen, FileText, Wifi, ShieldCheck, Home, UserCog } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLanModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenLanModal }) => {
  return (
    <header className="bg-emerald-800 text-white shadow-lg sticky top-0 z-40 print:hidden">
      {/* Top Banner / School ID */}
      <div className="bg-emerald-950 px-4 py-2 text-xs border-b border-emerald-700/50 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-600 text-emerald-100 font-semibold px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
            NPSN: {SCHOOL_INFO.npsn}
          </span>
          <span className="text-emerald-200 hidden sm:inline">
            {SCHOOL_INFO.alamat}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Operator: <strong className="text-white">{SCHOOL_INFO.operator}</strong>
          </span>
          <button
            onClick={onOpenLanModal}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-0.5 rounded text-xs transition shadow-sm font-medium"
            title="Akses Jaringan Lokal LAN"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Info LAN / Wi-Fi</span>
          </button>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner overflow-hidden p-1">
              <img
                src="/assets/aistudio/Screenshot_2026-10-16_170955_17080eba.png"
                alt="Logo UPTD SDN RAJASINGA 2"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                {SCHOOL_INFO.nama}
              </h1>
              <p className="text-xs text-emerald-200">Buku Induk Digital & Sistem Administrasi</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('buku-induk')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'buku-induk'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Buku Induk</span>
            </button>
            <button
              onClick={() => setActiveTab('guru')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'guru'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Guru</span>
            </button>
            <button
              onClick={() => setActiveTab('administrasi')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'administrasi'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Administrasi</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'users'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <UserCog className="w-4 h-4" />
              <span>Manajemen User</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden bg-emerald-900 border-t border-emerald-700 px-1 py-2 flex justify-around text-[10px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded ${
            activeTab === 'dashboard' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('buku-induk')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded ${
            activeTab === 'buku-induk' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Buku Induk</span>
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded ${
            activeTab === 'guru' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guru</span>
        </button>
        <button
          onClick={() => setActiveTab('administrasi')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded ${
            activeTab === 'administrasi' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Surat</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded ${
            activeTab === 'users' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-200'
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>User</span>
        </button>
      </div>
    </header>
  );
};
