import React, { useRef } from 'react';
import { Teacher } from '../types';
import { X, Printer, QrCode, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';
import { NipBarcode } from './NipBarcode';
import { QRCodeSVG } from 'qrcode.react';
import { formatNip } from '../utils/barcode';

interface TeacherCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export const TeacherCardModal: React.FC<TeacherCardModalProps> = ({
  isOpen,
  onClose,
  teacher
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !teacher) return null;

  const formattedNip = formatNip(teacher.nip);
  const qrData = `NIP:${teacher.nip}|NAMA:${teacher.nama}|JABATAN:${teacher.jabatan}|STATUS:${teacher.status}|SEKOLAH:${SCHOOL_INFO.nama}|NPSN:${SCHOOL_INFO.npsn}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Kartu Tanda Pengenal Guru & Pegawai
              </h3>
              <p className="text-xs text-slate-500">{teacher.nama} &bull; NIP: {formattedNip}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview Container */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
            <div
              ref={printRef}
              id="printable-teacher-card"
              className="flex flex-col md:flex-row items-center justify-center gap-8 mx-auto max-w-3xl"
            >
              {/* KARTU DEPAN (FRONT CARD) */}
              <div className="w-[340px] h-[520px] rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-800 bg-white flex flex-col relative text-slate-900 select-none print:shadow-none print:border-emerald-900">
                {/* Header Kop Resmi */}
                <div className="bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800 text-white p-3 pt-3.5 pb-2.5 text-center relative border-b-2 border-amber-400">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img
                      src="/public/assets/aistudio/Screenshot_2026-10-16_170955_17080eba.png"
                      alt="Logo Sekolah"
                      className="w-10 h-10 object-contain drop-shadow"
                      onError={(e) => {
                        // Fallback in case of path issue
                        (e.target as HTMLImageElement).src = '/assets/aistudio/Screenshot_2026-10-16_170955_17080eba.png';
                      }}
                    />
                    <div className="leading-tight text-center">
                      <p className="text-[8px] font-semibold tracking-wider uppercase text-emerald-100">
                        PEMERINTAH KABUPATEN INDRAMAYU
                      </p>
                      <p className="text-[9px] font-bold tracking-wide uppercase text-amber-300">
                        DINAS PENDIDIKAN & KEBUDAYAAN
                      </p>
                      <h4 className="text-[12px] font-black tracking-wider uppercase text-white drop-shadow-sm">
                        UPTD SDN RAJASINGA 2
                      </h4>
                    </div>
                  </div>
                  <div className="bg-amber-400 text-emerald-950 text-[8.5px] font-extrabold uppercase tracking-widest py-0.5 rounded shadow-inner">
                    KARTU TANDA PENGENAL PEGAWAI
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-4 flex flex-col items-center justify-between bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
                  {/* Photo Frame */}
                  <div className="relative mt-1">
                    <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-emerald-700 shadow-md bg-slate-100">
                      <img
                        src={
                          teacher.fotoUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={teacher.nama}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`absolute -bottom-2 -right-1 text-[9px] font-black px-2 py-0.5 rounded-full border shadow ${
                        teacher.status === 'PNS'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : teacher.status === 'PPPK'
                          ? 'bg-amber-500 text-white border-amber-300'
                          : 'bg-emerald-600 text-white border-emerald-400'
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </div>

                  {/* Biodata Summary */}
                  <div className="text-center w-full px-2 space-y-0.5 mt-2">
                    <h5 className="font-extrabold text-[13px] text-slate-900 leading-tight">
                      {teacher.nama}
                    </h5>
                    <p className="text-[11px] font-mono font-bold text-emerald-800">
                      NIP. {formattedNip}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-600">
                      {teacher.jabatan}
                    </p>
                    {teacher.pangkatGolongan && teacher.pangkatGolongan !== '-' && (
                      <p className="text-[9px] font-medium text-slate-500">
                        {teacher.pangkatGolongan}
                      </p>
                    )}
                  </div>

                  {/* 1D LINEAR BARCODE FOR NIP */}
                  <div className="w-full bg-white py-1.5 px-2 rounded-lg border border-slate-200/90 shadow-sm flex flex-col items-center my-1">
                    <NipBarcode nip={teacher.nip} height={34} narrowWidth={1.3} showText={true} />
                  </div>

                  {/* Footer / QR Verification */}
                  <div className="w-full pt-1 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <QRCodeSVG value={qrData} size={36} level="M" />
                      <div className="leading-tight text-left">
                        <p className="font-bold text-emerald-900">VERIFIKASI DIGITAL</p>
                        <p className="font-mono text-[7px] text-slate-400">NPSN: {SCHOOL_INFO.npsn}</p>
                      </div>
                    </div>
                    <div className="text-right leading-tight">
                      <p className="text-[7.5px] text-slate-400">Indramayu, Terisi</p>
                      <p className="font-bold text-slate-800">Kepala Sekolah,</p>
                      <p className="text-[8px] font-bold text-emerald-800 pt-3 underline">
                        {SCHOOL_INFO.kepalaSekolah}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Accent Stripe */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-800" />
              </div>

              {/* KARTU BELAKANG (BACK CARD) */}
              <div className="w-[340px] h-[520px] rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-800 bg-white flex flex-col justify-between relative text-slate-900 select-none print:shadow-none print:border-emerald-900">
                {/* Header Back */}
                <div className="bg-emerald-800 text-white p-3 text-center border-b-2 border-amber-400">
                  <h5 className="text-[11px] font-bold tracking-wider uppercase">
                    KETENTUAN PENGGUNAAN KARTU
                  </h5>
                  <p className="text-[8px] text-emerald-200">UPTD SDN RAJASINGA 2</p>
                </div>

                {/* Rules & Information */}
                <div className="p-5 space-y-3.5 text-[10px] text-slate-700 leading-relaxed flex-1 flex flex-col justify-center">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                      1
                    </span>
                    <p>
                      Kartu ini adalah identitas pengenal resmi Pendidik & Tenaga Kependidikan di lingkungan <strong>UPTD SDN RAJASINGA 2</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                      2
                    </span>
                    <p>
                      Kartu wajib dibawa dan dikenakan selama jam dinas serta saat pelaksanaan kegiatan kedinasan pendidikan.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                      3
                    </span>
                    <p>
                      <strong>Barcode & QR Code</strong> memuat Nomor Induk Pegawai (NIP) resmi untuk validasi kehadiran elektronik dan sistem administrasi sekolah.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                      4
                    </span>
                    <p>
                      Apabila kartu ini hilang atau ditemukan, mohon untuk segera diserahkan kepada pihak sekolah:
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[8.5px] text-slate-600 space-y-0.5">
                    <p className="font-bold text-emerald-900">{SCHOOL_INFO.nama}</p>
                    <p>{SCHOOL_INFO.alamat}, Desa {SCHOOL_INFO.desa}</p>
                    <p>Kecamatan {SCHOOL_INFO.kecamatan}, Kab. {SCHOOL_INFO.kabupaten}</p>
                    <p className="text-emerald-700 font-semibold">NPSN: {SCHOOL_INFO.npsn}</p>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
                  <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>DOKUMEN RESMI SEKOLAH</span>
                  </div>
                  <span>Dicetak: {new Date().toLocaleDateString('id-ID')}</span>
                </div>

                <div className="h-1.5 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-800" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Format kartu sudah disesuaikan standar ID Card dengan Barcode NIP & QR Code resmi.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
