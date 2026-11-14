/**
 * Real 3D products (tube = cylinder with the unwrapped label, dabs box = prism with its rectified faces).
 * ONE offscreen WebGL renderer draws each product and copies the pixels into a plain <canvas> that lives
 * inside the page. The canvases scroll natively with the content (no fixed overlay chasing the scroll),
 * nothing intercepts touch, and rendering pauses while the user scrolls.
 */
import * as THREE from "three";
import { Tentacles } from "./tentacles";
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
  /** 3D octopus tentacles wrapped around the tube (pop scene) */
  tentacles?: boolean;
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

    // pre-roll: kraft filter + translucent tan cone paper, wide packed open end (like a classic cone)
    const L = TUBE_H * 0.86;
    const R = TUBE_R * 0.84;
    const pre = new THREE.Group();
    pre.name = "preroll";
    const fl = L * 0.22, r0 = R * 0.46, r1 = R * 0.5;
    const crutch = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r0, fl, 40, 1, true),
      new THREE.MeshStandardMaterial({ map: kraftTex(), color: 0xdcd2c4, roughness: 0.92, envMapIntensity: 0.3 }),
    );
    crutch.position.y = -L / 2 + fl / 2;
    const fEnd = new THREE.Mesh(new THREE.RingGeometry(r0 * 0.35, r0, 32), new THREE.MeshStandardMaterial({ color: 0xc99a68, roughness: 1, side: THREE.DoubleSide }));
    fEnd.rotation.x = Math.PI / 2;
    fEnd.position.y = -L / 2;
    const pts: THREE.Vector2[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // slight bulge where it is packed, straight cone otherwise
      const rr = r0 + (R - r0) * t + Math.sin(t * Math.PI) * R * 0.03;
      pts.push(new THREE.Vector2(rr, -L / 2 + fl * 0.92 + t * (L - fl * 0.92)));
    }
    const paper = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 48),
      new THREE.MeshStandardMaterial({ map: paperTex(), color: 0xbdb39c, roughness: 0.82, envMapIntensity: 0.3, side: THREE.DoubleSide }),
    );
    // packed herb visible at the open end
    const top = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 40), new THREE.MeshStandardMaterial({ map: herbTex(), roughness: 1 }));
    top.rotation.x = -Math.PI / 2;
    top.position.y = L / 2 - L * 0.006;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 0.99, R * 0.035, 8, 40), new THREE.MeshStandardMaterial({ color: 0xb8a272, roughness: 0.85 }));
    lip.rotation.x = Math.PI / 2;
    lip.position.y = L / 2;
    pre.add(crutch, fEnd, paper, top, lip);
    if (o.tentacles) {
      const tt = new Tentacles(o.color, TUBE_R, this.touch);
      tt.group.name = "tentacles";
      tt.group.userData.t = tt;
      g.add(tt.group);
    }
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
      const extraH = 0;
      if (o.pop) {
        const p = c ? c.progress : 0;
        const e = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
        const cap = g.getObjectByName("cap");
        const pre = g.getObjectByName("preroll");
        const body = g.getObjectByName("tubeBody");
        // 1) cap lifts off and steps aside  2) the pre-roll slides straight up,
        //    its filter stays inside the tube (so it clearly comes from inside)
        const a = e(p / 0.32), b = e((p - 0.28) / 0.6);
        if (cap) {
          cap.position.y = cap.userData.y0 + a * 0.22 + b * 0.12;
          cap.position.x = a * 0.26;
          cap.rotation.z = -a * 0.45;
        }
        if (pre) {
          pre.position.y = pre.userData.y0 + a * 0.05 + b * 0.44;
          pre.rotation.set(0, 0, 0);
        }
        if (body) body.position.y = 0;
        const tg = g.getObjectByName("tentacles");
        if (tg) (tg.userData.t as Tentacles).update(t, Math.min(1, (now - s.born) / 1400));
      }
      g.rotation.z = o.pop ? 0 : Math.sin(t * 0.5 + ph) * 0.025;
      g.position.y = o.pop ? 0 : Math.sin(t * 1.1 + ph) * 0.02;
      const k = Math.min(1, (now - s.born) / 280);
      g.scale.setScalar(0.92 + 0.08 * (1 - Math.pow(1 - k, 3)));

      const aspect = s.w / s.h;
      const fill = o.fill ?? 0.84;
      const tan = Math.tan(((s.cam.fov * Math.PI) / 180) / 2);
      const objW = o.kind === "tube" ? (o.tentacles ? 0.62 : TUBE_R * 2.4) : o.kind === "cube" ? CUBE_W * 1.35 : BOX_W * 1.9;
      const objH = (o.kind === "cube" ? CUBE_H * 1.75 : 1.08) + extraH;
      let dist = Math.max(objH / fill / 2 / tan, objW / fill / 2 / tan / aspect);
      let camY = 0.02 + extraH * 0.32, lookY = extraH * 0.32;
      if (o.pop) {
        // fixed frame that always holds the whole effect: tentacles enter from the bottom edge,
        // cap and pre-roll fully out at the top never get cut
        const yMax = aspect < 0.8 ? 1.75 : 1.55, yMin = aspect < 0.8 ? -1.75 : -1.3;
        const hh = yMax - yMin;
        dist = Math.max(hh / 2 / tan, 1.05 / 2 / tan / aspect);
        camY = lookY = (yMax + yMin) / 2;
      } else if (c) dist /= c.zoom;
      s.cam.aspect = aspect;
      s.cam.position.set(0, camY, dist);
      s.cam.lookAt(0, lookY, 0);
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

function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
/** speckles: [r,g,b,alpha range], count, size range */
function flecks(x: CanvasRenderingContext2D, w: number, h: number, n: number, cols: [number, number, number][], s0: number, s1: number, a0: number, a1: number) {
  for (let i = 0; i < n; i++) {
    const [r, g, b] = cols[(Math.random() * cols.length) | 0];
    x.fillStyle = `rgba(${r},${g},${b},${rnd(a0, a1)})`;
    x.beginPath();
    x.ellipse(rnd(0, w), rnd(0, h), rnd(s0, s1), rnd(s0, s1) * rnd(0.4, 1), rnd(0, Math.PI), 0, Math.PI * 2);
    x.fill();
  }
}
let _paper: THREE.Texture | null = null;
/** translucent tan cone paper with the ground herb showing through */
function paperTex() {
  if (_paper) return _paper;
  _paper = canvasTex(512, 512, (x) => {
    x.fillStyle = "rgb(178,163,118)";
    x.fillRect(0, 0, 512, 512);
    flecks(x, 512, 512, 5200, [[118, 108, 62], [104, 92, 52], [135, 118, 72], [96, 84, 48]], 0.8, 2.6, 0.25, 0.6);
    flecks(x, 512, 512, 2200, [[214, 200, 156], [205, 190, 145], [226, 214, 172]], 0.6, 1.8, 0.25, 0.55);
    flecks(x, 512, 512, 260, [[82, 70, 40], [120, 86, 52]], 1, 3.4, 0.25, 0.5);
    // soft paper fibres
    for (let i = 0; i < 90; i++) {
      x.strokeStyle = `rgba(230,218,180,${rnd(0.04, 0.1)})`;
      x.lineWidth = rnd(0.5, 1.4);
      const xx = rnd(0, 512);
      x.beginPath();
      x.moveTo(xx, 0);
      x.lineTo(xx + rnd(-30, 30), 512);
      x.stroke();
    }
    // glued seam
    x.fillStyle = "rgba(205,190,145,0.28)";
    x.fillRect(250, 0, 10, 512);
  });
  return _paper;
}
let _kraft: THREE.Texture | null = null;
/** light kraft filter tip */
function kraftTex() {
  if (_kraft) return _kraft;
  _kraft = canvasTex(256, 128, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgb(226,182,130)");
    g.addColorStop(1, "rgb(240,200,148)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 128);
    flecks(x, 256, 128, 700, [[205, 160, 112], [248, 214, 166]], 0.5, 1.5, 0.2, 0.45);
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = `rgba(190,140,95,${rnd(0.06, 0.14)})`;
      const yy = rnd(0, 128);
      x.beginPath();
      x.moveTo(0, yy);
      x.lineTo(256, yy + rnd(-4, 4));
      x.stroke();
    }
  });
  return _kraft;
}
let _herb: THREE.Texture | null = null;
/** packed ground flower seen at the open end */
function herbTex() {
  if (_herb) return _herb;
  _herb = canvasTex(256, 256, (x) => {
    x.fillStyle = "rgb(92,88,50)";
    x.fillRect(0, 0, 256, 256);
    flecks(x, 256, 256, 2600, [[120, 116, 64], [70, 66, 36], [140, 128, 74], [104, 86, 52]], 0.8, 3, 0.4, 0.85);
    flecks(x, 256, 256, 400, [[176, 160, 108], [60, 52, 30]], 0.6, 2, 0.4, 0.8);
  });
  return _herb;
}

export const stage = new Stage();
