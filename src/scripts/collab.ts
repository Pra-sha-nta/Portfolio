import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, hover, press, stagger } from 'motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * The hire section: a hand pulling a glossy pill on strings.
 *
 * Property ownership, so GSAP and Motion never fight over one element:
 * - GSAP: [data-collab-in] entrance (opacity, transform), string dashoffset,
 *   and the `tug` proxy value.
 * - rAF loop: [data-collab-hand] and [data-collab-anchor] transforms, and
 *   each string's `d` attribute (geometry follows the live layout).
 * - Motion: [data-collab-tilt] tilt and lift, [data-collab-sheen] sweep,
 *   [data-collab-shadow] spread, [data-collab-button] press scale, and the
 *   contact dialog.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: 'spring', stiffness: 260, damping: 22 } as const;

/** Per-string character: sag, sway phase and amplitude, start offset in the fist. */
const STRING_FEEL = [
  { sag: 0.16, phase: 0.0, amp: 4.5, off: -3 },
  { sag: 0.22, phase: 1.7, amp: 6.0, off: -1 },
  { sag: 0.13, phase: 3.1, amp: 3.5, off: 0 },
  { sag: 0.19, phase: 4.4, amp: 5.5, off: 2 },
  { sag: 0.11, phase: 5.6, amp: 4.0, off: 3.5 },
];

const POINTER_RADIUS = 150;
const POINTER_PUSH = 26;

export function mountCollaborate(): () => void {
  const section = document.querySelector<HTMLElement>('#contact.collab');
  if (!section) return () => {};

  const stage = section.querySelector<HTMLElement>('[data-collab-stage]')!;
  const hand = section.querySelector<HTMLElement>('[data-collab-hand]')!;
  const grip = section.querySelector<SVGCircleElement>('[data-collab-grip]')!;
  const anchor = section.querySelector<HTMLElement>('[data-collab-anchor]')!;
  const tilt = section.querySelector<HTMLElement>('[data-collab-tilt]')!;
  const button = section.querySelector<HTMLButtonElement>('[data-collab-button]')!;
  const sheen = section.querySelector<HTMLElement>('[data-collab-sheen]')!;
  const shadow = section.querySelector<HTMLElement>('[data-collab-shadow]')!;
  const knots = Array.from(section.querySelectorAll<HTMLElement>('[data-collab-knot]'));
  const strings = Array.from(section.querySelectorAll<SVGPathElement>('.collab-string'));
  const dialog = section.querySelector<HTMLDialogElement>('[data-contact-dialog]')!;
  const closeBtn = section.querySelector<HTMLButtonElement>('[data-contact-close]')!;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stops: Array<() => void> = [];

  // ---------------------------------------------------------------- strings

  const tug = { v: 0 };
  const pointer = { x: 0, y: 0, strength: 0, target: 0 };
  let pluck = 0;
  let time = 0;

  function frame(dt: number) {
    time += dt;
    pluck *= Math.pow(0.04, dt); // decays to ~4% per second
    pointer.strength += (pointer.target - pointer.strength) * Math.min(1, dt * 6);

    // Writes first: the tug moves the fist back and drags the pill after it.
    const t = tug.v;
    hand.style.transform = `translate(${-t * 12}px, ${t * 7}px) rotate(${-t * 4}deg)`;
    anchor.style.transform = `translate(${-t * 7}px, ${t * 4}px) rotate(${-t * 1.6}deg)`;

    // Then one read pass.
    const box = stage.getBoundingClientRect();
    const g = grip.getBoundingClientRect();
    const gx = g.left + g.width / 2 - box.left;
    const gy = g.top + g.height / 2 - box.top;

    strings.forEach((path, i) => {
      const k = knots[i]?.getBoundingClientRect();
      if (!k) return;
      const feel = STRING_FEEL[i % STRING_FEEL.length];
      const sx = gx + feel.off;
      const sy = gy - feel.off * 0.7;
      const kx = k.left - box.left;
      const ky = k.top - box.top;
      const dx = kx - sx;
      const dy = ky - sy;
      const len = Math.hypot(dx, dy);

      // Tension straightens the string; sway and plucks keep it alive.
      const sag = len * feel.sag * (1 - t * 0.75);
      const swing = reduced ? 0 : Math.sin(time * 1.1 + feel.phase) * feel.amp * (1 - t * 0.6);
      const ring = reduced ? 0 : Math.sin(time * 14 + feel.phase) * pluck * 16;

      let c1x = sx + dx * 0.32 + swing * 0.4;
      let c1y = sy + dy * 0.32 + sag + swing + ring;
      let c2x = sx + dx * 0.7 - swing * 0.3;
      let c2y = sy + dy * 0.7 + sag * 0.75 - swing * 0.6 - ring * 0.7;

      // The pointer brushes strings aside, falling off with distance.
      if (pointer.strength > 0.01) {
        const midX = (c1x + c2x) / 2;
        const midY = (c1y + c2y) / 2;
        const px = midX - pointer.x;
        const py = midY - pointer.y;
        const d = Math.hypot(px, py) || 1;
        if (d < POINTER_RADIUS) {
          const f = (1 - d / POINTER_RADIUS) ** 2 * POINTER_PUSH * pointer.strength;
          c1x += (px / d) * f;
          c1y += (py / d) * f;
          c2x += (px / d) * f * 0.8;
          c2y += (py / d) * f * 0.8;
        }
      }

      path.setAttribute(
        'd',
        `M${sx.toFixed(1)} ${sy.toFixed(1)} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${kx.toFixed(1)} ${ky.toFixed(1)}`,
      );
    });
  }

  // The loop runs only while the section is on screen.
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (raf || reduced) return;
    last = 0;
    raf = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  // A gentle repeating tug: a quick pull, then the strings settle.
  const tugTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4, delay: 0.6 });
  tugTl
    .to(tug, { v: 1, duration: 0.2, ease: 'power2.out' })
    .to(tug, { v: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' })
    .to(tug, { v: 0.55, duration: 0.16, ease: 'power2.out' }, '+=0.25')
    .to(tug, { v: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });

  let entered = false;
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      start();
      if (entered) tugTl.play();
    } else {
      stopLoop();
      tugTl.pause();
    }
  });
  io.observe(stage);

  // Static geometry for reduced motion, and on every resize.
  frame(0);
  const ro = new ResizeObserver(() => {
    if (!raf) frame(0);
  });
  ro.observe(stage);

  stops.push(() => {
    stopLoop();
    io.disconnect();
    ro.disconnect();
    tugTl.kill();
  });

  // ---------------------------------------------------------------- pointer

  if (!reduced) {
    const onMove = (e: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };
    // Tapping the stage plucks the strings: the touch alternative to brushing.
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('[data-collab-button]')) return;
      onMove(e);
      pluck = 1;
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointerdown', onDown);
    stops.push(() => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('pointerdown', onDown);
    });
  }

  // ---------------------------------------------------------------- entrance

  if (reduced) {
    gsap.set(strings, { strokeDashoffset: 0 });
    gsap.set('[data-collab-in]', { opacity: 1 });
  } else {
    const intro = gsap.timeline({
      paused: true,
      onComplete: () => {
        entered = true;
        tugTl.play();
      },
    });
    intro
      .fromTo(
        '[data-collab-in="hand"]',
        { opacity: 0, x: -80, y: 50, rotate: -6 },
        { opacity: 1, x: 0, y: 0, rotate: 0, duration: 1.1, ease: 'power3.out' },
      )
      .fromTo(
        '[data-collab-in="button"]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        0.2,
      )
      .fromTo(
        strings,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.09 },
        0.6,
      );

    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top 78%',
      once: true,
      onEnter: () => intro.play(),
    });
    stops.push(() => {
      st.kill();
      intro.kill();
    });
  }

  // ---------------------------------------------------------------- button

  if (!reduced) {
    const onTilt = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = button.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      animate(tilt, { rotateY: nx * 14, rotateX: -ny * 18 }, SPRING);
    };
    button.addEventListener('pointermove', onTilt);

    stops.push(
      () => button.removeEventListener('pointermove', onTilt),
      hover(button, () => {
        animate(tilt, { y: -8 }, SPRING);
        animate(shadow, { scaleX: 1.15, opacity: 0.6 }, SPRING);
        animate(sheen, { x: ['-120%', '360%'], skewX: -20 }, { duration: 0.9, ease: EASE });
        return () => {
          animate(tilt, { y: 0, rotateX: 0, rotateY: 0 }, SPRING);
          animate(shadow, { scaleX: 1, opacity: 1 }, SPRING);
        };
      }),
      press(button, (el) => {
        animate(el, { scale: 0.95 }, { type: 'spring', stiffness: 500, damping: 28 });
        return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 28 });
      }),
    );
  }

  // ---------------------------------------------------------------- dialog

  const items = () => Array.from(dialog.querySelectorAll<HTMLElement>('[data-dialog-item]'));
  let busy = false;

  /** The button's box as a clip-path inset, so the overlay grows out of it. */
  const fromButton = () => {
    const r = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round ${r.height / 2}px)`;
  };

  const lockScroll = (on: boolean) => {
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };

  async function openDialog() {
    if (dialog.open || busy) return;
    busy = true;
    tugTl.pause();
    dialog.showModal();
    lockScroll(true);
    closeBtn.focus();

    if (!reduced) {
      dialog.scrollTop = 0;
      animate(
        items(),
        { opacity: [0, 1], y: [24, 0] },
        { duration: 0.6, ease: EASE, delay: stagger(0.05, { startDelay: 0.3 }) },
      );
      await animate(
        dialog,
        { clipPath: [fromButton(), 'inset(0px 0px 0px 0px round 0px)'] },
        { duration: 0.7, ease: EASE },
      );
      dialog.style.clipPath = '';
    }
    busy = false;
  }

  async function closeDialog() {
    if (!dialog.open || busy) return;
    busy = true;
    if (!reduced) {
      await animate(
        dialog,
        { clipPath: ['inset(0px 0px 0px 0px round 0px)', fromButton()] },
        { duration: 0.5, ease: EASE },
      );
    }
    dialog.close();
    busy = false;
  }

  // Runs for every close path, so scroll and focus are always restored.
  const onClosed = () => {
    dialog.style.clipPath = '';
    lockScroll(false);
    button.focus({ preventScroll: true });
    if (entered) tugTl.play();
  };
  // Escape: animate out instead of the instant native close.
  const onCancel = (e: Event) => {
    e.preventDefault();
    void closeDialog();
  };
  const onOpen = () => void openDialog();
  const onClose = () => void closeDialog();

  button.addEventListener('click', onOpen);
  closeBtn.addEventListener('click', onClose);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('close', onClosed);
  stops.push(() => {
    button.removeEventListener('click', onOpen);
    closeBtn.removeEventListener('click', onClose);
    dialog.removeEventListener('cancel', onCancel);
    dialog.removeEventListener('close', onClosed);
    if (dialog.open) dialog.close();
    lockScroll(false);
  });

  return () => stops.forEach((stop) => stop());
}
