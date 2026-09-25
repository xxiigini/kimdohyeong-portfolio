/**
 * Frame renderer
 * ==============
 * 분해 프레임(빨간 KeyShot 렌더)을 캔버스에 그리면서 펜 색만 실시간으로 바꿈.
 * 빨강 재질은 G와 B가 거의 같아서 반사광 = min(G, B), 난반사 = R - 반사광 으로 나눌 수 있음.
 * 새 색 = 알베도 x 난반사 + 반사광. 크롬 클립, 검은 닙, 흰 배경은 무채색이라 그대로 남음.
 * WebGL2, WebGL1, 2D 순서로 시도 (2D는 색 변경 없이 원본만 그림).
 */

export type FrameUniforms = { alb: number[]; mix: number; base: number; paper: number[] };
export type FrameRenderer = {
  resize: (w: number, h: number) => void;
  draw: (img: HTMLImageElement, u: FrameUniforms) => void;
  dispose: () => void;
};

export function toLin(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToRgb(h: string): [number, number, number] | null {
  let s = (h || '').trim().replace('#', '');
  if (s.length === 3) s = s.split('').map((x) => x + x).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

export function hexToLin(h: string): number[] {
  const rgb = hexToRgb(h) ?? [0, 0, 0];
  return rgb.map((v) => toLin(v / 255));
}

const VS = 'attribute vec2 a;varying vec2 uv;void main(){uv=vec2(a.x*0.5+0.5,0.5-a.y*0.5);gl_Position=vec4(a,0.0,1.0);}';
const FS = [
  '#ifdef GL_FRAGMENT_PRECISION_HIGH',
  'precision highp float;',
  '#else',
  'precision mediump float;',
  '#endif',
  'varying vec2 uv;uniform sampler2D tex;uniform vec3 alb;uniform float mixv;uniform float base;uniform vec3 paper;',
  'vec3 toLin(vec3 c){return mix(c/12.92,pow((c+0.055)/1.055,vec3(2.4)),step(vec3(0.04045),c));}',
  'vec3 toSrgb(vec3 l){l=clamp(l,0.0,1.0);return mix(l*12.92,1.055*pow(l,vec3(1.0/2.4))-0.055,step(vec3(0.0031308),l));}',
  'void main(){',
  '  vec3 l=toLin(texture2D(tex,uv).rgb);',
  '  float spec=min(l.g,l.b);',
  '  float dif=max(l.r-spec,0.0);',
  '  vec3 rec=alb*(dif/base)+vec3(spec);',
  '  float k=smoothstep(0.015,0.05,dif)*mixv;',
  '  gl_FragColor=vec4(toSrgb(mix(l,rec,k))*paper,1.0);',
  '}',
].join('\n');

const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

function createGL(canvas: HTMLCanvasElement): FrameRenderer | null {
  const opts: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  };
  const gl = (canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts)) as WebGLRenderingContext | null;
  if (!gl) return null;
  const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

  const shader = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error('shader');
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'compile');
    return s;
  };
  const prog = gl.createProgram();
  if (!prog) throw new Error('program');
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, isGL2 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

  const U = {
    tex: gl.getUniformLocation(prog, 'tex'),
    alb: gl.getUniformLocation(prog, 'alb'),
    mixv: gl.getUniformLocation(prog, 'mixv'),
    base: gl.getUniformLocation(prog, 'base'),
    paper: gl.getUniformLocation(prog, 'paper'),
  };
  gl.uniform1i(U.tex, 0);
  let lastImg: HTMLImageElement | null = null;

  return {
    resize(w, h) {
      canvas.width = Math.max(1, Math.round(w * dpr()));
      canvas.height = Math.max(1, Math.round(h * dpr()));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(img, u) {
      if (img !== lastImg) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        if (isGL2) gl.generateMipmap(gl.TEXTURE_2D);
        lastImg = img;
      }
      gl.uniform3fv(U.alb, u.alb);
      gl.uniform1f(U.mixv, u.mix);
      gl.uniform1f(U.base, u.base);
      gl.uniform3fv(U.paper, u.paper);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
  };
}

function create2D(canvas: HTMLCanvasElement): FrameRenderer {
  const ctx = canvas.getContext('2d');
  return {
    resize(w, h) {
      canvas.width = Math.max(1, Math.round(w * dpr()));
      canvas.height = Math.max(1, Math.round(h * dpr()));
    },
    draw(img) {
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    },
    dispose() {
      canvas.remove();
    },
  };
}

/** host 안에 캔버스를 직접 만들어 붙임 (React가 캔버스를 관리하지 않게) */
export function createFrameRenderer(host: HTMLElement, label: string): FrameRenderer {
  const make = () => {
    const c = document.createElement('canvas');
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', label);
    host.appendChild(c);
    return c;
  };
  let canvas = make();
  try {
    const r = createGL(canvas);
    if (r) return r;
  } catch {
    // WebGL 셰이더가 안 되는 환경이면 아래 2D로
  }
  canvas.remove();
  canvas = make();
  return create2D(canvas);
}
