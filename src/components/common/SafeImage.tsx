import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackTitle?: string;
  fitMode?: 'default' | 'adaptive';
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackTitle,
  fitMode = 'default',
}) => {
  const [hasError, setHasError] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  useEffect(() => {
    setHasError(false);
    setNaturalRatio(null);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-9 h-9 text-amber-400/80 mb-2.5" strokeWidth={1.5} />
        <span className="text-xs font-medium text-slate-200 line-clamp-2 max-w-[200px]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setNaturalRatio(naturalWidth / naturalHeight);
    }
  };

  if (fitMode === 'adaptive') {
    const needsContain =
      naturalRatio !== null && (naturalRatio < 1.15 || naturalRatio > 2.15);

    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-slate-900/5 ${className}`}
      >
        {needsContain && (
          <>
            <img
              src={src}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-55 brightness-90 pointer-events-none select-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-slate-950/15 pointer-events-none"
            />
          </>
        )}
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
          className={`relative z-0 w-full h-full ${
            needsContain ? 'object-contain p-1.5 drop-shadow-md' : 'object-cover'
          } ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={() => setHasError(true)}
      className={`${className} ${imgClassName}`.trim()}
      loading="lazy"
      decoding="async"
    />
  );
};
