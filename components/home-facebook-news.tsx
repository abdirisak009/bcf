'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { FACEBOOK_PAGE_URL } from '@/lib/site-config';
import type { FacebookPostDto } from '@/lib/facebook-posts-types';

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function formatFbDate(iso: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function truncate(s: string, n = 140) {
  const t = s.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n).trim()}…`;
}

/** Official Page Plugin URL — timeline shows recent posts without a Graph API token. */
function facebookPagePluginSrc() {
  const params = new URLSearchParams({
    href: FACEBOOK_PAGE_URL,
    tabs: 'timeline',
    width: '500',
    height: '720',
    small_header: 'false',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
    lazy: 'true',
  });
  return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
}

export default function HomeFacebookNews() {
  const [posts, setPosts] = useState<FacebookPostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/facebook-posts', { cache: 'no-store' });
        const json = (await res.json()) as {
          success?: boolean;
          posts?: FacebookPostDto[];
        };
        if (cancelled) return;
        setPosts(Array.isArray(json.posts) ? json.posts : []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showFallback = !loading && posts.length === 0;

  return (
    <section className="relative overflow-hidden border-y border-slate-200/80 bg-gradient-to-b from-white via-slate-50/90 to-white py-20 md:py-24">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-teal/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-navy/[0.06] blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/25 bg-[#1877F2]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#1877F2]">
            <FacebookMark className="h-4 w-4" />
            Facebook
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-navy md:text-4xl lg:text-5xl">
            Latest from our page
          </h2>
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-brand-teal" />
          <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
            Stay connected with updates, insights, and announcements from Baraarug Consulting Firm.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-3xl border border-slate-200/90 bg-slate-200/60 shadow-inner"
              />
            ))}
          </div>
        ) : showFallback ? (
          <div className="mx-auto w-full max-w-xl">
            <p className="mb-4 text-center text-sm text-slate-500">
              Recent posts from our Facebook page — scroll the feed below.
            </p>
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]">
              {/* eslint-disable-next-line react/iframe-missing-sandbox -- Facebook embed; sandbox breaks plugin */}
              <iframe
                title="Baraarug Consulting Firm — Facebook page"
                src={facebookPagePluginSrc()}
                width={500}
                height={720}
                className="mx-auto block w-full max-w-[500px] border-0"
                style={{ minHeight: 400 }}
                scrolling="no"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Can&apos;t see the feed?{' '}
              <Link
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1877F2] hover:underline"
              >
                Open Facebook
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.15)] transition duration-300 hover:-translate-y-1 hover:border-brand-teal/30 hover:shadow-[0_24px_50px_-24px_rgba(23,94,126,0.2)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {post.full_picture ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Facebook CDN URLs vary; next/image remotePatterns would be broad
                    <img
                      src={post.full_picture}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1877F2]/12 to-brand-teal/10 p-6 text-center">
                      <FacebookMark className="h-12 w-12 text-[#1877F2]/80" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Post</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <time className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {formatFbDate(post.created_time)}
                  </time>
                  <p className="mb-5 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-700 sm:text-[0.9375rem]">
                    {truncate(post.message, 220)}
                  </p>
                  <Link
                    href={post.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#1877F2] transition hover:text-brand-navy"
                  >
                    View on Facebook
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && posts.length > 0 ? (
          <div className="mt-10 text-center">
            <Link
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy underline-offset-4 transition hover:text-brand-teal hover:underline"
            >
              See all updates on Facebook
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
