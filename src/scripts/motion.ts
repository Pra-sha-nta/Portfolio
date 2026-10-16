import { animate, inView, stagger } from 'motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Split a heading into per-word spans wrapped in an overflow-hidden mask.
 * Done in JS so the served HTML keeps the plain, readable heading text.
 */
function splitWords(el: HTMLElement) {
  const words = (el.textContent ?? '').trim().split(/\s+/);
  el.textContent = '';
  for (const word of words) {
    const mask = document.createElement('span');
    const inner = document.createElement('span');
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    // Real space between masks so the text still wraps and reads correctly.
    el.appendChild(document.createTextNode(' '));
  }
  return Array.from(el.querySelectorAll<HTMLElement>('span > span'));
}

function init() {
  // Reduced motion: CSS already resolved every element to its final state.
  if (reduced.matches) return;

  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal-word]')) {
    const inner = splitWords(el);
    animate(
      inner,
      { transform: ['translateY(100%)', 'translateY(0%)'] },
      { duration: 0.9, delay: stagger(0.08), ease: EASE },
    );
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    const delay = Number(el.dataset.revealDelay ?? 0);

    const show = (target: Element) => {
        // Stagger direct children marked for it, otherwise animate the block.
        const kids = target.querySelectorAll<HTMLElement>(':scope > [data-reveal-child]');
        const targets = kids.length ? Array.from(kids) : [target as HTMLElement];
        if (kids.length) (target as HTMLElement).style.opacity = '1';

      animate(
        targets,
        { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
        {
          duration: 0.6,
          delay: kids.length ? stagger(0.06, { startDelay: delay }) : delay,
          ease: EASE,
        },
      );
    };

    // An element that is display:none (responsive) can never intersect, so
    // reveal it immediately rather than leaving it stranded at opacity 0.
    if (!el.getClientRects().length) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      continue;
    }

    // No negative bottom margin: elements near the end of the document can
    // never scroll far enough to satisfy an inset threshold, and would stay
    // stranded at opacity 0. "some" fires as soon as any part is visible.
    inView(el, show, { amount: 'some' });
  }

  // Scroll-spy: mark the nav link for the section currently in view.
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-navlink]'),
  );
  const sections = links
    .map((l) => document.querySelector<HTMLElement>(l.getAttribute('href') ?? ''))
    .filter((s): s is HTMLElement => Boolean(s));

  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of links) {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.dataset.active = String(active);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const section of sections) spy.observe(section);
  }
}

// DOM is already parsed when a module script runs, but guard for safety.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
