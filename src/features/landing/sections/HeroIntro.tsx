// HeroIntro — full-viewport editorial opener (replaces the old 3D HeroScene +
// HeroPoster video; no 3D, no video). Giant display type, the upcoming round
// label, and a one-line VN tagline. Intro only — no scroll cue.
//
// PARALLAX (findrealestate "pinned" feel): a faint giant "2026" background word
// scrolls SLOWER than the foreground (depth), and the whole hero subtly scales +
// fades as you scroll past it so the next section appears to rise over it. Built
// with GSAP ScrollTrigger scrub; reduced motion renders everything static.
import { useRef } from 'react';
import Eyebrow from '../../../components/Eyebrow';
import { getUpcomingRace } from '../../../data/calendar';
import { DUR, RISE, STAGGER } from '../../../lib/motion';
import { EASE_OUT, useParallax } from '../useParallax';

export default function HeroIntro() {
  const upcoming = getUpcomingRace();
  const roundLabel = upcoming ? `R${String(upcoming.round).padStart(2, '0')}` : 'R--';

  const scope = useRef<HTMLElement>(null);

  useParallax(scope, ({ gsap }) => {
    const root = scope.current;
    if (!root) return;

    const bg = root.querySelector<HTMLElement>('[data-layer="bg"]');
    const fg = root.querySelector<HTMLElement>('[data-layer="fg"]');
    const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);

    // 1. ENTRANCE — on mount, the foreground lines rise + fade in, staggered.
    gsap.set(reveal, { autoAlpha: 0, y: RISE.hero });
    gsap.to(reveal, {
      autoAlpha: 1,
      y: 0,
      ease: EASE_OUT,
      duration: DUR.slow,
      stagger: STAGGER.hero,
      clearProps: 'transform,willChange',
    });

    // 2. DEPTH PARALLAX — the giant "2026" word drifts up slower than the page,
    //    creating the background depth layer.
    if (bg) {
      gsap.fromTo(
        bg,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        },
      );
    }

    // 3. PINNED HAND-OFF — as the hero scrolls away, the foreground scales down
    //    and fades so the next section reads as rising over it.
    if (fg) {
      gsap.to(fg, {
        scale: 0.94,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  });

  return (
    <section
      ref={scope}
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      {/* Background depth layer: faint giant "2026". Decorative. */}
      <span
        data-layer="bg"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 select-none text-center text-[34vw] font-light leading-none tracking-tighter text-neutral-900/[0.04]"
      >
        2026
      </span>

      {/* Foreground content layer (this is what scales/fades on the hand-off). */}
      <div
        data-layer="fg"
        className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-24 pt-28 md:px-12 md:pt-32"
      >
        <Eyebrow data-reveal className="text-neutral-600">
          Mùa giải 2026
        </Eyebrow>

        <div data-reveal className="mt-6 flex items-start gap-4 md:mt-8 md:gap-8">
          <h1
            id="hero-heading"
            className="text-[clamp(3rem,11vw,11rem)] font-light leading-[0.9] tracking-tight text-neutral-900"
          >
            NEW RACING
            <br />
            UNIVERSE
          </h1>
          <span className="mt-2 shrink-0 text-sm font-medium tracking-[0.2em] text-f1 md:mt-4">
            {roundLabel}
          </span>
        </div>

        <p data-reveal className="mt-8 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg">
          Toàn cảnh F1 2026 trên một trang — 11 đội đua, 24 chặng, tin nóng và bảng xếp hạng,
          tất cả trong một dòng chảy liền mạch.
        </p>
      </div>
    </section>
  );
}
