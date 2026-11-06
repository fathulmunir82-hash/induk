import React, { useEffect, useState } from 'react';
import { X, Wifi, Globe, ShieldCheck, Copy, Check } from 'lucide-react';
import { SCHOOL_INFO } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';

interface LanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanInfoModal: React.FC<LanInfoModalProps> = ({ isOpen, onClose }) => {
  const [lanInfo, setLanInfo] = useState<{ port: number; ipAddresses: string[] }>({
    port: 3000,
    ipAddresses: []
  });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/lan-info')
        .then(res => res.json())
        .then(data => setLanInfo(data))
        .catch(() => {
          // Fallback if API is not available
          setLanInfo({
            port: 3000,
            ipAddresses: [window.location.hostname]
          });
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const primaryIp = lanInfo.ipAddresses[0] || window.location.hostname;
  const lanUrl = `http://${primaryIp}:${lanInfo.port}`;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Akses Jaringan Lokal LAN / Wi-Fi</h3>
              <p className="text-xs text-slate-500">{SCHOOL_INFO.nama}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
            Agar guru-guru lain di ruang guru atau kelas dapat mengakses aplikasi <strong className="text-slate-800">{SCHOOL_INFO.nama}</strong> secara bersamaan, pastikan perangkat terhubung ke <strong className="text-emerald-700">Wi-Fi / LAN yang sama</strong>.
          </p>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">URL Akses LAN Utama</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                Port {lanInfo.port}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-emerald-200">
              <code className="text-sm font-mono font-bold text-emerald-900">{lanUrl}</code>
              <button
                onClick={() => handleCopy(lanUrl)}
                className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
              >
                {copiedUrl === lanUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl === lanUrl ? 'Disalin!' : 'Salin URL'}</span>
              </button>
            </div>
          </div>

          {lanInfo.ipAddresses.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Alternatif IP Address Terdeteksi:</span>
              <div className="space-y-1.5">
                {lanInfo.ipAddresses.map((ip, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                    <span className="font-mono font-medium text-slate-750">http://{ip}:{lanInfo.port}</span>
                    <button
                      onClick={() => handleCopy(`http://${ip}:${lanInfo.port}`)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code for quick mobile / laptop scanner */}
          <div className="flex flex-col items-center justify-center pt-2 space-y-2">
            <span className="text-xs font-medium text-slate-500">Scan QR untuk Buka di HP / Perangkat Lain:</span>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
              <QRCodeSVG value={lanUrl} size={140} level="H" includeMargin={true} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
