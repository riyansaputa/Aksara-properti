import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  label?: string;
  downloadFileName?: string;
  showDownload?: boolean;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 148,
  label,
  downloadFileName = 'qr-properti.png',
  showDownload = false,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value || 'https://aksararaya.id', {
      width: size * 2,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        // ignore invalid QR input
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-2xs"
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={label || 'QR Code Properti'}
            width={size - 16}
            height={size - 16}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 rounded animate-pulse" />
        )}
      </div>
      {label && <p className="text-[11px] text-slate-600 text-center max-w-[180px]">{label}</p>}
      {showDownload && dataUrl && (
        <a
          href={dataUrl}
          download={downloadFileName}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#A31C24]" />
          <span>Simpan QR (PNG)</span>
        </a>
      )}
    </div>
  );
};
