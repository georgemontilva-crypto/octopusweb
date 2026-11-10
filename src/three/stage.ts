/**
 * Real 3D products (tube = cylinder with the unwrapped label, dabs box = prism with its rectified faces).
 * ONE offscreen WebGL renderer draws each product and copies the pixels into a plain <canvas> that lives
 * inside the page. The canvases scroll natively with the content (no fixed overlay chasing the scroll),
 * nothing intercepts touch, and rendering pauses while the user scrolls.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { isTouch, reducedMotion } from "../lib/theme";
import { small, smUrl } from "../lib/img";
import { isScrolling } from "../lib/motion";

export type Kind = "tube" | "box";
export type SlotOpts = {
  kind: Kind;
  color: string;
  tex: { tube: string; front: string | null; side: string | null };
  yaw?: number;
  fill?: number;
  sway?: number;
  phase?: number;
  /** slow continuous turn instead of a sway */
  spin?: boolean;
};

type Slot = {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  o: SlotOpts;
  group: THREE.Group;
  cam: THREE.PerspectiveCamera;
  visible: boolean;
  w: number;
  h: number;
  hoverX: number;
  hoverY: number;
  tHoverX: number;
  tHoverY: number;
  dragYaw: number;
  dragging: boolean;
  rim: THREE.Color;
  born: number;
  drawn: boolean;
  cleanup: () => void;
};

const TUBE_H = 1;
const TUBE_R = TUBE_H / 5.99 / 2;
const BOX_H = 1;
const BOX_W = BOX_H * 0.259;

class Stage {
  renderer: THREE.WebGLRenderer | null = null;
  scene = new THREE.Scene();
  slots = new Set<Slot>();
  loader = new THREE.TextureLoader();
  texCache = new Map<string, THREE.Texture>();
  rimL!: THREE.DirectionalLight;
  raf = 0;
  io: IntersectionObserver | null = null;
  ro: ResizeObserver | null = null;
  failed = false;
  touch = false;
  dpr = 1;
  lastFrame = 0;

  init() {
    if (this.renderer || this.failed) return;
    try {
      this.touch = isTouch();
      this.dpr = Math.min(window.devicePixelRatio || 1, this.touch ? 1.5 : 2);
      const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: this.touch ? "default" : "high-performance" });
      r.setPixelRatio(1);
      r.setSize(256, 256, false);
      r.setClearColor(0x000000, 0);
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.05;
      this.renderer = r;

      const pmrem = new THREE.PMREMGenerator(r);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environmentIntensity = 0.55;
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(1.5, 2, 3);
      this.rimL = new THREE.DirectionalLight(0x7b3cff, 3.2);
      this.rimL.position.set(-3, 1, -1.5);
      const rimR = new THREE.DirectionalLight(0xff2bb3, 2.2);
      rimR.position.set(3, -0.5, -1.5);
      this.scene.add(key, this.rimL, rimR);

      this.io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) for (const s of this.slots) if (s.host === e.target) s.visible = e.isIntersecting;
        },
        { rootMargin: "80px 0px" },
      );
      this.ro = new ResizeObserver((entries) => {
        for (const e of entries) for (const s of this.slots) if (s.host === e.target) this.size(s);
      });
      this.raf = requestAnimationFrame(this.loop);
    } catch (err) {
      console.warn("3D disabled", err);
      this.failed = true;
    }
  }

  tex(src: string, kind: "tube" | "face") {
    const url = small() ? smUrl(src) : src;
    let t = this.texCache.get(url);
    if (!t) {
      t = this.loader.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = this.touch ? 4 : 8;
      if (kind === "tube") {
        t.wrapS = THREE.MirroredRepeatWrapping;
        t.repeat.set(2, 1);
        t.offset.set(0.5, 0);
      }
      this.texCache.set(url, t);
    }
    return t;
  }

  build(o: SlotOpts) {
    const g = new THREE.Group();
    const accent = new THREE.Color(o.color);
    if (o.kind === "tube") {
      g.add(new THREE.Mesh(
        new THREE.CylinderGeometry(TUBE_R, TUBE_R, TUBE_H, this.touch ? 64 : 128, 1, true),
        new THREE.MeshPhysicalMaterial({ map: this.tex(o.tex.tube, "tube"), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }),
      ));
      const capMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b10, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
      const top = new THREE.Mesh(new THREE.CircleGeometry(TUBE_R, 48), capMat);
      top.rotation.x = -Math.PI / 2;
      top.position.y = TUBE_H / 2;
      const bottom = top.clone();
      bottom.rotation.x = Math.PI / 2;
      bottom.position.y = -TUBE_H / 2;
      g.add(top, bottom);
    } else {
      const front = new THREE.MeshPhysicalMaterial({ map: this.tex(o.tex.front!, "face"), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
      const side = new THREE.MeshPhysicalMaterial({ map: this.tex(o.tex.side!, "face"), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
      const cap = new THREE.MeshPhysicalMaterial({ color: accent.clone().multiplyScalar(0.35), roughness: 0.5 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(BOX_W, BOX_H, BOX_W), [side, side, cap, cap, front, front]));
    }
    return g;
  }

  size(s: Slot) {
    const r = s.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * this.dpr));
    const h = Math.max(1, Math.round(r.height * this.dpr));
    if (w !== s.w || h !== s.h) {
      s.w = w;
      s.h = h;
      s.canvas.width = w;
      s.canvas.height = h;
      s.drawn = false;
    }
  }

  add(host: HTMLElement, o: SlotOpts) {
    this.init();
    if (this.failed || !this.renderer) return () => {};
    const canvas = document.createElement("canvas");
    canvas.className = "p3d-canvas";
    host.appendChild(canvas);
    const group = this.build(o);
    group.visible = false;
    this.scene.add(group);
    const s: Slot = {
      host, canvas, ctx: canvas.getContext("2d")!, o, group,
      cam: new THREE.PerspectiveCamera(24, 1, 0.05, 50),
      visible: false, w: 0, h: 0,
      hoverX: 0, hoverY: 0, tHoverX: 0, tHoverY: 0, dragYaw: 0, dragging: false,
      rim: new THREE.Color(o.color), born: performance.now(), drawn: false,
      cleanup: () => {},
    };
    // desktop only: hover tilt + drag. On touch devices nothing listens, so scrolling is never intercepted.
    if (!this.touch) {
      let lastX = 0;
      const move = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        s.tHoverX = ((e.clientX - r.left) / r.width - 0.5) * 2;
        s.tHoverY = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (s.dragging) {
          s.dragYaw += (e.clientX - lastX) * 0.012;
          lastX = e.clientX;
        }
      };
      const down = (e: PointerEvent) => {
        s.dragging = true;
        lastX = e.clientX;
      };
      const up = () => (s.dragging = false);
      const leave = () => {
        s.tHoverX = s.tHoverY = 0;
        s.dragging = false;
      };
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerdown", down);
      window.addEventListener("pointerup", up);
      host.addEventListener("pointerleave", leave);
      s.cleanup = () => {
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerdown", down);
        window.removeEventListener("pointerup", up);
        host.removeEventListener("pointerleave", leave);
      };
    }
    this.slots.add(s);
    this.size(s);
    this.io?.observe(host);
    this.ro?.observe(host);
    return () => {
      s.cleanup();
      this.io?.unobserve(host);
      this.ro?.unobserve(host);
      canvas.remove();
      this.scene.remove(group);
      group.traverse((c) => (c as THREE.Mesh).geometry?.dispose());
      this.slots.delete(s);
    };
  }

  loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const r = this.renderer;
    if (!r || document.hidden) return;
    // phones: 30fps, and no 3D work at all while the user is scrolling (keeps scrolling buttery)
    if (this.touch) {
      if (now - this.lastFrame < 32) return;
      if (isScrolling()) return;
    }
    this.lastFrame = now;
    const t = (now / 1000) * (reducedMotion() ? 0.2 : 1);
    for (const s of this.slots) {
      if (!s.visible || s.w < 2 || s.h < 2) continue;
      const o = s.o;
      s.hoverX += (s.tHoverX - s.hoverX) * 0.08;
      s.hoverY += (s.tHoverY - s.hoverY) * 0.08;
      if (!s.dragging) s.dragYaw *= 0.94;
      s.dragYaw = Math.max(-1.3, Math.min(1.3, s.dragYaw));
      const ph = o.phase ?? 0;
      const g = s.group;
      const base = o.spin ? t * 0.45 : (o.sway ?? 0.32) * Math.sin(t * 0.7 + ph);
      g.rotation.y = (o.yaw ?? 0) + base + s.dragYaw + s.hoverX * 0.35;
      g.rotation.x = s.hoverY * 0.12 + Math.sin(t * 0.9 + ph) * 0.03;
      g.rotation.z = Math.sin(t * 0.5 + ph) * 0.025;
      g.position.y = Math.sin(t * 1.1 + ph) * 0.02;
      const k = Math.min(1, (now - s.born) / 280);
      g.scale.setScalar(0.92 + 0.08 * (1 - Math.pow(1 - k, 3)));

      const aspect = s.w / s.h;
      const fill = o.fill ?? 0.84;
      const tan = Math.tan(((s.cam.fov * Math.PI) / 180) / 2);
      const objW = o.kind === "tube" ? TUBE_R * 2.4 : BOX_W * 1.9;
      const dist = Math.max(1.08 / fill / 2 / tan, objW / fill / 2 / tan / aspect);
      s.cam.aspect = aspect;
      s.cam.position.set(0, 0.02, dist);
      s.cam.lookAt(0, 0, 0);
      s.cam.updateProjectionMatrix();
      this.rimL.color.copy(s.rim);

      // grow the shared drawing buffer if needed, render, copy into the slot's own canvas
      const cw = r.domElement.width, ch = r.domElement.height;
      if (s.w > cw || s.h > ch) r.setSize(Math.max(s.w, cw), Math.max(s.h, ch), false);
      const H = r.domElement.height;
      for (const other of this.slots) other.group.visible = other === s;
      r.setScissorTest(true);
      r.setViewport(0, 0, s.w, s.h);
      r.setScissor(0, 0, s.w, s.h);
      r.clear();
      r.render(this.scene, s.cam);
      s.ctx.clearRect(0, 0, s.w, s.h);
      s.ctx.drawImage(r.domElement, 0, H - s.h, s.w, s.h, 0, 0, s.w, s.h);
      s.drawn = true;
    }
  };
}

export const stage = new Stage();
