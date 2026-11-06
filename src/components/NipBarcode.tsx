import React, { useMemo } from 'react';
import { generateBarcodeElements, formatNip } from '../utils/barcode';

interface NipBarcodeProps {
  nip: string;
  height?: number;
  narrowWidth?: number;
  showText?: boolean;
  className?: string;
  textColor?: string;
}

export const NipBarcode: React.FC<NipBarcodeProps> = ({
  nip,
  height = 42,
  narrowWidth = 1.6,
  showText = true,
  className = '',
  textColor = 'text-slate-800'
}) => {
  const { elements, totalWidth } = useMemo(() => {
    return generateBarcodeElements(nip || '0', narrowWidth, 2.4, 8);
  }, [nip, narrowWidth]);

  const formatted = useMemo(() => formatNip(nip), [nip]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[260px] h-auto drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
        style={{ minHeight: `${height}px` }}
        preserveAspectRatio="xMidYMid meet"
        aria-label={`Barcode NIP: ${nip}`}
        role="img"
      >
        <rect x="0" y="0" width={totalWidth} height={height} fill="#ffffff" rx="2" />
        {elements.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.width}
            height={height - 4}
            fill="#0f172a"
          />
        ))}
      </svg>
      {showText && (
        <span className={`text-[10px] font-mono tracking-wider font-bold mt-1 ${textColor}`}>
          * {formatted} *
        </span>
      )}
    </div>
  );
};
