import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = 'expo.out';

/**
 * GSAP owns scroll-driven and timeline motion: the opening sequence, section
 * entrances, masks, parallax and the pinned platform reel. Framer Motion
 * (the `motion` package) owns pointer-driven UI state in ui.ts and collab.ts.
 * The two never animate the same property on the same element.
 *
 * Everything is created inside gsap.matchMedia, so switching reduced motion
 * on or off reverts every tween, split and ScrollTrigger cleanly.
 */
export function mountCinema(): () => void {
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      wide: '(min-width: 1024px)',
    },
    (context) => {
      const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
      if (!motion) return;

      heroOpening();
      sectionHeadings();
      reveals();
      maskReveals();
      rules();
      parallax();
      if (wide) platformReel();
    },
  );

  // Fonts change line breaks and heights; re-measure once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => mm.revert();
}

function heroOpening() {
  const hero = document.querySelector<HTMLElement>('#top');
  if (!hero) return;

  const names = hero.querySelectorAll<HTMLElement>('[data-hero-name]');
  const splits = Array.from(names, (el) => SplitText.create(el, { type: 'chars', aria: 'none' }));
  gsap.set(names, { visibility: 'visible' });

  const q = gsap.utils.selector(hero);
  const tl = gsap.timeline({ defaults: { ease: EASE } });

  tl.fromTo(
    q('[data-hero="caption"]'),
    { autoAlpha: 0, y: -10 },
    { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 },
  )
    .fromTo(
      q('[data-hero="rule"]'),
      { autoAlpha: 1, scaleX: 0 },
      { scaleX: 1, duration: 1.2, transformOrigin: 'left center' },
      0.1,
    )
    .from(
      splits.flatMap((s) => s.chars),
      { yPercent: 110, duration: 1.1, stagger: 0.035 },
      0.25,
    )
    .fromTo(
      q('[data-hero="portrait"]'),
      { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' },
      0.35,
    )
    .fromTo(
      q('[data-hero="marker"]'),
      { autoAlpha: 0, scale: 0.4 },
      { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' },
      1.2,
    )
    .fromTo(
      q('[data-hero="copy"]'),
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 },
      0.9,
    );

  // Scroll-out: the name drifts apart and the portrait sinks, like a camera pull-back.
  const out = gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
  });
  out
    .to(q('[data-hero-line="1"]'), { xPercent: -6, ease: 'none' }, 0)
    .to(q('[data-hero-line="2"]'), { xPercent: 5, ease: 'none' }, 0)
    .to(q('[data-hero-parallax]'), { yPercent: 12, ease: 'none' }, 0);
}

function sectionHeadings() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-split]')) {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.09,
          ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  }
}

function reveals() {
  // Elements are hidden by CSS (.js [data-reveal]); GSAP only brings them in.
  // "top 92%" plus the rule that footer content is never [data-reveal] means
  // nothing can be stranded below the last reachable scroll position.
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: EASE }),
  });
}

function maskReveals() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-mask-reveal]')) {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.3,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  }
}

function rules() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-rule]')) {
    gsap.from(el, {
      scaleX: 0,
      duration: 1.4,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }
}

function parallax() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-parallax]')) {
    const amount = Number(el.dataset.parallax) || 10;
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  }
}

/**
 * Desktop only: pin the platforms section and run its track sideways.
 * On narrower screens the same markup is a plain vertical list.
 */
function platformReel() {
  const section = document.querySelector<HTMLElement>('[data-reel]');
  const track = section?.querySelector<HTMLElement>('[data-reel-track]');
  const bar = section?.querySelector<HTMLElement>('[data-reel-progress]');
  if (!section || !track) return;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  tl.to(track, { x: () => -distance(), ease: 'none' }, 0);
  if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0);

  // Each name fills in as it crosses the centre of the frame.
  for (const item of track.querySelectorAll<HTMLElement>('[data-reel-fill]')) {
    gsap.fromTo(
      item,
      { clipPath: 'inset(0% 100% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          containerAnimation: tl,
          start: 'left 75%',
          end: 'right 45%',
          scrub: true,
        },
      },
    );
  }
}
