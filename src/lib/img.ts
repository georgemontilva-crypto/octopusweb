/** Mobile-sized variants generated next to each image (name-sm.webp). */
export const small = () => typeof window !== "undefined" && (window.innerWidth < 900 || window.matchMedia("(hover: none)").matches);

export const smUrl = (src: string) => src.replace(/\.webp$/, "-sm.webp");
export const bgUrl = (src: string) => src.replace(/\.webp$/, "-bg.webp");

/** srcSet for a photo with a -sm variant. */
export const srcSet = (src: string, smW = 560, fullW = 1100) => `${smUrl(src)} ${smW}w, ${src} ${fullW}w`;
