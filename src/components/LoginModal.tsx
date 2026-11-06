import React, { useState } from 'react';
import { SystemUser } from '../types';
import { SCHOOL_INFO } from '../lib/firebase';
import { KeyRound, User, Lock, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  users: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, users, onLoginSuccess }) => {
  const [nipInput, setNipInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const foundUser = users.find(u => u.nip.trim() === nipInput.trim() && u.status === 'Aktif');
    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      setErrorMsg('NIP tidak ditemukan atau akun nonaktif. Gunakan NIP yang terdaftar di Manajemen User.');
    }
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-scaleUp border border-emerald-100">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <GraduationCap className="w-8 h-8 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{SCHOOL_INFO.nama}</h2>
            <p className="text-xs text-emerald-700 font-semibold pt-0.5">Sistem Buku Induk Digital & Administrasi</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>NIP (Nomor Induk Pegawai) - Username & Password</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Masukkan NIP Anda..."
                value={nipInput}
                onChange={(e) => setNipInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition shadow-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Contoh NIP Operator: <strong className="font-mono text-emerald-700">19850315 201001 1 008</strong>
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          <p>NPSN: {SCHOOL_INFO.npsn} &bull; {SCHOOL_INFO.kabupaten}</p>
        </div>
      </div>
    </div>
  );
};
