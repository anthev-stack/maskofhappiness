export type PixelCrop = { x: number; y: number; width: number; height: number };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

export async function cropToPng(src: string, crop: PixelCrop) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const width = Math.max(1, Math.round(crop.width));
  const height = Math.max(1, Math.round(crop.height));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not crop this image.");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not crop this image.");
  return blob;
}
