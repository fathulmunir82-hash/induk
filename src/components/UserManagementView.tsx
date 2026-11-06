import React, { useState } from 'react';
import { SystemUser } from '../types';
import { Users, Plus, Shield, ShieldCheck, UserCheck, UserX, Trash2, Edit, KeyRound } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';

interface UserManagementViewProps {
  users: SystemUser[];
  onAddUser: (user: SystemUser) => void;
  onUpdateUser: (user: SystemUser) => void;
  onDeleteUser: (id: string) => void;
  currentUser: SystemUser | null;
  onLogout: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUser,
  onLogout
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Operator' | 'Kepala Sekolah' | 'Guru Kelas' | 'Tata Usaha'>('Guru Kelas');
  const [kelasPegang, setKelasPegang] = useState('1');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNip('');
    setNama('');
    setEmail('');
    setRole('Guru Kelas');
    setKelasPegang('1');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setNip(user.nip);
    setNama(user.nama);
    setEmail(user.email);
    setRole(user.role);
    setKelasPegang(user.kelasPegang || '1');
    setStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !nama) return;

    if (editingUser) {
      const updated: SystemUser = {
        ...editingUser,
        nip,
        nama,
        email,
        role,
        kelasPegang: role === 'Guru Kelas' ? kelasPegang : undefined,
        status
      };
      onUpdateUser(updated);
    } else {
      const newUser: SystemUser = {
        id: 'u_' + Date.now(),
        nip,
        nama,
        email,
        role,
        kelasPegang: role === 'Guru Kelas' ? kelasPegang : undefined,
        status,
        createdAt: Date.now()
      };
      onAddUser(newUser);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna (Login NIP)</h2>
          <p className="text-xs text-slate-500">Kelola NIP sebagai Username & Password untuk login ke sistem {SCHOOL_INFO.nama}</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <span className="text-slate-600">Login sebagai:</span>
              <strong className="text-emerald-900">{currentUser.nama} ({currentUser.role})</strong>
              <button
                onClick={onLogout}
                className="ml-2 bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition"
              >
                Keluar
              </button>
            </div>
          )}
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah User NIP</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">NIP (Username & Password)</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Wali Kelas / Tugas</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.nama}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono font-bold text-emerald-800 flex items-center gap-1.5 pt-4">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{u.nip}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.role === 'Operator' ? 'bg-purple-50 text-purple-700' :
                      u.role === 'Kepala Sekolah' ? 'bg-amber-50 text-amber-700' :
                      u.role === 'Guru Kelas' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {u.kelasPegang ? `Kelas ${u.kelasPegang}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      u.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.status === 'Aktif' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{u.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition"
                        title="Edit Pengguna"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus akses untuk ${u.nama}?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingUser ? 'Edit NIP Pengguna' : 'Tambah NIP Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">NIP (Digunakan untuk Login / Password) *</label>
                <input
                  type="text"
                  required
                  placeholder="19850315 201001 1 008"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fathul Munir, S.Pd."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Email Akun</label>
                <input
                  type="email"
                  placeholder="operator@rajasinga2.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Peran (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Operator">Operator</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Guru Kelas">Guru Kelas</option>
                    <option value="Tata Usaha">Tata Usaha</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Status Akses</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {role === 'Guru Kelas' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Wali Kelas Tingkat</label>
                  <select
                    value={kelasPegang}
                    onChange={(e) => setKelasPegang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow transition"
                >
                  Simpan NIP User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
