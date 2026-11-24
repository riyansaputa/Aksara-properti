export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
  sizeKb: number;
}

interface ProcessImageOptions {
  maxDimension?: number;
  quality?: number;
  preserveTransparency?: boolean;
}

export function getOrientationLabel(width: number, height: number): 'landscape' | 'portrait' | 'square' {
  if (!width || !height) return 'landscape';
  const ratio = width / height;
  if (ratio > 1.12) return 'landscape';
  if (ratio < 0.9) return 'portrait';
  return 'square';
}

export async function processImageFileToDataUrl(
  file: File,
  options: ProcessImageOptions = {}
): Promise<ProcessedImageResult> {
  const { maxDimension = 1400, quality = 0.85, preserveTransparency = false } = options;

  if (!file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan gambar. Pilih file JPG, PNG, atau WebP dari galeri.');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca file gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  // Pertahankan SVG vektor tanpa rasterisasi
  if (file.type === 'image/svg+xml') {
    return {
      dataUrl: rawDataUrl,
      width: 400,
      height: 120,
      orientation: 'landscape',
      sizeKb: Math.max(1, Math.round((rawDataUrl.length * 0.75) / 1024)),
    };
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Format gambar tidak didukung oleh browser ini.'));
    el.src = rawDataUrl;
  });

  const naturalWidth = img.naturalWidth || 1200;
  const naturalHeight = img.naturalHeight || 900;
  const maxSide = Math.max(naturalWidth, naturalHeight);
  const scale = maxSide > maxDimension ? maxDimension / maxSide : 1;

  const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
  const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      dataUrl: rawDataUrl,
      width: naturalWidth,
      height: naturalHeight,
      orientation: getOrientationLabel(naturalWidth, naturalHeight),
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const isPngLike = file.type === 'image/png' || file.type === 'image/webp';
  if (!preserveTransparency || !isPngLike) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let outputDataUrl: string;
  if (preserveTransparency && isPngLike) {
    outputDataUrl = canvas.toDataURL('image/png');
    if (outputDataUrl.length > 420 * 1024) {
      const webpCandidate = canvas.toDataURL('image/webp', 0.88);
      if (webpCandidate.startsWith('data:image/webp')) {
        outputDataUrl = webpCandidate;
      }
    }
  } else {
    outputDataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  return {
    dataUrl: outputDataUrl,
    width: targetWidth,
    height: targetHeight,
    orientation: getOrientationLabel(targetWidth, targetHeight),
    sizeKb: Math.max(1, Math.round((outputDataUrl.length * 0.75) / 1024)),
  };
}
