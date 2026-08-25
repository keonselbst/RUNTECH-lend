import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: 'section-hero', idx: 0, anchor: null, card: null },
  { id: 'section-power', idx: 1, anchor: 'power', card: 'power' },
  { id: 'section-voltage', idx: 2, anchor: 'voltage', card: 'voltage' },
  { id: 'section-thermal', idx: 3, anchor: 'thermal', card: 'thermal' },
  { id: 'section-form', idx: 4, anchor: 'form', card: 'form' },
  { id: 'section-outro', idx: 5, anchor: null, card: null },
];

export function initScroll(scene, branches) {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const hudIndex = document.querySelector('[data-hud-index]');
  const hudBar = document.querySelector('[data-hud-bar]');

  const cards = {};
  document.querySelectorAll('.callout').forEach((el) => {
    cards[el.dataset.card] = el;
    gsap.set(el, { opacity: 0, y: 40 });
  });

  const sections = CHAPTERS.map((c) => ({ ...c, el: document.getElementById(c.id) }));
  let current = -1;

  // Which chapter owns the viewport centre? Deterministic → robust to fast / teleport scroll.
  function computeChapter() {
    const c = window.innerHeight / 2;
    for (const s of sections) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= c && r.bottom > c) return s;
    }
    return sections[sections.length - 1];
  }

  function apply(ch) {
    if (ch.idx === current) return;
    current = ch.idx;
    hudIndex.textContent = String(ch.idx).padStart(2, '0');

    for (const [name, el] of Object.entries(cards)) {
      if (ch.card === name) {
        el.classList.add('is-active');
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', overwrite: true });
      } else {
        el.classList.remove('is-active');
        gsap.to(el, { opacity: 0, y: 30, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    }

    if (ch.anchor && cards[ch.card]) branches.setActive(ch.anchor, cards[ch.card]);
    else branches.clear();
  }

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      scene.setProgress(self.progress);
      gsap.set(hudBar, { scaleX: self.progress });
      apply(computeChapter());
    },
  });

  window.addEventListener('resize', () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
  apply(computeChapter());

  if (typeof window !== 'undefined') window.__lenis = lenis;
  return lenis;
}
