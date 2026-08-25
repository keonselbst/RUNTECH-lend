import gsap from 'gsap';

// Kinetic on-load reveal: masked line-by-line text + model entrance.
export function playIntro(scene) {
  const lines = document.querySelectorAll('.reveal-line > span');

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  gsap.set(lines, { yPercent: 120 });
  gsap.set(scene.group.scale, { x: 0.72, y: 0.72, z: 0.72 });
  gsap.set(scene.group.position, { y: -0.6 });
  gsap.set(scene.renderer.domElement, { opacity: 0 });

  tl.to(scene.renderer.domElement, { opacity: 1, duration: 1.4 }, 0)
    .to(scene.group.scale, { x: 1, y: 1, z: 1, duration: 1.8 }, 0)
    .to(scene.group.position, { y: 0, duration: 1.8 }, 0)
    .to(lines, { yPercent: 0, duration: 1.15, stagger: 0.1 }, 0.25);

  return tl;
}
