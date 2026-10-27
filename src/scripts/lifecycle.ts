/**
 * Shared mount/teardown for every interactive module.
 *
 * - Runs `setup` once the DOM is parsed and keeps its cleanup function.
 * - Tears everything down before an Astro view-transition swap, so timelines,
 *   ScrollTriggers, observers and listeners never leak across pages.
 * - If a module throws, content hidden for its entrance is released
 *   immediately instead of waiting for the inline watchdog.
 */

type Cleanup = () => void;

const cleanups: Cleanup[] = [];

document.documentElement.classList.add('motion-ready');

document.addEventListener(
  'astro:before-swap',
  () => {
    while (cleanups.length) cleanups.pop()?.();
  },
  { once: true },
);

export function onMount(name: string, setup: () => Cleanup | void): void {
  const run = () => {
    try {
      const cleanup = setup();
      if (cleanup) cleanups.push(cleanup);
    } catch (error) {
      document.documentElement.classList.remove('js');
      console.warn(`[${name}] failed to start; showing static content.`, error);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
