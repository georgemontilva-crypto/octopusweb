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

export type Kind = "tube" | "box" | "cube";
export type SlotOpts = {
  kind: Kind;
  color: string;
  tex: { tube: string; front: string | null; side: string | null; cube?: { front: string; side: string; top: string } };
  yaw?: number;
  fill?: number;
  sway?: number;
  phase?: number;
  /** slow continuous turn instead of a sway */
  spin?: boolean;
  /** tube with a separate cap and a pre-roll inside (for the "pop the top" scene) */
  pop?: boolean;
  /** external control (viewer / scroll scenes). Read every frame. */
  ctrl?: Ctrl;
  /** keep rendering while the page scrolls (sticky scenes) */
  live?: boolean;
};

export type Ctrl = { yaw: number; pitch: number; zoom: number; progress: number };

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
// small dabs box (cube-ish): width : height : depth
const CUBE_W = 0.62, CUBE_H = 0.48, CUBE_D = 0.56;

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
      const rimR = new THREE.DirectionalLight(0xfff4ea, 1.6);
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
    if (o.kind === "tube" && o.pop) {
      this.buildPop(g, o);
    } else if (o.kind === "tube") {
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
    } else if (o.kind === "cube" && o.tex.cube) {
      const m = (src: string) => new THREE.MeshPhysicalMaterial({ map: this.tex(src, "face"), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
      const front = m(o.tex.cube.front), side = m(o.tex.cube.side), top = m(o.tex.cube.top);
      const under = new THREE.MeshStandardMaterial({ color: accent.clone().multiplyScalar(0.3), roughness: 0.6 });
      // +x, -x, +y, -y, +z, -z
      g.add(new THREE.Mesh(new THREE.BoxGeometry(CUBE_W, CUBE_H, CUBE_D), [side, side, top, under, front, front]));
    } else {
      const front = new THREE.MeshPhysicalMaterial({ map: this.tex(o.tex.front!, "face"), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
      const side = new THREE.MeshPhysicalMaterial({ map: this.tex(o.tex.side!, "face"), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
      const cap = new THREE.MeshPhysicalMaterial({ color: accent.clone().multiplyScalar(0.35), roughness: 0.5 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(BOX_W, BOX_H, BOX_W), [side, side, cap, cap, front, front]));
    }
    return g;
  }

  /** Tube body + separate cap (top 7.9% of the label) + a pre-roll hidden inside. */
  buildPop(g: THREE.Group, o: SlotOpts) {
    const CAP = 0.079;
    const base = this.tex(o.tex.tube, "tube");
    const bodyTex = base.clone();
    bodyTex.repeat.set(2, 1 - CAP);
    bodyTex.needsUpdate = true;
    const capTex = base.clone();
    capTex.repeat.set(2, CAP);
    capTex.offset.set(0.5, 1 - CAP);
    capTex.needsUpdate = true;
    const segs = this.touch ? 64 : 128;
    const bodyH = TUBE_H * (1 - CAP);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(TUBE_R, TUBE_R, bodyH, segs, 1, true),
      new THREE.MeshPhysicalMaterial({ map: bodyTex, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }),
    );
    body.position.y = -TUBE_H / 2 + bodyH / 2;
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(TUBE_R * 0.97, TUBE_R * 0.97, bodyH, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x0c0c12, side: THREE.BackSide, roughness: 0.6 }));
    inner.position.copy(body.position);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(TUBE_R, 48), new THREE.MeshPhysicalMaterial({ color: 0x0b0b10, roughness: 0.3, clearcoat: 1 }));
    bottom.rotation.x = Math.PI / 2;
    bottom.position.y = -TUBE_H / 2;
    const tube = new THREE.Group();
    tube.name = "tubeBody";
    tube.add(body, inner, bottom);

    const capH = TUBE_H * CAP;
    const cap = new THREE.Group();
    cap.name = "cap";
    const capSide = new THREE.Mesh(
      new THREE.CylinderGeometry(TUBE_R * 1.03, TUBE_R * 1.03, capH, segs, 1, true),
      new THREE.MeshPhysicalMaterial({ map: capTex, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1 }),
    );
    const capTop = new THREE.Mesh(new THREE.CircleGeometry(TUBE_R * 1.03, 48), new THREE.MeshPhysicalMaterial({ color: 0x0b0b10, roughness: 0.25, clearcoat: 1 }));
    capTop.rotation.x = -Math.PI / 2;
    capTop.position.y = capH / 2;
    cap.add(capSide, capTop);
    cap.position.y = TUBE_H / 2 - capH / 2;
    cap.userData.y0 = cap.position.y;

    // pre-roll: cardboard crutch + paper cone with a twisted tip
    const L = TUBE_H * 0.86;
    const R = TUBE_R * 0.86;
    const pre = new THREE.Group();
    pre.name = "preroll";
    const crutch = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.6, L * 0.2, 32), new THREE.MeshStandardMaterial({ color: 0xd9b98a, roughness: 0.9 }));
    crutch.position.y = -L / 2 + L * 0.1;
    const pts: THREE.Vector2[] = [];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = -L / 2 + L * 0.2 + t * L * 0.72;
      pts.push(new THREE.Vector2(R * (0.62 + 0.38 * t), y));
    }
    pts.push(new THREE.Vector2(R * 0.55, L / 2 - L * 0.03));
    pts.push(new THREE.Vector2(R * 0.12, L / 2));
    const paper = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), new THREE.MeshStandardMaterial({ map: paperTex(), color: 0xffffff, roughness: 0.9 }));
    pre.add(crutch, paper);
    pre.position.y = -TUBE_H * 0.02;
    pre.userData.y0 = pre.position.y;
    g.add(tube, cap, pre);
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
    // draw on the very next frame if already on screen (no blank frame while the observer catches up)
    const rr = host.getBoundingClientRect();
    s.visible = rr.bottom > -80 && rr.top < window.innerHeight + 80;
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
    }
    const scrolling = this.touch && isScrolling();
    this.lastFrame = now;
    const t = (now / 1000) * (reducedMotion() ? 0.2 : 1);
    for (const s of this.slots) {
      if (!s.visible || s.w < 2 || s.h < 2) continue;
      const o = s.o;
      if (scrolling && !o.live) continue;
      s.hoverX += (s.tHoverX - s.hoverX) * 0.08;
      s.hoverY += (s.tHoverY - s.hoverY) * 0.08;
      if (!s.dragging) s.dragYaw *= 0.94;
      s.dragYaw = Math.max(-1.3, Math.min(1.3, s.dragYaw));
      const ph = o.phase ?? 0;
      const g = s.group;
      const base = o.spin ? t * 0.45 : (o.sway ?? 0.32) * Math.sin(t * 0.7 + ph);
      const c = o.ctrl;
      if (c) {
        // externally driven (viewer / scroll scene): smooth towards the requested pose
        const ty = c.yaw + (o.yaw ?? 0) + Math.sin(t * 0.6 + ph) * 0.04;
        g.rotation.y += (ty - g.rotation.y) * 0.18;
        g.rotation.x += ((o.kind === "cube" ? 0.32 : 0) + c.pitch - g.rotation.x) * 0.18;
      } else {
        g.rotation.y = (o.yaw ?? 0) + base + s.dragYaw + s.hoverX * 0.35;
        g.rotation.x = (o.kind === "cube" ? 0.32 : 0) + s.hoverY * 0.12 + Math.sin(t * 0.9 + ph) * 0.03;
      }
      let extraH = 0;
      if (o.pop) {
        const p = c ? c.progress : 0;
        const e = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
        const cap = g.getObjectByName("cap");
        const pre = g.getObjectByName("preroll");
        const body = g.getObjectByName("tubeBody");
        const a = e(p / 0.3), b = e((p - 0.22) / 0.48), d = e((p - 0.7) / 0.3);
        if (cap) {
          cap.position.y = cap.userData.y0 + a * 0.5 + b * 0.25;
          cap.position.x = a * 0.16;
          cap.rotation.z = -a * 0.9;
        }
        if (pre) {
          pre.position.y = pre.userData.y0 + b * 0.62 + d * 0.08;
          pre.rotation.z = d * 0.35;
          pre.rotation.y = t * 0.6 * d;
        }
        if (body) body.position.y = -d * 0.18;
        extraH = a * 0.45 + b * 0.55;
      }
      g.rotation.z = Math.sin(t * 0.5 + ph) * 0.025;
      g.position.y = Math.sin(t * 1.1 + ph) * 0.02;
      const k = Math.min(1, (now - s.born) / 280);
      g.scale.setScalar(0.92 + 0.08 * (1 - Math.pow(1 - k, 3)));

      const aspect = s.w / s.h;
      const fill = o.fill ?? 0.84;
      const tan = Math.tan(((s.cam.fov * Math.PI) / 180) / 2);
      const objW = o.kind === "tube" ? TUBE_R * 2.4 : o.kind === "cube" ? CUBE_W * 1.35 : BOX_W * 1.9;
      const objH = (o.kind === "cube" ? CUBE_H * 1.75 : 1.08) + extraH;
      let dist = Math.max(objH / fill / 2 / tan, objW / fill / 2 / tan / aspect);
      if (c) dist /= c.zoom;
      s.cam.aspect = aspect;
      s.cam.position.set(0, 0.02 + extraH * 0.32, dist);
      s.cam.lookAt(0, extraH * 0.32, 0);
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

let _paper: THREE.Texture | null = null;
function paperTex() {
  if (_paper) return _paper;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const x = c.getContext("2d")!;
  // unbleached brown hemp paper (never white)
  x.fillStyle = "#9a6a3c";
  x.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 70; i++) {
    x.strokeStyle = Math.random() < 0.5 ? `rgba(60,34,14,${0.08 + Math.random() * 0.12})` : `rgba(205,160,110,${0.06 + Math.random() * 0.1})`;
    x.beginPath();
    const xx = Math.random() * 128;
    x.moveTo(xx, 0);
    x.lineTo(xx + (Math.random() - 0.5) * 20, 256);
    x.stroke();
  }
  _paper = new THREE.CanvasTexture(c);
  _paper.colorSpace = THREE.SRGBColorSpace;
  return _paper;
}

export const stage = new Stage();
