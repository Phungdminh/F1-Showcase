// NewsShowcase — the 3 importance-5 stories as big editorial cards. Typography
// leads; the imageUrl renders as a tinted/duotone-ish block behind the title
// (dark gradient overlay so white type stays legible — we have no licensed
// photos, so the image is treated as texture, not subject).
//
// PARALLAX: cards reveal on entry and each carries a small scrub-driven vertical
// offset so they drift at slightly different speeds (depth). Reduced motion →
// static, fully visible.
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Eyebrow from '../../../components/Eyebrow';
import { getFeaturedNews } from '../../../data/news';
import { DUR, RISE } from '../../../lib/motion';
import { EASE_OUT, useParallax } from '../useParallax';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500';

const FALLBACK_IMAGES = ['/Mask_group.jpg', '/Mask_group-1.jpg', '/Mask_group-2.jpg'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsShowcase() {
  const stories = getFeaturedNews(3);
  const scope = useRef<HTMLElement>(null);

  useParallax(scope, ({ gsap }) => {
    const root = scope.current;
    if (!root) return;

    const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
    gsap.set(reveal, { autoAlpha: 0, y: RISE.section });
    gsap.to(reveal, {
      autoAlpha: 1,
      y: 0,
      ease: EASE_OUT,
      duration: DUR.slow,
      stagger: 0.08,
      clearProps: 'transform,willChange',
      scrollTrigger: { trigger: root, start: 'top 78%', once: true },
    });

    // Per-card depth drift — alternating speeds give the stack parallax.
    gsap.utils.toArray<HTMLElement>('[data-card]', root).forEach((card, i) => {
      const depth = 4 + (i % 3) * 3; // 4 / 7 / 10 percent
      gsap.fromTo(
        card,
        { yPercent: depth },
        {
          yPercent: -depth,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  });

  return (
    <section
      ref={scope}
      aria-labelledby="news-heading"
      className="px-5 py-28 md:px-12 md:py-36"
    >
      <div className="mb-14 md:mb-20">
        <Eyebrow data-reveal className="text-neutral-600">
          Tin tức
        </Eyebrow>
        <h2
          id="news-heading"
          data-reveal
          className="mt-5 text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-neutral-900"
        >
          TIN NỔI BẬT
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, i) => {
          // First card spans wider on lg for editorial rhythm.
          const featured = i === 0;
          const imageSrc = story.imageUrl ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
          return (
            <article
              key={story.id}
              data-card
              className={featured ? 'lg:col-span-3' : ''}
            >
              <Link
                to="/news"
                className={`group block ${FOCUS}`}
                aria-label={`Đọc tin: ${story.title}`}
              >
                <div
                  className={`relative overflow-hidden rounded-2xl ${
                    featured ? 'aspect-[16/7]' : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={imageSrc}
                    alt=""
                    width={featured ? 1280 : 640}
                    height={featured ? 560 : 480}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-50 grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-70 group-hover:grayscale-0"
                  />
                  {/* Duotone-ish tint + bottom-up scrim so type stays legible. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent mix-blend-multiply"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                      {story.category ?? 'Tin tức'}
                    </p>
                    <h3
                      className={`mt-3 font-light leading-tight text-white ${
                        featured ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'
                      }`}
                    >
                      {story.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
                  {story.summary}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {formatDate(story.date)}
                </p>
              </Link>
            </article>
          );
        })}
      </div>

      <Link
        to="/news"
        className={`mt-14 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline ${FOCUS}`}
      >
        Tất cả tin tức
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
