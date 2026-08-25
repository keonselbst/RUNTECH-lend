// Fullscreen liquid-glass fog shader — LIGHT theme (decorative background)
export const fogVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fogFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec3  uBase;
  uniform vec3  uAccent;
  uniform vec3  uSilver;

  vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  float fbm(vec2 p){
    float f = 0.0, amp = 0.55;
    for(int i = 0; i < 5; i++){ f += amp * snoise(p); p *= 2.02; amp *= 0.5; }
    return f;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5);
    p.x *= uRes.x / uRes.y;

    float t = uTime * 0.04;
    vec2 q = p * 1.5;
    float n = fbm(q + vec2(t, -t * 0.7));
    float n2 = fbm(q * 1.9 - vec2(n) + vec2(-t * 0.5, t));
    float clouds = smoothstep(-0.5, 1.1, n + n2 * 0.6);

    float d = length(p);
    float core = smoothstep(1.05, 0.05, d);
    float glow = smoothstep(0.9, 0.0, d);

    vec3 col = uBase;
    // cool silver fog for depth
    col = mix(col, uSilver, clouds * 0.30 * core);
    // warm orange bloom around the module
    col = mix(col, uAccent, glow * 0.14);
    col += pow(glow, 3.0) * uAccent * 0.10;
    // soft edge shading
    col *= 1.0 - smoothstep(0.55, 1.35, d) * 0.14;

    float grain = fract(sin(dot(uv * uRes, vec2(12.9898,78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;
