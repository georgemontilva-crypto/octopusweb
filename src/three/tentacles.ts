import * as THREE from "three";

/**
 * Real 3D octopus tentacles that wrap around the pre-roll tube.
 * The spine is re-computed every frame (helix around the tube + travelling waves),
 * skin is a tapered tube with wet clearcoat and mottled vertex colour,
 * suckers are instanced cups facing the tube.
 */
type Spec = { a0: number; dir: 1 | -1; y0: number; h: number; turns: number; w: number; ph: number };

const SEG = 72; // along
const RAD = 14; // around

export class Tentacles {
  group = new THREE.Group();
  private arms: Arm[] = [];
  constructor(color: string, tubeR: number, mobile: boolean) {
    const specs: Spec[] = [
      { a0: -2.0, dir: 1, y0: -0.7, h: 0.92, turns: 0.72, w: 0.072, ph: 0 },
      { a0: 0.7, dir: -1, y0: -0.74, h: 0.7, turns: 0.6, w: 0.066, ph: 2.1 },
      { a0: 2.8, dir: 1, y0: -0.76, h: 0.5, turns: 0.42, w: 0.058, ph: 4.2 },
    ];
    const use = mobile ? specs.slice(0, 2) : specs;
    const base = new THREE.Color(color);
    // octopus skin: deep plum/violet on top tinted by the flavour, pale pink underside
    const outer = base.clone().lerp(new THREE.Color(0x5a1a72), 0.5).multiplyScalar(0.7);
    const inner = new THREE.Color(0xf2a6c8).lerp(base, 0.2);
    const skin = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.48,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.25,
    });
    const cupMat = new THREE.MeshPhysicalMaterial({ color: 0xf6c4da, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.4, envMapIntensity: 0.2 });
    const cupGeo = cupGeometry();
    for (const s of use) {
      const arm = new Arm(s, tubeR, skin, cupMat, cupGeo, outer, inner);
      this.arms.push(arm);
      this.group.add(arm.mesh, arm.cups);
    }
  }
  update(t: number, grow: number) {
    for (const a of this.arms) a.update(t, grow);
  }
}

function cupGeometry() {
  // a shallow sucker cup: rim + hollow centre (lathe profile, y = outwards)
  const p = [
    new THREE.Vector2(0.0, 0.18),
    new THREE.Vector2(0.45, 0.22),
    new THREE.Vector2(0.78, 0.5),
    new THREE.Vector2(1.0, 0.48),
    new THREE.Vector2(1.06, 0.2),
    new THREE.Vector2(1.0, 0.0),
  ];
  return new THREE.LatheGeometry(p, 14);
}

class Arm {
  mesh: THREE.Mesh;
  cups: THREE.InstancedMesh;
  private pos: Float32Array;
  private nor: Float32Array;
  private col: Float32Array;
  private geo: THREE.BufferGeometry;
  private P = Array.from({ length: SEG + 1 }, () => new THREE.Vector3());
  private W = new Float32Array(SEG + 1);
  private cupIdx: { i: number; side: number }[] = [];
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private v = new THREE.Vector3();
  private up = new THREE.Vector3(0, 1, 0);
  private noise: Float32Array;
  constructor(private s: Spec, private tubeR: number, skin: THREE.Material, cupMat: THREE.Material, cupGeo: THREE.BufferGeometry, private outer: THREE.Color, private inner: THREE.Color) {
    const n = (SEG + 1) * (RAD + 1);
    this.pos = new Float32Array(n * 3);
    this.nor = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.noise = new Float32Array(n);
    for (let i = 0; i < n; i++) this.noise[i] = Math.random();
    const idx: number[] = [];
    for (let i = 0; i < SEG; i++)
      for (let j = 0; j < RAD; j++) {
        const a = i * (RAD + 1) + j, b = a + RAD + 1;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    this.geo = new THREE.BufferGeometry();
    this.geo.setIndex(idx);
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.mesh = new THREE.Mesh(this.geo, skin);
    this.mesh.frustumCulled = false;
    for (let i = 5; i < SEG - 6; i += 3) {
      this.cupIdx.push({ i, side: -0.42 });
      this.cupIdx.push({ i: i + 1, side: 0.42 });
    }
    this.cups = new THREE.InstancedMesh(cupGeo, cupMat, this.cupIdx.length);
    this.cups.frustumCulled = false;
  }

  update(t: number, grow: number) {
    const { s, tubeR, P, W } = this;
    // spine
    for (let i = 0; i <= SEG; i++) {
      const u = (i / SEG) * grow;
      const wave = Math.sin(t * 1.3 + s.ph - u * 6) * 0.05 * u;
      const ang = s.a0 + s.dir * (u * s.turns * Math.PI * 2 + Math.sin(t * 0.7 + s.ph + u * 2.5) * 0.35 * u);
      const w = s.w * Math.pow(1 - u, 0.9) + 0.0035;
      W[i] = w;
      // hug the tube; the root comes from further out, the tip curls away
      const curl = Math.max(0, u - 0.82) / 0.18;
      const rad = tubeR + w * 0.92 + 0.004 + Math.pow(1 - u, 2.6) * 0.1 + curl * curl * 0.06 + wave * 0.3;
      const y = s.y0 + u * s.h + Math.sin(t * 1.1 + s.ph + u * 4) * 0.025 * u + curl * curl * 0.05;
      P[i].set(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
    }
    // skin rings
    const T = new THREE.Vector3(), Rv = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), d = new THREE.Vector3();
    const { pos, nor, col, outer, inner, noise } = this;
    for (let i = 0; i <= SEG; i++) {
      T.subVectors(P[Math.min(SEG, i + 1)], P[Math.max(0, i - 1)]).normalize();
      Rv.set(P[i].x, 0, P[i].z).normalize(); // away from the tube axis
      N.copy(Rv).addScaledVector(T, -Rv.dot(T)).normalize();
      B.crossVectors(T, N).normalize();
      // flatten the underside a little, like a real arm
      for (let j = 0; j <= RAD; j++) {
        const a = (j / RAD) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        d.copy(N).multiplyScalar(ca).addScaledVector(B, sa);
        const k = (i * (RAD + 1) + j) * 3;
        const r = W[i] * (ca < 0 ? 1 + ca * 0.18 : 1);
        pos[k] = P[i].x + d.x * r;
        pos[k + 1] = P[i].y + d.y * r;
        pos[k + 2] = P[i].z + d.z * r;
        nor[k] = d.x;
        nor[k + 1] = d.y;
        nor[k + 2] = d.z;
        // outer side dark & mottled, underside pale
        // dark skin everywhere except a narrow pale strip on the underside (where the suckers are)
        const x = Math.min(1, Math.max(0, (ca + 0.72) / 0.42));
        const m = x * x * (3 - 2 * x);
        const spot = 0.78 + noise[i * (RAD + 1) + j] * 0.42 * m;
        col[k] = (inner.r + (outer.r - inner.r) * m) * spot;
        col[k + 1] = (inner.g + (outer.g - inner.g) * m) * spot;
        col[k + 2] = (inner.b + (outer.b - inner.b) * m) * spot;
      }
      // suckers on the side that touches the tube
      for (let c = 0; c < this.cupIdx.length; c++) {
        const ci = this.cupIdx[c];
        if (ci.i !== i) continue;
        const a = Math.PI + ci.side;
        d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
        const sc = W[i] * 0.36;
        this.v.copy(P[i]).addScaledVector(d, W[i] * 0.88);
        this.q.setFromUnitVectors(this.up, d);
        this.m.compose(this.v, this.q, new THREE.Vector3(sc, sc, sc));
        this.cups.setMatrixAt(c, this.m);
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.normal.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
    this.cups.instanceMatrix.needsUpdate = true;
  }
}
