/** Loads an image file into an HTMLImageElement. Caller gets decoded dimensions. */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read "${file.name}". Please make sure it is a valid image.`));
    };
    img.src = url;
  });
}

/**
 * Draw a photo onto a canvas, honoring EXIF orientation when the browser
 * supports it. Used only when a file cannot be cleaned without re-encoding.
 */
export async function rasterizeToBlob(file: File, type: string, quality = 0.92): Promise<Blob> {
  let width = 0;
  let height = 0;
  let draw: (ctx: CanvasRenderingContext2D) => void = () => {};
  let close = () => {};

  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      width = bmp.width;
      height = bmp.height;
      draw = (ctx) => ctx.drawImage(bmp, 0, 0);
      close = () => bmp.close();
    } catch {
      const img = await loadImage(file);
      width = img.naturalWidth;
      height = img.naturalHeight;
      draw = (ctx) => ctx.drawImage(img, 0, 0);
    }
  } else {
    const img = await loadImage(file);
    width = img.naturalWidth;
    height = img.naturalHeight;
    draw = (ctx) => ctx.drawImage(img, 0, 0);
  }

  if (!width || !height) {
    close();
    throw new Error(`Could not read "${file.name}". Please make sure it is a valid image.`);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    close();
    throw new Error("Your browser could not clean this photo.");
  }
  if (type === "image/jpeg" || type === "image/webp") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  draw(ctx);
  try {
    return await canvasToBlob(canvas, type, type === "image/png" ? undefined : quality);
  } finally {
    close();
  }
}

/** Promise wrapper around canvas.toBlob with a clear failure message. */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Your browser could not encode this image. Try a different output format."));
      },
      type,
      quality
    );
  });
}
