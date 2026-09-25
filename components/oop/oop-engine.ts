/**
 * Out of Plane engine
 * ===================
 * 히어로 3D: 조인트가 화면 밖에서 날아와 모이고, 도웰이 가운데부터 바깥으로 이어짐.
 * 스크롤하면 정면 → 옆모습으로 돌아가고, 드래그로 돌려보기 + 호버 라벨.
 * React는 정적인 DOM만 그리고 여기서 캔버스와 DOM을 직접 만짐 (LAMY lineup-engine과 같은 방식).
 *
 * 모델 데이터 (public/models/oop-hero.bin, gzip)
 *   header 'OOP1' + JSON meta + Int16 positions + Int8 normals + Uint16 indices + Float32 dowel curves
 *   Rhino 좌표 그대로 (inch). x 오른쪽, y 위, z 벽에서 앞으로.
 */

type Three = typeof import('three');
type Vec3 = import('three').Vector3;
type Quat = import('three').Quaternion;
type Mesh = import('three').Mesh;
type StdMat = import('three').MeshStandardMaterial;
type Color = import('three').Color;

type Unit = { a: [number, number, number]; k: 'joint' | 'hanger'; arms: number; v: [number, number]; i: [number, number]; r: number };
type DowelMeta = { l: number; lv: number };
type Meta = { q: number; units: Unit[]; dowels: DowelMeta[]; samples: number; dowelR: number };

export type OopData = { meta: Meta; pos: Int16Array; nrm: Int8Array; idx: Uint16Array; crv: Float32Array };

export type OopEls = {
  section: HTMLElement;
  sticky: HTMLElement;
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  tip: HTMLElement;
  tipTitle: HTMLElement;
  tipSub: HTMLElement;
  title: HTMLElement;
  caps: HTMLElement[];
  progress: HTMLElement;
  replay: HTMLButtonElement;
  counts: HTMLElement;
};

export type OopEngine = { refreshTheme: () => void; destroy: () => void };

export async function loadOopData(url: string): Promise<OopData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`model ${res.status}`);
  let buf = await res.arrayBuffer();
  const head = new Uint8Array(buf, 0, 2);
  // 서버가 이미 풀어서 보내줬으면 그대로, gzip 그대로면 여기서 풀기
  if (head[0] === 0x1f && head[1] === 0x8b) {
    const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    buf = await new Response(stream).arrayBuffer();
  }
  const dv = new DataView(buf);
  const lm = dv.getUint32(4, true);
  const nv = dv.getUint32(8, true);
  const ni = dv.getUint32(12, true);
  const nc = dv.getUint32(16, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 24, lm))) as Meta;
  let off = 24 + lm;
  const pos = new Int16Array(buf.slice(off, off + nv * 6)); off += nv * 6;
  const nrm = new Int8Array(buf.slice(off, off + nv * 3)); off += nv * 3;
  const idx = new Uint16Array(buf.slice(off, off + ni * 2)); off += ni * 2;
  const crv = new Float32Array(buf.slice(off, off + nc * meta.samples * 12));
  return { meta, pos, nrm, idx, crv };
}

const D2R = Math.PI / 180;
const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Joint = { u: Unit; mesh: Mesh; mat: StdMat; base: Color; target: Vec3; start: Vec3; q0: Quat; delay: number; dur: number };
type Dowel = { a: Vec3; b: Vec3; vb: number; r: number; delay: number };
type Hit = { kind: 'joint'; J: Joint } | { kind: 'dowel'; k: number };

export function createOopEngine(THREE: Three, data: OopData, els: OopEls, opts: { reduceMotion: boolean }): OopEngine {
  const { meta } = data;
  const { section, sticky, stage, canvas, tip, tipTitle, tipSub, title, caps, progress } = els;
  const reduce = opts.reduceMotion;
  let destroyed = false;
  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Window, ev: K | string, fn: (e: never) => void, o?: AddEventListenerOptions) => {
    el.addEventListener(ev, fn as EventListener, o);
    offs.push(() => el.removeEventListener(ev, fn as EventListener, o));
  };

  const nJ = meta.units.filter((u) => u.k === 'joint').length;
  els.counts.textContent = `${nJ} joints · ${meta.units.length - nJ} hangers · ${meta.dowels.length} dowels`;

  /* ---------- renderer / scene ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 5, 4000);
  const disposables: { dispose: () => void }[] = [];

  const bmin = new THREE.Vector3(Infinity, Infinity, Infinity);
  const bmax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const JOINT = new THREE.Color('#6d3a3f');
  const HANGER = new THREE.Color('#2a2524');
  const WOOD = new THREE.Color('#d9bb93');
  const WHITE = new THREE.Color('#ffffff');

  /* ---------- joints: one mesh each so they can fly in on their own ---------- */
  const joints: Joint[] = meta.units.map((u, k) => {
    const [v0, nv] = u.v;
    const [i0, ni] = u.i;
    const p = new Float32Array(nv * 3);
    const n = new Int8Array(nv * 3);
    for (let j = 0; j < nv * 3; j++) {
      p[j] = data.pos[v0 * 3 + j] * meta.q;
      n[j] = data.nrm[v0 * 3 + j];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(n, 3, true));
    g.setIndex(new THREE.BufferAttribute(data.idx.slice(i0, i0 + ni), 1));
    g.computeBoundingSphere();
    const base = u.k === 'hanger' ? HANGER : JOINT;
    const mat = new THREE.MeshStandardMaterial({ color: base.clone(), roughness: u.k === 'hanger' ? 0.72 : 0.5, metalness: 0 });
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const target = new THREE.Vector3(u.a[0], u.a[1], u.a[2]);
    mesh.position.copy(target);
    mesh.userData.k = k;
    scene.add(mesh);
    disposables.push(g, mat);
    for (let q = 0; q < nv; q++) {
      const x = p[q * 3] + target.x, y = p[q * 3 + 1] + target.y, z = p[q * 3 + 2] + target.z;
      bmin.set(Math.min(bmin.x, x), Math.min(bmin.y, y), Math.min(bmin.z, z));
      bmax.set(Math.max(bmax.x, x), Math.max(bmax.y, y), Math.max(bmax.z, z));
    }
    return { u, mesh, mat, base, target, start: new THREE.Vector3(), q0: new THREE.Quaternion(), delay: 0, dur: 1 };
  });

  const S = meta.samples;
  let fx0 = Infinity, fx1 = -Infinity, fy0 = Infinity, fy1 = -Infinity;
  for (let c = 0; c < data.crv.length; c += 3) {
    const x = data.crv[c], y = data.crv[c + 1], z = data.crv[c + 2];
    bmin.set(Math.min(bmin.x, x), Math.min(bmin.y, y), Math.min(bmin.z, z));
    bmax.set(Math.max(bmax.x, x), Math.max(bmax.y, y), Math.max(bmax.z, z));
    fx0 = Math.min(fx0, x); fx1 = Math.max(fx1, x); fy0 = Math.min(fy0, y); fy1 = Math.max(fy1, y);
  }
  const center = bmin.clone().add(bmax).multiplyScalar(0.5);
  // 도웰 필드에 맞춘 타원: 네 모서리가 똑같이 "멀게"
  const fcx = (fx0 + fx1) / 2, fcy = (fy0 + fy1) / 2, fhx = (fx1 - fx0) / 2, fhy = (fy1 - fy0) / 2;
  const radial = (x: number, y: number) => {
    const u = (x - fcx) / fhx, v = (y - fcy) / fhy;
    return Math.min(1, Math.sqrt(u * u + v * v) / Math.SQRT2);
  };

  /* ---------- dowels: one merged mesh, grown in the vertex shader ---------- */
  const U = { uTime: { value: 1e6 }, uHover: { value: -1 } };
  const injectGrow = (sh: { uniforms: Record<string, { value: unknown }>; vertexShader: string; fragmentShader: string }, withColor: boolean) => {
    sh.uniforms.uTime = U.uTime;
    sh.uniforms.uHover = U.uHover;
    sh.vertexShader = sh.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute vec3 aStart;\nattribute vec3 aAxis;\nattribute float aDelay;\nattribute float aDur;\nattribute float aId;\nuniform float uTime;\nvarying float vId;'
      )
      .replace(
        '#include <begin_vertex>',
        [
          '#include <begin_vertex>',
          'float gp = clamp((uTime - aDelay) / aDur, 0.0, 1.0);',
          'gp = 1.0 - pow(1.0 - gp, 3.0);',
          'vec3 rel = transformed - aStart;',
          'float al = dot(rel, aAxis);',
          'vec3 radial = rel - aAxis * al;',
          'transformed = aStart + aAxis * (al * gp) + radial * clamp(gp * 5.0, 0.0, 1.0);',
          'vId = aId;',
        ].join('\n')
      );
    if (withColor) {
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uHover;\nvarying float vId;')
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\nif (abs(vId - uHover) < 0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.42);'
        );
    }
  };
  const SEG = 14, RAD = 10;
  const nd = meta.dowels.length;
  const perV = (SEG + 1) * RAD + 2 * (RAD + 1);
  const perI = SEG * RAD * 6 + 2 * RAD * 3;
  const dp = new Float32Array(nd * perV * 3), dn = new Float32Array(nd * perV * 3);
  const ds = new Float32Array(nd * perV * 3), da = new Float32Array(nd * perV * 3);
  const dd = new Float32Array(nd * perV), ddur = new Float32Array(nd * perV).fill(0.7), did = new Float32Array(nd * perV);
  const di = new Uint32Array(nd * perI);
  const tmp = new THREE.Vector3();
  const Z = new THREE.Vector3(0, 0, 1);
  const dowels: Dowel[] = meta.dowels.map((_, k) => {
    const pts: Vec3[] = [];
    for (let s = 0; s < S; s++) {
      const o = (k * S + s) * 3;
      pts.push(new THREE.Vector3(data.crv[o], data.crv[o + 1], data.crv[o + 2]));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    let a = pts[0], b = pts[S - 1];
    // 가운데 쪽 끝에서 바깥으로 뻗어나감
    if (radial(b.x, b.y) < radial(a.x, a.y)) [a, b] = [b, a];
    const axis = b.clone().sub(a).normalize();
    const vb = k * perV, ib = k * perI, R = meta.dowelR;
    const put = (vi: number, P: Vec3, N: Vec3) => {
      const j = (vb + vi) * 3;
      dp[j] = P.x; dp[j + 1] = P.y; dp[j + 2] = P.z;
      dn[j] = N.x; dn[j + 1] = N.y; dn[j + 2] = N.z;
      ds[j] = a.x; ds[j + 1] = a.y; ds[j + 2] = a.z;
      da[j] = axis.x; da[j + 1] = axis.y; da[j + 2] = axis.z;
      did[vb + vi] = k;
    };
    const rings: { P: Vec3; T: Vec3; n: Vec3; b: Vec3 }[] = [];
    for (let s = 0; s <= SEG; s++) {
      const t = s / SEG, P = curve.getPoint(t), T = curve.getTangent(t).normalize();
      const nr = new THREE.Vector3().crossVectors(T, Z);
      if (nr.lengthSq() < 1e-6) nr.set(1, 0, 0);
      nr.normalize();
      const bn = new THREE.Vector3().crossVectors(T, nr).normalize();
      rings.push({ P, T, n: nr, b: bn });
      for (let r = 0; r < RAD; r++) {
        const ang = (r / RAD) * Math.PI * 2;
        const N = nr.clone().multiplyScalar(Math.cos(ang)).addScaledVector(bn, Math.sin(ang));
        put(s * RAD + r, tmp.copy(P).addScaledVector(N, R), N);
      }
    }
    let ii = 0;
    for (let s = 0; s < SEG; s++) {
      for (let r = 0; r < RAD; r++) {
        const A = vb + s * RAD + r, B = vb + s * RAD + ((r + 1) % RAD), C = A + RAD, D = B + RAD;
        di[ib + ii++] = A; di[ib + ii++] = B; di[ib + ii++] = D;
        di[ib + ii++] = A; di[ib + ii++] = D; di[ib + ii++] = C;
      }
    }
    for (const end of [0, 1]) {
      const ring = rings[end ? SEG : 0];
      const N = ring.T.clone().multiplyScalar(end ? 1 : -1);
      const cb = (SEG + 1) * RAD + end * (RAD + 1);
      put(cb, ring.P, N);
      for (let r = 0; r < RAD; r++) {
        const ang = (r / RAD) * Math.PI * 2;
        put(cb + 1 + r, tmp.copy(ring.P).addScaledVector(ring.n, Math.cos(ang) * R).addScaledVector(ring.b, Math.sin(ang) * R), N);
      }
      for (let r = 0; r < RAD; r++) {
        const p1 = vb + cb + 1 + r, p2 = vb + cb + 1 + ((r + 1) % RAD);
        di[ib + ii++] = vb + cb;
        di[ib + ii++] = end ? p1 : p2;
        di[ib + ii++] = end ? p2 : p1;
      }
    }
    return { a, b, vb, r: radial((a.x + b.x) / 2, (a.y + b.y) / 2), delay: 0 };
  });
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  dg.setAttribute('normal', new THREE.BufferAttribute(dn, 3));
  dg.setAttribute('aStart', new THREE.BufferAttribute(ds, 3));
  dg.setAttribute('aAxis', new THREE.BufferAttribute(da, 3));
  const delayAttr = new THREE.BufferAttribute(dd, 1);
  const durAttr = new THREE.BufferAttribute(ddur, 1);
  dg.setAttribute('aDelay', delayAttr);
  dg.setAttribute('aDur', durAttr);
  dg.setAttribute('aId', new THREE.BufferAttribute(did, 1));
  dg.setIndex(new THREE.BufferAttribute(di, 1));
  dg.computeBoundingSphere();
  const dmat = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.68, metalness: 0 });
  dmat.onBeforeCompile = (sh) => injectGrow(sh, true);
  const ddepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  ddepth.onBeforeCompile = (sh) => injectGrow(sh, false);
  const dmesh = new THREE.Mesh(dg, dmat);
  dmesh.customDepthMaterial = ddepth;
  dmesh.castShadow = true;
  dmesh.receiveShadow = true;
  dmesh.frustumCulled = false;
  scene.add(dmesh);
  disposables.push(dg, dmat, ddepth);

  /* ---------- light + a wall that only shows shadows ---------- */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d1c4, 1.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.copy(center).addScaledVector(new THREE.Vector3(-0.32, 0.46, 0.83).normalize(), 260);
  key.target.position.copy(center);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const sc = key.shadow.camera;
  sc.left = -78; sc.right = 78; sc.top = 78; sc.bottom = -78; sc.near = 60; sc.far = 480;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.04;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xfff4ea, 0.55);
  fill.position.copy(center).add(new THREE.Vector3(120, -60, 140));
  fill.target.position.copy(center);
  scene.add(fill, fill.target);
  const wallMat = new THREE.ShadowMaterial({ opacity: 0.11 });
  const wallGeo = new THREE.PlaneGeometry(600, 450);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(center.x, center.y, bmin.z - 0.02);
  wall.receiveShadow = true;
  scene.add(wall);
  disposables.push(wallMat, wallGeo);

  function refreshTheme() {
    const a = parseFloat(getComputedStyle(section).getPropertyValue('--oop-shadow'));
    wallMat.opacity = Number.isFinite(a) ? a : 0.11;
    invalidate();
  }

  /* ---------- camera rig ---------- */
  const cam = { yaw: 0, pitch: 0, dist: 0, fov: 20, tx: 0 };
  const scrollPose = { yaw: 0, pitch: 0, zoom: 1, fov: 20, tx: 0 };
  const drag = { yaw: 0, pitch: 0, vy: 0, vp: 0, active: false };
  const hover = { yaw: 0, pitch: 0, ty: 0, tp: 0 };
  const corners: Vec3[] = [];
  for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++)
    corners.push(new THREE.Vector3(x ? bmax.x : bmin.x, y ? bmax.y : bmin.y, z ? bmax.z : bmin.z));
  let W = 1, H = 1;
  const right = new THREE.Vector3(), up = new THREE.Vector3(), back = new THREE.Vector3(), look = new THREE.Vector3();
  const YUP = new THREE.Vector3(0, 1, 0);
  function fitDistance(yaw: number, pitch: number) {
    back.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    right.crossVectors(YUP, back).normalize();
    up.crossVectors(back, right);
    const tv = Math.tan((camera.fov * D2R) / 2), th = tv * camera.aspect, m = W < 600 ? 0.94 : 0.9;
    let d = 0;
    for (const c of corners) {
      tmp.copy(c).sub(center);
      const x = Math.abs(tmp.dot(right)), y = Math.abs(tmp.dot(up)), z = tmp.dot(back);
      d = Math.max(d, z + x / (th * m), z + y / (tv * m));
    }
    return d;
  }
  function placeCamera() {
    back.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch));
    look.copy(center);
    look.x += cam.tx;
    camera.position.copy(look).addScaledVector(back, cam.dist);
    camera.lookAt(look);
  }
  function resize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    cam.dist = 0;
    invalidate();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  offs.push(() => ro.disconnect());

  /* ---------- intro: joints fly in from off-screen, then dowels connect ---------- */
  let introStart = -1, introEnd = 0;
  let paused: number | null = null;
  const IDENT = new THREE.Quaternion();
  function planIntro() {
    const f0 = camera.fov;
    camera.fov = 20;
    const dist0 = fitDistance(0, 0);
    camera.fov = f0;
    const halfH = dist0 * Math.tan((20 * D2R) / 2), halfW = halfH * (camera.aspect || 1.6);
    const reach = Math.hypot(halfW, halfH) * 1.08;
    let maxEnd = 0;
    for (const J of joints) {
      const a = J.target;
      const ang = Math.atan2(a.y - center.y, a.x - center.x) + rnd(-0.5, 0.5);
      const r = reach + rnd(4, 40);
      J.start.set(center.x + Math.cos(ang) * r, center.y + Math.sin(ang) * r, center.z + rnd(-20, 70));
      J.q0.setFromAxisAngle(new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), rnd(1.6, 4.2));
      const spread = Math.hypot(a.x - center.x, a.y - center.y) / 60;
      J.delay = (J.u.k === 'hanger' ? 0.8 : 0) + rnd(0, 1.1) + spread * 0.4;
      J.dur = rnd(1.8, 2.4);
      maxEnd = Math.max(maxEnd, J.delay + J.dur);
    }
    // 도웰마다 각자 타이밍: 가운데→바깥 흐름에 주변끼리 섞고, 간격은 고르게 (처음과 끝은 드문드문)
    const order = dowels.map((d, k) => ({ k, key: 0.62 * d.r + 0.38 * Math.random() }));
    order.sort((x, y) => x.key - y.key);
    const N = order.length, dStart = 3.1, span = 3.5;
    order.forEach((o, rank) => {
      const u = N > 1 ? rank / (N - 1) : 0;
      const g = u + (0.35 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI);
      const t = dStart + span * g + rnd(-0.004, 0.004);
      const dur = 0.38 + meta.dowels[o.k].l * 0.042;
      dowels[o.k].delay = t;
      for (let v = 0; v < perV; v++) {
        dd[dowels[o.k].vb + v] = t;
        ddur[dowels[o.k].vb + v] = dur;
      }
      maxEnd = Math.max(maxEnd, t + dur);
    });
    delayAttr.needsUpdate = true;
    durAttr.needsUpdate = true;
    introEnd = maxEnd;
  }
  function applyIntro(t: number) {
    for (const J of joints) {
      const k = clamp((t - J.delay) / J.dur, 0, 1);
      J.mesh.position.lerpVectors(J.start, J.target, easeOutQuint(k));
      J.mesh.quaternion.slerpQuaternions(J.q0, IDENT, easeOutQuint(clamp(k * 1.15, 0, 1)));
      J.mesh.visible = k > 0;
    }
    U.uTime.value = t;
  }
  function finishIntro() {
    for (const J of joints) {
      J.mesh.position.copy(J.target);
      J.mesh.quaternion.identity();
      J.mesh.visible = true;
    }
    U.uTime.value = 1e6;
    introStart = -1;
    paused = null;
  }
  function startIntro() {
    if (reduce) {
      finishIntro();
      invalidate();
      return;
    }
    hideTip();
    planIntro();
    introStart = performance.now();
    applyIntro(0);
    invalidate();
  }
  on(els.replay, 'click', startIntro);

  /* ---------- scroll → pose ---------- */
  let capIndex = 0;
  let inView = true;
  function readScroll() {
    const r = section.getBoundingClientRect();
    inView = r.bottom > 0 && r.top < window.innerHeight;
    const stickTop = parseFloat(getComputedStyle(sticky).top) || 72;
    const range = r.height - sticky.offsetHeight;
    const p = range > 0 ? clamp((stickTop - r.top) / range, 0, 1) : 0;
    const s1 = easeInOut(smooth(0.05, 0.58, p)), s2 = easeInOut(smooth(0.6, 0.9, p));
    scrollPose.yaw = (50 * s1 + 22 * s2) * D2R;
    scrollPose.pitch = (11 * s1 - 5 * s2) * D2R;
    scrollPose.zoom = 1 - 0.05 * s1 - 0.4 * s2;
    scrollPose.fov = 20 + 18 * s2;
    scrollPose.tx = 16 * s2;
    title.style.opacity = String(1 - smooth(0.02, 0.2, p) * 0.75);
    progress.style.transform = `scaleX(${p.toFixed(4)})`;
    const ci = p < 0.2 ? 0 : p < 0.62 ? 1 : 2;
    if (ci !== capIndex) {
      capIndex = ci;
      caps.forEach((el, i) => el.setAttribute('aria-hidden', String(i !== ci)));
    }
    if (inView) invalidate();
  }
  on(window, 'scroll', readScroll, { passive: true });
  on(window, 'resize', readScroll);

  /* ---------- pointer: parallax, drag to turn, hover labels ---------- */
  const pointer = { x: 0, y: 0, inside: false, id: null as number | null, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, decided: false, type: '', moved: 0, tap: false };
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered: Hit | null = null;
  let hoverDirty = false;
  const localXY = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  on(stage, 'pointerenter', (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.inside = true;
    stage.dataset.grab = '1';
  });
  on(stage, 'pointerleave', (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.inside = false;
    hover.ty = 0;
    hover.tp = 0;
    delete stage.dataset.grab;
    if (!drag.active) hideTip();
    invalidate();
  });
  on(stage, 'pointerdown', (e: PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    const [x, y] = localXY(e);
    pointer.id = e.pointerId;
    pointer.sx = pointer.lx = x;
    pointer.sy = pointer.ly = y;
    pointer.lt = performance.now();
    pointer.decided = e.pointerType === 'mouse';
    pointer.type = e.pointerType;
    pointer.moved = 0;
    if (pointer.decided) {
      drag.active = true;
      stage.dataset.dragging = '1';
      stage.setPointerCapture(e.pointerId);
    }
  });
  on(stage, 'pointermove', (e: PointerEvent) => {
    const [x, y] = localXY(e);
    pointer.x = x;
    pointer.y = y;
    if (pointer.id === e.pointerId && !pointer.decided) {
      const dx = x - pointer.sx, dy = y - pointer.sy;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        pointer.decided = true;
        drag.active = true;
        stage.setPointerCapture(e.pointerId);
      } else if (Math.abs(dy) > 10) {
        pointer.id = null;
      }
    }
    if (drag.active && pointer.id === e.pointerId) {
      const now = performance.now(), ddx = x - pointer.lx, ddy = y - pointer.ly, dt = Math.max(1, now - pointer.lt);
      pointer.moved += Math.abs(ddx) + Math.abs(ddy);
      const ky = 0.32 * D2R * (900 / Math.max(500, W)), kp = 0.22 * D2R;
      const isMouse = pointer.type === 'mouse';
      drag.yaw = clamp(drag.yaw + ddx * ky, -95 * D2R - scrollPose.yaw, 95 * D2R - scrollPose.yaw);
      drag.pitch = clamp(drag.pitch + (isMouse ? ddy * kp : 0), -32 * D2R - scrollPose.pitch, 42 * D2R - scrollPose.pitch);
      drag.vy = ((ddx * ky) / dt) * 16;
      drag.vp = isMouse ? ((ddy * kp) / dt) * 16 : 0;
      pointer.lx = x;
      pointer.ly = y;
      pointer.lt = now;
      hideTip();
      invalidate();
      return;
    }
    if (e.pointerType === 'mouse') {
      if (!reduce) {
        hover.ty = (x / W - 0.5) * 7 * D2R;
        hover.tp = (y / H - 0.5) * 4 * D2R;
      }
      hoverDirty = true;
    }
    invalidate();
  });
  const endDrag = (e: PointerEvent) => {
    if (pointer.id !== e.pointerId) return;
    const wasTap = !drag.active || pointer.moved < 4;
    drag.active = false;
    pointer.id = null;
    delete stage.dataset.dragging;
    if (wasTap && e.type === 'pointerup') {
      const [x, y] = localXY(e);
      pointer.x = x;
      pointer.y = y;
      hoverDirty = true;
      pointer.tap = e.pointerType !== 'mouse';
    }
    invalidate();
  };
  on(stage, 'pointerup', endDrag);
  on(stage, 'pointercancel', endDrag);

  const tA = new THREE.Vector3();
  const toScreen = (v: Vec3) => {
    tA.copy(v).project(camera);
    return [((tA.x + 1) / 2) * W, ((1 - tA.y) / 2) * H];
  };
  const jointMeshes = joints.map((J) => J.mesh);
  function pick(): Hit | null {
    if (introStart >= 0) return null;
    ndc.set((pointer.x / W) * 2 - 1, -(pointer.y / H) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(jointMeshes, false);
    if (hits.length) return { kind: 'joint', J: joints[hits[0].object.userData.k as number] };
    // 도웰: 화면에 투영한 중심선까지의 픽셀 거리
    let bestPx = pointer.tap ? 14 : 7, best = -1;
    for (let k = 0; k < dowels.length; k++) {
      const A = toScreen(dowels[k].a), B = toScreen(dowels[k].b);
      const vx = B[0] - A[0], vy = B[1] - A[1], L2 = vx * vx + vy * vy;
      const t = L2 > 0 ? clamp(((pointer.x - A[0]) * vx + (pointer.y - A[1]) * vy) / L2, 0.12, 0.88) : 0;
      const px = Math.hypot(A[0] + vx * t - pointer.x, A[1] + vy * t - pointer.y);
      if (px < bestPx) {
        bestPx = px;
        best = k;
      }
    }
    return best >= 0 ? { kind: 'dowel', k: best } : null;
  }
  const sameHit = (a: Hit | null, b: Hit | null) =>
    !!a && !!b && a.kind === b.kind && (a.kind === 'joint' ? a.J === (b as { J: Joint }).J : a.k === (b as { k: number }).k);
  function hideTip() {
    tip.dataset.on = '0';
    if (hovered && hovered.kind === 'joint') hovered.J.mat.color.copy(hovered.J.base);
    U.uHover.value = -1;
    hovered = null;
  }
  function showTip(h: Hit | null) {
    if (hovered && hovered.kind === 'joint' && !sameHit(h, hovered)) hovered.J.mat.color.copy(hovered.J.base);
    if (!h) {
      hideTip();
      return;
    }
    if (h.kind === 'joint') {
      const u = h.J.u;
      h.J.mat.color.copy(h.J.base).lerp(WHITE, u.k === 'hanger' ? 0.3 : 0.28);
      U.uHover.value = -1;
      tipTitle.textContent = u.k === 'hanger' ? 'Hanger' : `${u.arms}-way joint`;
      tipSub.textContent = u.k === 'hanger' ? 'PLA-CF · carries the weight' : `${u.a[2].toFixed(1)} in out of plane`;
    } else {
      U.uHover.value = h.k;
      tipTitle.textContent = 'Dowel';
      tipSub.textContent = `${meta.dowels[h.k].l.toFixed(1)} in centre to centre`;
    }
    const x = clamp(pointer.x + 14, 8, W - tip.offsetWidth - 8), y = clamp(pointer.y + 16, 8, H - tip.offsetHeight - 8);
    tip.style.transform = `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`;
    tip.dataset.on = '1';
    hovered = h;
  }

  /* ---------- render loop (only runs while something is moving) ---------- */
  let raf = 0, last = 0;
  function invalidate() {
    if (!raf && !destroyed) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function frame(now: number) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let moving = false;

    if (introStart >= 0) {
      const t = paused !== null ? paused : (now - introStart) / 1000;
      applyIntro(t);
      if (t >= introEnd) finishIntro();
      else if (paused === null) moving = true;
    }
    // 드래그 관성 → 스크롤 자세로 스르르 복귀
    if (!drag.active) {
      if (Math.abs(drag.vy) > 1e-4 || Math.abs(drag.vp) > 1e-4) {
        drag.yaw += drag.vy;
        drag.pitch += drag.vp;
        drag.vy *= 0.86;
        drag.vp *= 0.86;
        moving = true;
      }
      const kk = 1 - Math.exp(-dt * 3.2);
      drag.yaw += (0 - drag.yaw) * kk;
      drag.pitch += (0 - drag.pitch) * kk;
      if (Math.abs(drag.yaw) > 1e-4 || Math.abs(drag.pitch) > 1e-4) moving = true;
      else drag.yaw = drag.pitch = 0;
    }
    const kh = 1 - Math.exp(-dt * 4);
    hover.yaw += (hover.ty - hover.yaw) * kh;
    hover.pitch += (hover.tp - hover.pitch) * kh;
    if (Math.abs(hover.ty - hover.yaw) > 1e-4 || Math.abs(hover.tp - hover.pitch) > 1e-4) moving = true;

    const ty = clamp(scrollPose.yaw + drag.yaw + hover.yaw, -95 * D2R, 95 * D2R);
    const tp = clamp(scrollPose.pitch + drag.pitch + hover.pitch, -32 * D2R, 42 * D2R);
    const ks = 1 - Math.exp(-dt * 9);
    cam.yaw += (ty - cam.yaw) * ks;
    cam.pitch += (tp - cam.pitch) * ks;
    if (Math.abs(ty - cam.yaw) > 1e-4 || Math.abs(tp - cam.pitch) > 1e-4) moving = true;
    cam.fov += (scrollPose.fov - cam.fov) * ks;
    cam.tx += (scrollPose.tx - cam.tx) * ks;
    if (Math.abs(scrollPose.fov - cam.fov) > 0.01 || Math.abs(scrollPose.tx - cam.tx) > 0.01) moving = true;
    if (Math.abs(camera.fov - cam.fov) > 1e-4) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
    const fd = fitDistance(cam.yaw, cam.pitch) * scrollPose.zoom;
    if (!cam.dist) cam.dist = fd;
    cam.dist += (fd - cam.dist) * (1 - Math.exp(-dt * 7));
    if (Math.abs(fd - cam.dist) > 0.05) moving = true;
    placeCamera();

    // 포인터가 움직였거나 화면이 바뀌면 아래에 뭐가 있는지 다시 확인
    if (!drag.active && introStart < 0 && (pointer.tap || (pointer.inside && (hoverDirty || moving)))) {
      let h = pick();
      if (pointer.tap && sameHit(h, hovered)) h = null;
      showTip(h);
      pointer.tap = false;
    } else if (hovered && !pointer.inside && moving) {
      hideTip();
    }
    hoverDirty = false;

    renderer.render(scene, camera);
    if (moving) invalidate();
  }

  /* ---------- start: after the page settles (same idea as the LAMY fix) ---------- */
  resize();
  readScroll();
  refreshTheme();
  if (reduce) finishIntro();
  else {
    planIntro();
    applyIntro(0);
  }
  const go = () => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (destroyed) return;
        if (window.scrollY > window.innerHeight * 0.6) {
          finishIntro();
          invalidate();
          return;
        }
        startIntro();
      })
    );
  };
  if (document.readyState === 'complete') go();
  else on(window, 'load', go, { once: true });

  // 테스트용: 주소 끝에 ?oopdebug 붙이면 window.__oop 로 타임라인 조작 가능
  if (typeof location !== 'undefined' && location.search.includes('oopdebug')) {
    (window as unknown as { __oop: unknown }).__oop = {
      seek: (t: number) => {
        planIntro();
        introStart = performance.now() - t * 1000;
        paused = t;
        invalidate();
      },
      finishIntro: () => {
        finishIntro();
        invalidate();
      },
      state: () => ({ introStart, introEnd, hovered: hovered ? hovered.kind : null }),
    };
  }

  return {
    refreshTheme,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      offs.forEach((f) => f());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
