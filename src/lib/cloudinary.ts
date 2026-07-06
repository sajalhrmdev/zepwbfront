const CLOUDINARY_BASE = "res.cloudinary.com";

export function optimizeImageUrl(url: string, width?: number): string {
  if (!url || !url.includes(CLOUDINARY_BASE)) return url;

  const parts = url.split("/image/upload/");
  if (parts.length !== 2) return url;

  let transforms = "f_auto,q_auto";
  if (width) transforms += `,w_${width}`;

  return `${parts[0]}/image/upload/${transforms}/${parts[1]}`;
}
