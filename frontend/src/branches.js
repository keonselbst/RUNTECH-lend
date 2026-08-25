import gsap from 'gsap';

const SVGNS = 'http://www.w3.org/2000/svg';

export function createBranches(svg, sceneApi) {
  const path = document.createElementNS(SVGNS, 'path');
  path.setAttribute('class', 'branch-path');
  const ring = document.createElementNS(SVGNS, 'circle');
  ring.setAttribute('class', 'branch-anchor-ring');
  ring.setAttribute('r', '11');
  const dot = document.createElementNS(SVGNS, 'circle');
  dot.setAttribute('class', 'branch-anchor');
  dot.setAttribute('r', '3.5');
  svg.append(path, ring, dot);

  const state = { anchorName: null, card: null, reveal: 0, tween: null };

  function setActive(anchorName, cardEl) {
    state.anchorName = anchorName;
    state.card = cardEl;
    if (state.tween) state.tween.kill();
    if (anchorName) {
      state.tween = gsap.to(state, { reveal: 1, duration: 0.9, ease: 'power3.out' });
    } else {
      state.tween = gsap.to(state, { reveal: 0, duration: 0.35, ease: 'power2.in' });
    }
  }

  function clear() { setActive(null, null); }

  function update() {
    if (state.reveal < 0.001 || !state.anchorName || !state.card) {
      path.setAttribute('d', '');
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      return;
    }
    const a = sceneApi.projectAnchor(state.anchorName);
    if (!a || !a.visible) { path.setAttribute('d', ''); dot.style.opacity = '0'; ring.style.opacity = '0'; return; }

    const rect = state.card.getBoundingClientRect();
    const cardCx = rect.left + rect.width / 2;
    const leftSide = cardCx < window.innerWidth / 2;
    const cx = leftSide ? rect.right : rect.left;
    const cy = rect.top + Math.min(46, rect.height * 0.28);

    const ax = a.x, ay = a.y;
    const midX = (ax + cx) / 2;
    const d = `M ${ax.toFixed(1)} ${ay.toFixed(1)} H ${midX.toFixed(1)} V ${cy.toFixed(1)} H ${cx.toFixed(1)}`;
    path.setAttribute('d', d);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = (len * (1 - state.reveal)).toFixed(1);

    dot.setAttribute('cx', ax); dot.setAttribute('cy', ay);
    ring.setAttribute('cx', ax); ring.setAttribute('cy', ay);
    dot.style.opacity = state.reveal;
    ring.style.opacity = (state.reveal * 0.5).toFixed(2);
    ring.setAttribute('r', (11 - state.reveal * 3).toFixed(1));
  }

  return { setActive, clear, update };
}
