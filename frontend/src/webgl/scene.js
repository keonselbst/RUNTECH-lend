import * as THREE from 'three';
import { fogVertex, fogFragment } from './fog.glsl.js';

// Local anchor points on the module (rotate with the model)
const ANCHORS = {
  power:   new THREE.Vector3(0.0, 0.5, 0.0),
  voltage: new THREE.Vector3(-1.75, 0.0, 0.0),
  thermal: new THREE.Vector3(1.75, 0.0, 0.0),
  form:    new THREE.Vector3(0.0, -0.6, 0.5),
};

function makeEnvMap() {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0.0, '#43434f');
  g.addColorStop(0.42, '#16161c');
  g.addColorStop(0.6, '#050507');
  g.addColorStop(1.0, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 128);
  // warm accent glint
  ctx.fillStyle = 'rgba(234,91,41,0.5)';
  ctx.fillRect(0, 20, 32, 10);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function runnerTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = '#d4af37';
  ctx.fillStyle = '#d4af37';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // motion lines
  ctx.lineWidth = 7;
  ctx.globalAlpha = 0.55;
  [96, 116, 136].forEach((y, i) => {
    ctx.beginPath();
    ctx.moveTo(20 + i * 8, y);
    ctx.lineTo(78 + i * 6, y);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  // head
  ctx.beginPath();
  ctx.arc(168, 66, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 15;
  // torso
  ctx.beginPath(); ctx.moveTo(162, 82); ctx.lineTo(132, 148); ctx.stroke();
  // front arm
  ctx.beginPath(); ctx.moveTo(150, 104); ctx.lineTo(200, 92); ctx.lineTo(214, 122); ctx.stroke();
  // back arm
  ctx.beginPath(); ctx.moveTo(150, 104); ctx.lineTo(108, 122); ctx.lineTo(92, 104); ctx.stroke();
  // front leg
  ctx.beginPath(); ctx.moveTo(132, 148); ctx.lineTo(176, 178); ctx.lineTo(168, 224); ctx.stroke();
  // back leg
  ctx.beginPath(); ctx.moveTo(132, 148); ctx.lineTo(96, 190); ctx.lineTo(66, 182); ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function labelTexture() {
  const w = 512, h = 96;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e9e9ec';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#101014';
  ctx.font = '600 46px Manrope, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ПНДВ4-AA05', 26, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.autoClear = false;

  const envMap = makeEnvMap();

  // --- Background fog scene ---
  const bgScene = new THREE.Scene();
  const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const fogUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uBase: { value: new THREE.Color('#e9ebf0') },
    uAccent: { value: new THREE.Color('#ea5b29') },
    uSilver: { value: new THREE.Color('#c2c8d4') },
  };
  const fogMat = new THREE.ShaderMaterial({
    vertexShader: fogVertex,
    fragmentShader: fogFragment,
    uniforms: fogUniforms,
    depthTest: false,
    depthWrite: false,
  });
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fogMat));

  // --- Main scene ---
  const scene = new THREE.Scene();
  scene.environment = envMap;

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8.4);

  const group = new THREE.Group();
  scene.add(group);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b0e, metalness: 0.4, roughness: 0.52,
    clearcoat: 0.5, clearcoatRoughness: 0.45, envMapIntensity: 0.9,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.75, 1.9, 1, 1, 1), bodyMat);
  group.add(body);

  // logo + company name printed on the module
  const texLoader = new THREE.TextureLoader();
  const logoTex = texLoader.load('/img/logo.png');
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.anisotropy = 4;

  const topLogoMat = new THREE.MeshStandardMaterial({
    map: logoTex, roughness: 0.5, metalness: 0.15, envMapIntensity: 0.5,
  });
  const topLogo = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.742), topLogoMat);
  topLogo.rotation.x = -Math.PI / 2;
  topLogo.position.set(0, 0.377, 0.42);
  group.add(topLogo);

  const frontLogoMat = new THREE.MeshStandardMaterial({
    map: logoTex, roughness: 0.55, metalness: 0.15, envMapIntensity: 0.5,
  });
  const frontLogo = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.683), frontLogoMat);
  frontLogo.position.set(0, -0.02, 0.951);
  group.add(frontLogo);

  // gold pins
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0xd8b23a, metalness: 1.0, roughness: 0.22, envMapIntensity: 1.4,
  });
  const pinGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.95, 16);
  [-1.2, -0.4, 0.4, 1.2].forEach((x) => {
    [-0.72, 0.72].forEach((z) => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, -0.72, z);
      group.add(pin);
    });
  });

  // ---- Presentable detailing ----
  const darkMetal = new THREE.MeshPhysicalMaterial({
    color: 0x16161c, metalness: 0.9, roughness: 0.34,
    clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 1.15,
  });
  const brushed = new THREE.MeshStandardMaterial({
    color: 0xbfc3cb, metalness: 1.0, roughness: 0.32, envMapIntensity: 1.4,
  });

  // machined top-rim lip (frame around the top face)
  const rimY = 0.4;
  const rimFB = new THREE.BoxGeometry(3.24, 0.07, 0.1);
  [-0.92, 0.92].forEach((z) => {
    const m = new THREE.Mesh(rimFB, darkMetal);
    m.position.set(0, rimY, z); group.add(m);
  });
  const rimLR = new THREE.BoxGeometry(0.1, 0.07, 1.94);
  [-1.57, 1.57].forEach((x) => {
    const m = new THREE.Mesh(rimLR, darkMetal);
    m.position.set(x, rimY, 0); group.add(m);
  });

  // corner bolts (hex heads)
  const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6);
  [[-1.45, -0.8], [1.45, -0.8], [-1.45, 0.8], [1.45, 0.8]].forEach(([x, z]) => {
    const b = new THREE.Mesh(boltGeo, brushed);
    b.position.set(x, 0.42, z);
    b.rotation.y = Math.PI / 6;
    group.add(b);
  });

  // cooling fins on the rear half of the top face
  const finGeo = new THREE.BoxGeometry(2.3, 0.1, 0.05);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(finGeo, darkMetal);
    f.position.set(0, 0.41, -0.18 - i * 0.1);
    group.add(f);
  }

  // side connectors / cable entries on the +X face
  const connBody = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0c, metalness: 0.35, roughness: 0.55, clearcoat: 0.4,
  });
  const connGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.2, 22);
  const ringGeo = new THREE.TorusGeometry(0.15, 0.03, 12, 24);
  [-0.5, 0.5].forEach((z) => {
    const conn = new THREE.Mesh(connGeo, connBody);
    conn.rotation.z = Math.PI / 2;
    conn.position.set(1.72, 0, z); group.add(conn);
    const ring = new THREE.Mesh(ringGeo, brushed);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(1.62, 0, z); group.add(ring);
  });

  // recessed ventilation grille on the -X face
  const slotGeo = new THREE.BoxGeometry(0.04, 0.42, 0.09);
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(slotGeo, darkMetal);
    s.position.set(-1.585, 0, -0.4 + i * 0.2);
    group.add(s);
  }

  // Lights
  // Lights — soft, form-revealing highlights
  scene.add(new THREE.AmbientLight(0xffffff, 0.42));
  const key = new THREE.SpotLight(0xffffff, 95, 34, 0.55, 0.85, 1.2);
  key.position.set(5, 8, 6);
  scene.add(key);
  const softKey = new THREE.SpotLight(0xeaf1ff, 34, 40, 0.7, 1.0, 1.0);
  softKey.position.set(-4, 6, 4);
  scene.add(softKey);
  const rim = new THREE.DirectionalLight(0xea5b29, 2.6);
  rim.position.set(-6, 1, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8fb6ff, 0.7);
  fill.position.set(-3, -4, 5);
  scene.add(fill);
  const glint = new THREE.PointLight(0xfff0e0, 6, 14, 2);
  glint.position.set(2.4, 3, 3.2);
  scene.add(glint);

  // State
  const state = {
    targetY: -0.5, targetX: -0.32, targetZ: 0.05,
    running: true, frameCbs: [], last: 0,
  };
  group.rotation.set(-0.32, -0.5, 0.05);

  function setProgress(p) {
    state.targetY = -0.5 + p * Math.PI * 3.0;
    state.targetX = -0.32 + Math.sin(p * Math.PI * 2.0) * 0.28;
    state.targetZ = Math.sin(p * Math.PI) * 0.08;
  }

  const _v = new THREE.Vector3();
  function projectAnchor(name) {
    const a = ANCHORS[name];
    if (!a) return null;
    _v.copy(a);
    group.localToWorld(_v);
    _v.project(camera);
    const x = (_v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-_v.y * 0.5 + 0.5) * window.innerHeight;
    return { x, y, visible: _v.z < 1 };
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fogUniforms.uRes.value.set(w, h);
  }

  function tick() {
    if (!state.running) return;
    const now = performance.now();
    const dt = Math.min((now - state.last) / 1000, 0.05);
    state.last = now;
    fogUniforms.uTime.value += dt;
    // ease rotation toward target
    group.rotation.y += (state.targetY - group.rotation.y) * 0.08;
    group.rotation.x += (state.targetX - group.rotation.x) * 0.08;
    group.rotation.z += (state.targetZ - group.rotation.z) * 0.08;

    renderer.clear();
    renderer.render(bgScene, bgCam);
    renderer.clearDepth();
    renderer.render(scene, camera);

    for (let i = 0; i < state.frameCbs.length; i++) state.frameCbs[i]();
    requestAnimationFrame(tick);
  }

  function start() { state.running = true; state.last = performance.now(); requestAnimationFrame(tick); }
  function pause() { state.running = false; }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else start();
  });

  window.addEventListener('resize', resize);

  return {
    group, camera, renderer,
    setProgress, projectAnchor, resize, start, pause,
    onFrame: (cb) => state.frameCbs.push(cb),
  };
}
