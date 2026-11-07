/**
 * One shared WebGL renderer that draws real 3D products (tube = cylinder, dabs box = prism)
 * into any number of DOM "slots" on the page (scissor viewports on a fixed full-screen canvas).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { isTouch, reducedMotion } from "../lib/theme";

export type Kind = "tube" | "box";
export type SlotOpts = {
  slug: string;
  kind: Kind;
  color: string;
  tex: { tube: string; front: string | null; side: string | null };
  /** base yaw in radians (box looks better slightly turned) */
  yaw?: number;
  /** allow pointer drag to rotate */
  drag?: boolean;
  /** how much of the slot height the product fills (0..1) */
  fill?: number;
  /** idle sway amplitude in radians */
  sway?: number;
  phase?: number;
};

type Slot = {
  el: HTMLElement;
  o: SlotOpts;
  group: THREE.Group;
  cam: THREE.PerspectiveCamera;
  visible: boolean;
  dragYaw: number;
  dragVel: number;
  dragging: boolean;
  hoverX: number;
  hoverY: number;
  tHoverX: number;
  tHoverY: number;
  rim: THREE.Color;
  born: number;
  cleanup: () => void;
};

const TUBE_H = 1;
const TUBE_R = TUBE_H / 5.99 / 2;
const BOX_H = 1;
const BOX_W = BOX_H * 0.259;

class Stage {
  renderer: THREE.WebGLRenderer | null = null;
  canvas: HTMLCanvasElement | null = null;
  scene = new THREE.Scene();
  slots = new Set<Slot>();
  loader = new THREE.TextureLoader();
  texCache = new Map<string, THREE.Texture>();
  key!: THREE.DirectionalLight;
  rimL!: THREE.DirectionalLight;
  rimR!: THREE.DirectionalLight;
  raf = 0;
  io: IntersectionObserver | null = null;
  failed = false;

  init() {
    if (this.renderer || this.failed) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.className = "stage3d";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch() ? 1.75 : 2));
      r.setSize(window.innerWidth, window.innerHeight, false);
      r.setScissorTest(true);
      r.autoClear = false;
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.05;
      this.renderer = r;
      this.canvas = canvas;

      const pmrem = new THREE.PMREMGenerator(r);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environmentIntensity = 0.55;

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      this.key = new THREE.DirectionalLight(0xffffff, 1.6);
      this.key.position.set(1.5, 2, 3);
      this.rimL = new THREE.DirectionalLight(0x7b3cff, 3.2);
      this.rimL.position.set(-3, 1, -1.5);
      this.rimR = new THREE.DirectionalLight(0xff2bb3, 2.4);
      this.rimR.position.set(3, -0.5, -1.5);
      this.scene.add(this.key, this.rimL, this.rimR);

      window.addEventListener("resize", this.onResize);
      this.io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) for (const s of this.slots) if (s.el === e.target) s.visible = e.isIntersecting;
        },
        { rootMargin: "120px 0px" },
      );
      this.raf = requestAnimationFrame(this.loop);
    } catch (err) {
      console.warn("3D disabled", err);
      this.failed = true;
    }
  }

  onResize = () => {
    this.renderer?.setSize(window.innerWidth, window.innerHeight, false);
  };

  tex(url: string, kind: "tube" | "face") {
    let t = this.texCache.get(url);
    if (!t) {
      t = this.loader.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      if (kind === "tube") {
        // front half of the label is the image; the back half mirrors it
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
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(TUBE_R, TUBE_R, TUBE_H, 128, 1, true),
        new THREE.MeshPhysicalMaterial({ map: this.tex(o.tex.tube, "tube"), roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 }),
      );
      g.add(body);
      const capMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b10, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
      const top = new THREE.Mesh(new THREE.CircleGeometry(TUBE_R, 64), capMat);
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
      // BoxGeometry material order: +x, -x, +y, -y, +z, -z
      const box = new THREE.Mesh(new THREE.BoxGeometry(BOX_W, BOX_H, BOX_W), [side, side, cap, cap, front, front]);
      g.add(box);
    }
    // soft contact shadow
    const sh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.75 }),
    );
    sh.rotation.x = -Math.PI / 2;
    const footprint = o.kind === "tube" ? TUBE_R * 7 : BOX_W * 3.2;
    sh.scale.set(footprint, footprint * 0.55, 1);
    sh.position.y = -0.53;
    sh.name = "shadow";
    g.add(sh);
    return g;
  }

  add(el: HTMLElement, o: SlotOpts) {
    this.init();
    if (this.failed) return () => {};
    const group = this.build(o);
    group.visible = false;
    this.scene.add(group);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.05, 50);
    const slot: Slot = {
      el, o, group, cam, visible: false,
      dragYaw: 0, dragVel: 0, dragging: false,
      hoverX: 0, hoverY: 0, tHoverX: 0, tHoverY: 0,
      rim: new THREE.Color(o.color),
      born: performance.now(),
      cleanup: () => {},
    };
    // pointer interaction on the DOM slot
    let lastX = 0;
    const onDown = (e: PointerEvent) => {
      if (!o.drag) return;
      slot.dragging = true;
      lastX = e.clientX;
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      slot.tHoverX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      slot.tHoverY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (slot.dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        slot.dragVel = dx * 0.012;
        slot.dragYaw += slot.dragVel;
      }
    };
    const onUp = () => (slot.dragging = false);
    const onLeave = () => {
      slot.tHoverX = 0;
      slot.tHoverY = 0;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    slot.cleanup = () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
    this.slots.add(slot);
    this.io?.observe(el);
    return () => {
      slot.cleanup();
      this.io?.unobserve(el);
      this.scene.remove(group);
      group.traverse((c) => {
        const m = c as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      this.slots.delete(slot);
    };
  }

  loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const r = this.renderer;
    if (!r || document.hidden) return;
    const t = (now / 1000) * (reducedMotion() ? 0.2 : 1);
    const W = window.innerWidth, H = window.innerHeight;
    r.setScissor(0, 0, W, H);
    r.setViewport(0, 0, W, H);
    r.clear();
    for (const s of this.slots) {
      if (!s.visible) continue;
      const rect = s.el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > H || rect.width < 2 || rect.height < 2) continue;
      const o = s.o;
      // motion
      s.hoverX += (s.tHoverX - s.hoverX) * 0.08;
      s.hoverY += (s.tHoverY - s.hoverY) * 0.08;
      if (!s.dragging) {
        s.dragYaw *= 0.94; // spring back to the front
        s.dragVel *= 0.9;
      }
      const lim = o.kind === "tube" ? 1.1 : 1.4;
      s.dragYaw = Math.max(-lim, Math.min(lim, s.dragYaw));
      const sway = (o.sway ?? 0.32) * Math.sin(t * 0.7 + (o.phase ?? 0));
      const g = s.group;
      g.rotation.y = (o.yaw ?? 0) + sway + s.dragYaw + s.hoverX * 0.35;
      g.rotation.x = s.hoverY * 0.12 + Math.sin(t * 0.9 + (o.phase ?? 0)) * 0.03;
      g.rotation.z = Math.sin(t * 0.5 + (o.phase ?? 0)) * 0.025;
      g.position.y = Math.sin(t * 1.1 + (o.phase ?? 0)) * 0.018;
      // pop-in when a product (re)appears
      const k = Math.min(1, (now - s.born) / 900);
      const pop = k >= 1 ? 1 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      g.scale.setScalar(Math.max(0.001, pop));
      if (k < 1) g.rotation.y += (1 - k) * (1 - k) * 2.4;
      const shadow = g.getObjectByName("shadow");
      if (shadow) shadow.position.y = -0.53 - g.position.y;
      // camera fit
      const aspect = rect.width / rect.height;
      const fill = o.fill ?? 0.84;
      const fov = (s.cam.fov * Math.PI) / 180;
      const objH = 1.08;
      const objW = o.kind === "tube" ? TUBE_R * 2.4 : BOX_W * 1.9;
      const distH = objH / fill / 2 / Math.tan(fov / 2);
      const distW = objW / fill / 2 / Math.tan(fov / 2) / aspect;
      s.cam.aspect = aspect;
      s.cam.position.set(0, 0.02, Math.max(distH, distW));
      s.cam.lookAt(0, 0, 0);
      s.cam.updateProjectionMatrix();
      // per-flavor rim light
      this.rimL.color.copy(s.rim);
      // draw only this product
      for (const other of this.slots) other.group.visible = other === s;
      const x = rect.left, y = H - rect.bottom;
      r.setViewport(x, y, rect.width, rect.height);
      r.setScissor(x, y, rect.width, rect.height);
      r.clearDepth();
      r.render(this.scene, s.cam);
    }
  };
}

let _shadow: THREE.Texture | null = null;
function shadowTex() {
  if (_shadow) return _shadow;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(0.5, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  _shadow = new THREE.CanvasTexture(c);
  return _shadow;
}

export const stage = new Stage();
