import React, { useState } from 'react';
import { Student, Teacher } from '../types';
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'student' | 'teacher';
  onImportStudents: (students: Student[]) => void;
  onImportTeachers: (teachers: Teacher[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onImportStudents,
  onImportTeachers
}) => {
  const [csvText, setCsvText] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    try {
      setErrorMsg(null);
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setErrorMsg('Format file kosong atau tidak memiliki baris data.');
        return;
      }

      const firstLine = lines[0];
      const separator = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
      const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

      const parsedRows = [];
      for (let i = 1; i < lines.length; i++) {
        const rowValues = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = rowValues[index] || '';
        });
        parsedRows.push(rowObj);
      }

      setPreviewData(parsedRows);
    } catch (err: any) {
      setErrorMsg('Gagal membaca file CSV: ' + err.message);
    }
  };

  const handleDownloadTemplate = () => {
    let header = '';
    let sampleRow = '';
    let fileName = '';

    if (type === 'student') {
      fileName = 'template_import_siswa_sdn_rajasinga2.csv';
      header = 'nis,nisn,nik,namaLengkap,tempatLahir,tanggalLahir,jenisKelamin,agama,namaAyah,namaIbu,pekerjaanOrtu,alamat,kelas,status,tahunMasuk,tanggalMasuk\n';
      sampleRow = '1050,3152849104,3212044101150099,Siti Aminah,Indramayu,2015-05-12,P,Islam,Suryana,Wati,Petani,Blok Desa RT 01/02,6,Aktif,2020,2020-07-15';
    } else {
      fileName = 'template_import_guru_sdn_rajasinga2.csv';
      header = 'nip,nama,jabatan,pendidikan,kontak,status,tugasTambahan\n';
      sampleRow = '198501012010011001,Ahmad Dahlan S.Pd.,Guru Kelas 4,S1 PGSD,08123456789,PNS,Pembina UKS';
    }

    const blob = new Blob([header + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    if (previewData.length === 0) return;

    if (type === 'student') {
      const newStudents: Student[] = previewData.map((row, idx) => ({
        id: 'imp_s_' + Date.now() + '_' + idx,
        nis: row.nis || String(1050 + idx),
        nisn: row.nisn || '320' + Math.floor(Math.random() * 899999 + 100000),
        nik: row.nik || '3212' + Math.floor(Math.random() * 899999999999 + 100000000000),
        namaLengkap: row.namaLengkap || 'Siswa Baru ' + (idx + 1),
        tempatLahir: row.tempatLahir || 'Indramayu',
        tanggalLahir: row.tanggalLahir || '2015-01-01',
        jenisKelamin: (row.jenisKelamin === 'P' ? 'P' : 'L') as ('L' | 'P'),
        agama: row.agama || 'Islam',
        namaAyah: row.namaAyah || '-',
        namaIbu: row.namaIbu || '-',
        pekerjaanOrtu: row.pekerjaanOrtu || 'Petani',
        alamat: row.alamat || 'Desa Rajasinga',
        kelas: (['1', '2', '3', '4', '5', '6'].includes(row.kelas) ? row.kelas : '1') as any,
        status: (['Aktif', 'Mutasi Keluar', 'Pindah Masuk', 'Lulus'].includes(row.status) ? row.status : 'Aktif') as any,
        tahunMasuk: row.tahunMasuk || '2025',
        tanggalMasuk: row.tanggalMasuk || new Date().toISOString().split('T')[0],
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        kkPdfUrl: '',
        kkFileName: '',
        kkUploadedAt: '',
        aktePdfUrl: '',
        akteFileName: '',
        akteUploadedAt: '',
        legerDokumen: [],
        kelulusanInfo: { statusKelulusan: 'Belum Lulus', nomorIjazah: '', catatanKelulusan: '' },
        createdAt: Date.now()
      }));

      onImportStudents(newStudents);
      setSuccessCount(newStudents.length);
    } else {
      const newTeachers: Teacher[] = previewData.map((row, idx) => ({
        id: 'imp_t_' + Date.now() + '_' + idx,
        nip: row.nip || '-',
        nama: row.nama || 'Guru Baru ' + (idx + 1),
        jabatan: row.jabatan || 'Guru Kelas',
        pendidikan: row.pendidikan || 'S1 PGSD',
        kontak: row.kontak || '-',
        status: (['PNS', 'PPPK', 'Honor Sekolah'].includes(row.status) ? row.status : 'PNS') as any,
        tugasTambahan: row.tugasTambahan || '-'
      }));

      onImportTeachers(newTeachers);
      setSuccessCount(newTeachers.length);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Impor Data {type === 'student' ? 'Siswa' : 'Guru'} dari Excel / CSV
              </h3>
              <p className="text-xs text-slate-500">{SCHOOL_INFO.nama}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successCount !== null ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-lg">Impor Berhasil!</h4>
            <p className="text-sm text-emerald-700">
              Berhasil menambahkan <strong className="text-emerald-900">{successCount}</strong> data {type === 'student' ? 'siswa' : 'guru'} baru ke sistem.
            </p>
            <button
              onClick={() => {
                setSuccessCount(null);
                setPreviewData([]);
                onClose();
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Selesai
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Unduh Format Templat CSV</h4>
                <p className="text-xs text-slate-500">Gunakan templat ini agar kolom terbaca dengan sempurna.</p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Templat</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Pilih Berkas Excel / CSV (.csv)</label>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Pratinjau Data ({previewData.length} baris siap diimpor):
                </span>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 text-xs font-mono">
                  {previewData.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="py-1 border-b border-slate-200/60 truncate">
                      {idx + 1}. {row.namaLengkap || row.nama} (NIS: {row.nis || '-'}, NISN: {row.nisn || row.nip})
                    </div>
                  ))}
                  {previewData.length > 5 && (
                    <div className="text-center text-slate-400 py-1">...dan {previewData.length - 5} baris lainnya.</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={previewData.length === 0}
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Impor {previewData.length} Data Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
