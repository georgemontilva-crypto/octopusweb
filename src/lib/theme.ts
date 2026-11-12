// Tiny global store for the abyss tint + shared motion state
export type RGB = [number, number, number];

export const hexToRgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const DEFAULT_A = "#7b3cff";
export const DEFAULT_B = "#ff2bb3";

export const theme = {
  a: hexToRgb(DEFAULT_A) as RGB,
  b: hexToRgb(DEFAULT_B) as RGB,
  pulse: 0, // ink burst intensity, decays in shader loop
  pulseX: 0.5,
  pulseY: 0.5,
};

export function setTint(a: string, b: string) {
  theme.a = hexToRgb(a);
  theme.b = hexToRgb(b);
  const root = document.documentElement.style;
  root.setProperty("--tint-a", a);
  root.setProperty("--tint-b", b);
  // the whole site takes the flavor's color
  root.setProperty("--flavor", a);
  const [r, g, bl] = theme.a;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  root.setProperty("--on-flavor", lum > 0.55 ? "#0b0812" : "#ffffff");
}

export function resetTint() {
  setTint(DEFAULT_A, DEFAULT_B);
}

export function inkPulse(x: number, y: number) {
  theme.pulse = 1;
  theme.pulseX = x / window.innerWidth;
  theme.pulseY = 1 - y / window.innerHeight;
}

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const storage = {
  get(k: string) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};
