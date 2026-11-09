import { useEffect, useRef } from "react";
import { theme, isTouch, reducedMotion } from "../lib/theme";
import { isScrolling } from "../lib/motion";

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uDepth;
uniform vec3 uA;
uniform vec3 uB;
uniform float uPulse;
uniform vec2 uPulsePos;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
float caustic(vec2 uv, float t){
  vec2 p = mod(uv*6.28318, 6.28318) - 250.0;
  vec2 i = p; float c = 1.0; float inten = 0.005;
  for(int n=0;n<4;n++){
    float tt = t * (1.0 - (3.5 / float(n+1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
  float t = uTime;
  float surface = 1.0 - uDepth;

  vec3 deep = vec3(0.010, 0.004, 0.035);
  vec3 mid = mix(vec3(0.05, 0.02, 0.17), uA * 0.32, 0.55);
  vec3 col = mix(deep, mid, smoothstep(0.0, 1.0, uv.y) * (0.3 + 0.7 * surface));

  // tinted nebula / ink clouds
  vec2 q = p * 2.0 + vec2(0.0, t * 0.025);
  float n = fbm(q + fbm(p * 3.0 - t * 0.02) * 1.4);
  col += uA * pow(n, 3.0) * 0.6;
  col += uB * pow(fbm(p * 1.5 - vec2(t * 0.018, -t*0.01)), 4.0) * 0.5;

  // god rays
  float ang = (uv.x - 0.5 - (uMouse.x - 0.5) * 0.18) / (1.3 - uv.y);
  float rays = pow(max(0.0, sin(ang * 9.0 + t * 0.3)), 6.0);
  rays += pow(max(0.0, sin(ang * 15.0 - t * 0.22 + 1.3)), 8.0) * 0.7;
  rays *= smoothstep(0.1, 1.0, uv.y) * (0.2 + 0.8 * surface);
  col += mix(vec3(0.65, 0.8, 1.0), uA, 0.45) * rays * 0.16;

  // caustics
  float c = caustic(p * 0.55 + vec2(0.0, t * 0.01), t * 0.35);
  col += mix(uA, vec3(1.0), 0.45) * c * 0.1 * smoothstep(0.3, 1.0, uv.y) * surface;

  // bioluminescent motes (rising)
  for(int L=0; L<3; L++){
    float fl = float(L);
    float sc = 16.0 + fl * 13.0;
    vec2 g = p * sc - vec2(sin(t*0.2+fl)*0.6, t * (0.5 + fl * 0.3));
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id + fl * 7.13);
    if(h > 0.85){
      vec2 o = vec2(hash(id + 1.3) - 0.5, hash(id + 2.1) - 0.5) * 0.6;
      float d = length(f - o);
      float tw = 0.5 + 0.5 * sin(t * 2.0 + h * 40.0);
      col += mix(uA, uB, hash(id + 3.0)) * smoothstep(0.11, 0.0, d) * tw * (0.7 - fl * 0.18);
    }
  }

  // bubbles
  {
    vec2 g = p * vec2(5.0, 5.0) - vec2(0.0, t * 0.42);
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id + 11.0);
    if(h > 0.78){
      f.x += sin(t * 1.6 + h * 30.0) * 0.12;
      float rad = 0.05 + 0.13 * hash(id + 5.0);
      float d = length(f);
      float ring = smoothstep(0.022, 0.0, abs(d - rad));
      float hl = smoothstep(rad * 0.45, 0.0, length(f - vec2(-rad * 0.38, rad * 0.38)));
      col += (ring * 0.28 + hl * 0.3) * mix(vec3(0.8, 0.9, 1.0), uA, 0.35);
    }
  }

  // cursor bioluminescence
  vec2 m = vec2((uMouse.x - 0.5) * asp, uMouse.y);
  vec2 dm = p - m;
  col += mix(uA, uB, 0.3) * 0.14 / (1.0 + 26.0 * dot(dm, dm));

  // ink pulse shockwave
  vec2 pp = vec2((uPulsePos.x - 0.5) * asp, uPulsePos.y);
  float r = (1.0 - uPulse) * 1.3;
  float dd = length(p - pp);
  col += uB * smoothstep(0.07, 0.0, abs(dd - r)) * uPulse * 0.9;
  col += uA * smoothstep(0.2, 0.0, abs(dd - r * 0.7)) * uPulse * 0.35;

  // vignette + grain
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 1.15;
  col += (hash(gl_FragCoord.xy + fract(t * 7.0) * 100.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Abyss() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      canvas.style.background = "radial-gradient(ellipse at 50% 0%, #2a0f6b, #07021a 70%)";
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), time: u("uTime"), mouse: u("uMouse"), depth: u("uDepth"),
      a: u("uA"), b: u("uB"), pulse: u("uPulse"), pulsePos: u("uPulsePos"),
    };

    const touch = isTouch();
    // adaptive quality: start sharp, drop internal resolution if the device struggles
    const scales = touch ? [0.5, 0.35, 0.22] : [0.75, 0.5, 0.33, 0.2];
    let qi = 0;
    let scale = scales[0];
    let acc = 0, frames = 0, warm = 0, slowWins = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr * scale);
      canvas.height = Math.floor(window.innerHeight * dpr * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const col = { a: [...theme.a], b: [...theme.b] };
    let depth = 0;
    let raf = 0;
    let running = true;
    const slow = reducedMotion();
    const start = performance.now();
    let last = start;

    let lastDraw = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      // phones: 30fps and no redraw while the finger is scrolling
      if (touch && (now - lastDraw < 32 || isScrolling())) return;
      lastDraw = now;
      const rawDt = (now - last) / 1000;
      const dt = Math.min(rawDt, 0.05);
      last = now;
      if (warm < 90) warm++;
      else if (rawDt < 0.5) {
        acc += rawDt;
        frames++;
        if (frames >= 40) {
          slowWins = acc / frames > (touch ? 1 / 22 : 1 / 38) ? slowWins + 1 : 0;
          if (slowWins >= 2 && qi < scales.length - 1) {
            scale = scales[++qi];
            slowWins = 0;
            resize();
          }
          acc = 0;
          frames = 0;
        }
      }
      const t = ((now - start) / 1000) * (slow ? 0.15 : 1);
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      depth += (target - depth) * 0.05;
      for (let i = 0; i < 3; i++) {
        col.a[i] += (theme.a[i] - col.a[i]) * 0.04;
        col.b[i] += (theme.b[i] - col.b[i]) * 0.04;
      }
      theme.pulse = Math.max(0, theme.pulse - dt * 0.9);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, t);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform1f(U.depth, depth);
      gl.uniform3f(U.a, col.a[0], col.a[1], col.a[2]);
      gl.uniform3f(U.b, col.b[0], col.b[1], col.b[2]);
      gl.uniform1f(U.pulse, theme.pulse);
      gl.uniform2f(U.pulsePos, theme.pulseX, theme.pulseY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);
    const vis = () => (running = !document.hidden);
    document.addEventListener("visibilitychange", vis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return <canvas ref={ref} className="abyss" aria-hidden />;
}
