import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { createScene } from './webgl/scene.js';
import { createBranches } from './branches.js';
import { playIntro } from './motion/intro.js';
import { initScroll } from './motion/scroll.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function boot() {
  if (reduced) {
    document.body.classList.add('reduced');
    return;
  }

  const canvas = document.getElementById('webgl');
  let scene;
  try {
    scene = createScene(canvas);
  } catch (err) {
    console.warn('WebGL unavailable, using CSS fallback', err);
    document.body.classList.add('no-webgl');
    return;
  }

  const svg = document.getElementById('branches');
  const branches = createBranches(svg, scene);
  scene.onFrame(() => branches.update());

  scene.start();
  playIntro(scene);
  initScroll(scene, branches);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
