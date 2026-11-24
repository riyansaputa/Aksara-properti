import React from 'react';
import { Heart, Trash2, X } from 'lucide-react';
import { formatCompactRupiah } from '../../services/storageService';
import { Property } from '../../types';
import { SafeImage } from '../common/SafeImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistProperties: Property[];
  onClose: () => void;
  onRemoveWishlist: (id: string) => void;
  onOpenDetail: (property: Property) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistProperties,
  onClose,
  onRemoveWishlist,
  onOpenDetail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-label="Unit Favorit Anda"
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-[#8B1522] text-[#8B1522]" />
            <h2 className="font-display text-base font-bold text-slate-950">
              Unit Favorit ({wishlistProperties.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar favorit"
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {wishlistProperties.length === 0 ? (
            <div className="py-16 text-center">
              <Heart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Belum ada unit di daftar favorit
              </p>
              <p className="text-xs text-slate-500">
                Ketuk ikon hati pada kartu properti untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            wishlistProperties.map((unit) => (
              <div
                key={unit.id}
                className="flex gap-3.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <SafeImage
                    src={unit.imageUrl}
                    alt={unit.name}
                    fitMode="adaptive"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-500 truncate">{unit.cluster}</p>
                  <h3 className="font-display text-sm font-bold text-slate-950 truncate">
                    {unit.name}
                  </h3>
                  <p className="font-mono text-sm font-semibold text-[#8B1522] tabular-nums mt-0.5">
                    {formatCompactRupiah(unit.price)}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDetail(unit);
                      }}
                      className="text-xs font-semibold text-slate-900 hover:text-[#8B1522] underline underline-offset-2 cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveWishlist(unit.id)}
                      aria-label={`Hapus ${unit.name} dari favorit`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
