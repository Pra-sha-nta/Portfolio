import { animate, hover, press, stagger } from 'motion';

/**
 * Framer Motion (vanilla `motion` package) handles interface state:
 * hover/tap feedback, the nav's active indicator and the mobile menu.
 * None of these elements are touched by GSAP.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: 'spring', stiffness: 420, damping: 30 } as const;

export function mountUI(): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stops: Array<() => void> = [];

  // Hover lift + tap squash for buttons and pill links.
  if (!reduced) {
    stops.push(
      hover('[data-press]', (el) => {
        animate(el, { y: -2 }, SPRING);
        return () => animate(el, { y: 0 }, SPRING);
      }),
      press('[data-press]', (el) => {
        animate(el, { scale: 0.96 }, SPRING);
        return () => animate(el, { scale: 1 }, SPRING);
      }),
    );

    // Editorial index rows: the arrow travels and the underline draws.
    stops.push(
      hover('[data-row]', (row) => {
        const arrow = row.querySelector('[data-row-arrow]');
        const line = row.querySelector('[data-row-line]');
        if (arrow) animate(arrow, { x: 8, rotate: -45 }, SPRING);
        if (line) animate(line, { scaleX: 1 }, { duration: 0.5, ease: EASE });
        return () => {
          if (arrow) animate(arrow, { x: 0, rotate: 0 }, SPRING);
          if (line) animate(line, { scaleX: 0 }, { duration: 0.4, ease: EASE });
        };
      }),
    );
  }

  stops.push(scrollSpy(reduced), mobileMenu(reduced));
  return () => stops.forEach((stop) => stop());
}

function scrollSpy(reduced: boolean): () => void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-navlink]'));
  const sections = links
    .map((l) => document.querySelector<HTMLElement>(l.getAttribute('href') ?? ''))
    .filter((s): s is HTMLElement => Boolean(s));
  if (!sections.length) return () => {};

  const setActive = (id: string | null) => {
    for (const link of links) {
      const active = link.getAttribute('href') === `#${id}`;
      if (link.dataset.active === String(active)) continue;
      link.dataset.active = String(active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      const bar = link.querySelector('[data-nav-bar]');
      if (bar) {
        animate(bar, { scaleX: active ? 1 : 0 }, reduced ? { duration: 0 } : { duration: 0.45, ease: EASE });
      }
    }
  };

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
  return () => spy.disconnect();
}

function mobileMenu(reduced: boolean): () => void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return () => {};

  const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-item]'));
  const bars = toggle.querySelectorAll<HTMLElement>('[data-menu-bar]');
  let open = false;

  const set = (next: boolean, { restoreFocus = true } = {}) => {
    if (next === open) return;
    open = next;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('[data-menu-label]')!.textContent = open ? 'Close' : 'Menu';
    const t = reduced ? { duration: 0 } : { duration: 0.55, ease: EASE };

    if (bars.length === 2) {
      animate(bars[0], { y: open ? 3 : 0, rotate: open ? 45 : 0 }, t);
      animate(bars[1], { y: open ? -3 : 0, rotate: open ? -45 : 0 }, t);
    }

    if (open) {
      panel.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      animate(panel, { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'] }, t);
      animate(
        items,
        { opacity: [0, 1], y: [24, 0] },
        reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: stagger(0.05, { startDelay: 0.15 }) },
      );
      items[0]?.querySelector('a')?.focus();
    } else {
      document.documentElement.style.overflow = '';
      animate(panel, { clipPath: 'inset(0% 0% 100% 0%)' }, { ...t, duration: reduced ? 0 : 0.4 }).then(() => {
        if (!open) panel.hidden = true;
      });
      if (restoreFocus) toggle.focus();
    }
  };

  const onToggle = () => set(!open);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) set(false);
  };
  // Following a link closes the menu without stealing focus back from the target.
  const onPanelClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) set(false, { restoreFocus: false });
  };
  const wide = window.matchMedia('(min-width: 768px)');
  const onWide = () => wide.matches && set(false, { restoreFocus: false });

  toggle.addEventListener('click', onToggle);
  panel.addEventListener('click', onPanelClick);
  document.addEventListener('keydown', onKey);
  wide.addEventListener('change', onWide);

  return () => {
    toggle.removeEventListener('click', onToggle);
    panel.removeEventListener('click', onPanelClick);
    document.removeEventListener('keydown', onKey);
    wide.removeEventListener('change', onWide);
    document.documentElement.style.overflow = '';
  };
}
