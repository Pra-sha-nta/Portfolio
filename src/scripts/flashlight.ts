import { gsap } from 'gsap';

/**
 * Reusable torchlight. Mount on any [data-flashlight] stage:
 *
 *   data-radius      beam radius in px (capped to a share of stage width)
 *   data-softness    0..1, how much of the beam is feathered falloff
 *   data-dim         0..1, darkness of the shade outside the beam
 *   data-rest-x/y    0..1, where the beam parks when the pointer leaves
 *   data-intro       "sweep" plays a one-off pass on load, "none" skips it
 *   data-intro-delay seconds before the sweep starts
 *
 * Children marked [data-fl-reveal] are masked by the beam. A [data-fl-toggle]
 * button switches to "lights on" for keyboard and touch users.
 *
 * Pointer input never touches React-style state or layout: events only store
 * coordinates, and a single rAF loop (running only while the beam is moving)
 * writes CSS custom properties.
 */

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function isLowPower(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) <= 2 ||
    Boolean(nav.connection?.saveData)
  );
}

export function mountFlashlight(stage: HTMLElement): () => void {
  const num = (key: string, fallback: number) => {
    const v = Number(stage.dataset[key]);
    return Number.isFinite(v) && stage.dataset[key] !== undefined ? v : fallback;
  };

  const maxRadius = num('radius', 240);
  const softness = Math.min(Math.max(num('softness', 0.6), 0), 1);
  const restX = num('restX', 0.7);
  const restY = num('restY', 0.4);
  const lowPower = isLowPower();
  const reduced = reducedQuery.matches;
  // Smoothing is a motion effect; drop it when motion is reduced or the device is weak.
  const smooth = !reduced && !lowPower;

  stage.style.setProperty('--fl-core', `${Math.round((1 - softness) * 100)}%`);
  stage.style.setProperty('--fl-dim', String(num('dim', 0.38)));
  if (lowPower) stage.dataset.flLite = '';

  const reveals = Array.from(stage.querySelectorAll<HTMLElement>('[data-fl-reveal]'));
  const toggle = stage.querySelector<HTMLButtonElement>('[data-fl-toggle]');

  // Beam position in stage coordinates.
  const cur = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let radius = maxRadius;
  let follow = 0.2;
  let pointerClient: { x: number; y: number } | null = null;
  let raf = 0;
  let inView = false;
  let intro: gsap.core.Timeline | null = null;

  const setRadius = () => {
    radius = Math.round(Math.min(maxRadius, stage.clientWidth * 0.38));
  };

  const park = () => {
    target.x = stage.clientWidth * restX;
    target.y = stage.clientHeight * restY;
  };

  const render = () => {
    const s = stage.getBoundingClientRect();
    stage.style.setProperty('--gx', `${cur.x}px`);
    stage.style.setProperty('--gy', `${cur.y}px`);
    for (const el of reveals) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${s.left + cur.x - r.left}px`);
      el.style.setProperty('--my', `${s.top + cur.y - r.top}px`);
    }
  };

  const tick = () => {
    raf = 0;
    if (smooth) {
      cur.x += (target.x - cur.x) * follow;
      cur.y += (target.y - cur.y) * follow;
    } else {
      cur.x = target.x;
      cur.y = target.y;
    }
    render();
    if (Math.abs(target.x - cur.x) > 0.3 || Math.abs(target.y - cur.y) > 0.3) {
      raf = requestAnimationFrame(tick);
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const switchOn = () => {
    stage.style.setProperty('--fl-r', `${radius}px`);
    stage.style.setProperty('--fl-on', '1');
  };

  const stopIntro = () => {
    if (!intro) return;
    intro.kill();
    intro = null;
    switchOn();
  };

  const fromClient = (x: number, y: number) => {
    const s = stage.getBoundingClientRect();
    target.x = x - s.left;
    target.y = y - s.top;
  };

  const onPointerMove = (e: PointerEvent) => {
    stopIntro();
    pointerClient = { x: e.clientX, y: e.clientY };
    fromClient(e.clientX, e.clientY);
    if (e.pointerType === 'mouse') {
      follow = 0.2;
      schedule();
    } else {
      // Touch / pen: the beam sits under the finger, no trailing.
      cur.x = target.x;
      cur.y = target.y;
      render();
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    onPointerMove(e);
  };

  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointerClient = null;
    follow = 0.06;
    park();
    schedule();
  };

  // Scrolling moves the stage under a stationary pointer, and parallax moves
  // reveal layers inside it, so masks need re-aligning while the stage is visible.
  const onScroll = () => {
    if (!inView) return;
    if (pointerClient) fromClient(pointerClient.x, pointerClient.y);
    schedule();
  };

  const onToggle = () => {
    const all = stage.dataset.flMode !== 'all';
    stage.dataset.flMode = all ? 'all' : 'beam';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(all));
      const label = toggle.querySelector('[data-fl-toggle-label]');
      if (label) label.textContent = all ? toggle.dataset.onLabel ?? 'Torch' : toggle.dataset.offLabel ?? 'Lights on';
    }
    if (all) stopIntro();
  };

  const ro = new ResizeObserver(() => {
    setRadius();
    if (intro) return;
    switchOn();
    if (!pointerClient) {
      park();
      cur.x = target.x;
      cur.y = target.y;
    }
    render();
  });

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) schedule();
  });

  setRadius();
  park();
  cur.x = target.x;
  cur.y = target.y;
  render();

  const wantsIntro = stage.dataset.intro === 'sweep' && smooth;
  if (wantsIntro) {
    // One cinematic pass: the torch clicks on at the left, sweeps the name,
    // then settles on the rest position. Any pointer input cancels it.
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const radiusProxy = { r: 0, on: 0 };
    cur.x = target.x = w * 0.12;
    cur.y = target.y = h * 0.45;
    intro = gsap
      .timeline({
        delay: num('introDelay', 1.2),
        onUpdate: render,
        onComplete: () => {
          intro = null;
          switchOn();
        },
      })
      .to(radiusProxy, {
        r: 1,
        on: 1,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          stage.style.setProperty('--fl-r', `${radius * radiusProxy.r}px`);
          stage.style.setProperty('--fl-on', String(radiusProxy.on));
        },
      })
      .to(cur, { x: w * 0.42, y: h * 0.62, duration: 1.1, ease: 'sine.inOut' }, 0.1)
      .to(cur, { x: w * restX, y: h * restY, duration: 1.2, ease: 'power3.inOut' })
      .eventCallback('onInterrupt', switchOn);
    target.x = w * restX;
    target.y = h * restY;
  } else {
    switchOn();
  }

  stage.addEventListener('pointermove', onPointerMove, { passive: true });
  stage.addEventListener('pointerdown', onPointerDown, { passive: true });
  stage.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  toggle?.addEventListener('click', onToggle);
  ro.observe(stage);
  io.observe(stage);

  return () => {
    intro?.kill();
    cancelAnimationFrame(raf);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('scroll', onScroll);
    toggle?.removeEventListener('click', onToggle);
    ro.disconnect();
    io.disconnect();
  };
}
