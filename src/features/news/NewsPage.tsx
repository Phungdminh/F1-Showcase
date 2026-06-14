// NewsPage — editorial list driven by `news` importance (PLAN T11, DESIGN §4 dark page).
// Three tiers, each sorted newest-first:
//   importance 5  → large lead cards (2-col desktop) with art
//   importance 3–4 → medium rows
//   importance 1–2 → compact title + date rows
// Each card is wrapped in <RevealOnScroll> (stub passthrough today) and tagged
// data-motion="news-card" so the Phase-4 motion pass owns the scroll reveals. We author
// no entrance animation here.
import { ExternalLink } from 'lucide-react';
import Eyebrow from '../../components/Eyebrow';
import Navbar from '../../components/Navbar';
import RevealOnScroll from '../../components/motion/RevealOnScroll';
import { news } from '../../data/news';
import type { NewsItem } from '../../types';

const VI_DATE = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatDate(iso: string): string {
  return VI_DATE.format(new Date(iso));
}

function byDateDesc(a: NewsItem, b: NewsItem): number {
  return b.date.localeCompare(a.date);
}

function SourceLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
    >
      Nguồn
      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
    </a>
  );
}

/** importance 5 — large lead card with art. */
function LeadCard({ item }: { item: NewsItem }) {
  return (
    <RevealOnScroll>
      <article data-motion="news-card" className="flex flex-col">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            width={800}
            height={600}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        )}
        <div className="mt-6">
          {item.category && <Eyebrow className="mb-3">{item.category}</Eyebrow>}
          <h2 className="text-2xl font-light leading-snug text-neutral-900 md:text-3xl">
            {item.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base">
            {item.summary}
          </p>
          <div className="mt-5 flex items-center gap-4 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            <span aria-hidden="true" className="text-neutral-400">
              ·
            </span>
            <SourceLink url={item.sourceUrl} />
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
}

/** importance 3–4 — medium row (text only, generous type). */
function MediumRow({ item }: { item: NewsItem }) {
  return (
    <RevealOnScroll>
      <article
        data-motion="news-card"
        className="border-b border-neutral-200 py-8"
      >
        {item.category && <Eyebrow className="mb-3">{item.category}</Eyebrow>}
        <h3 className="max-w-3xl text-xl font-light leading-snug text-neutral-900 md:text-2xl">
          {item.title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          {item.summary}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          <span aria-hidden="true" className="text-neutral-400">
            ·
          </span>
          <SourceLink url={item.sourceUrl} />
        </div>
      </article>
    </RevealOnScroll>
  );
}

/** importance 1–2 — compact row: title + date. */
function CompactRow({ item }: { item: NewsItem }) {
  return (
    <RevealOnScroll>
      <article data-motion="news-card" className="border-b border-neutral-200 py-4">
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="grid grid-cols-[1fr_auto] items-baseline gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
        >
          <span className="truncate text-sm font-light text-neutral-700 hover:text-neutral-900 md:text-base">
            {item.title}
          </span>
          <time dateTime={item.date} className="shrink-0 text-xs tabular-nums text-neutral-500">
            {formatDate(item.date)}
          </time>
        </a>
      </article>
    </RevealOnScroll>
  );
}

export default function NewsPage() {
  const lead = news.filter((n) => n.importance === 5).sort(byDateDesc);
  const medium = news.filter((n) => n.importance === 3 || n.importance === 4).sort(byDateDesc);
  const compact = news.filter((n) => n.importance <= 2).sort(byDateDesc);

  const isEmpty = news.length === 0;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar variant="light" />
      <main className="px-5 pb-20 pt-10 md:px-16 md:pb-24 md:pt-16 lg:px-20 xl:px-28">
      <header className="max-w-3xl">
        <Eyebrow className="mb-6">Tin tức</Eyebrow>
        <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
          Tin nổi bật 2026
        </h1>
      </header>

      {isEmpty ? (
        <p className="mt-16 text-sm text-neutral-500">Chưa có tin tức.</p>
      ) : (
        <div className="mt-16 space-y-20 md:mt-20">
          {lead.length > 0 && (
            <section aria-label="Tin chính">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
                {lead.map((item) => (
                  <LeadCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {medium.length > 0 && (
            <section aria-label="Tin đáng chú ý">
              <Eyebrow className="mb-2">Đáng chú ý</Eyebrow>
              <div className="border-t border-neutral-200">
                {medium.map((item) => (
                  <MediumRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {compact.length > 0 && (
            <section aria-label="Tin nhanh">
              <Eyebrow className="mb-2">Tin nhanh</Eyebrow>
              <div className="border-t border-neutral-200">
                {compact.map((item) => (
                  <CompactRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      </main>
    </div>
  );
}
