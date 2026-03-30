'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { FACEBOOK_PAGE_URL } from '@/lib/site-config';
import type { FacebookPostDto } from '@/lib/facebook-posts-types';
import { cn } from '@/lib/utils';

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

export type FacebookFeedColumnProps = {
  className?: string;
};

/** Center-column Facebook feed (Graph API posts or Page Plugin iframe). */
export function FacebookFeedColumn({ className }: FacebookFeedColumnProps) {
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
    <div
      className={cn(
        'relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18)]',
        'ring-1 ring-slate-900/[0.04]',
        className,
      )}
    >
      <div className="relative border-b border-slate-100 bg-gradient-to-r from-[#1877F2]/12 via-white to-brand-teal/10 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md shadow-[#1877F2]/25">
              <FacebookMark className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1877F2]">Facebook</p>
              <p className="text-sm font-semibold text-brand-navy">Latest updates</p>
            </div>
          </div>
          <Link
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-navy underline-offset-4 transition hover:border-[#1877F2]/40 hover:text-[#1877F2] sm:inline-flex"
          >
            Page
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4 sm:py-5">
        {loading ? (
          <div className="flex flex-1 flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[140px] flex-1 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/80"
              />
            ))}
          </div>
        ) : showFallback ? (
          <div className="flex flex-1 flex-col">
            <p className="mb-3 text-center text-xs text-slate-500">{`Scroll the feed — connect with us on Facebook.`}</p>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 p-1 sm:p-2">
              {/* eslint-disable-next-line react/iframe-missing-sandbox -- Facebook embed; sandbox breaks plugin */}
              <iframe
                title="Baraarug Consulting Firm — Facebook page"
                src={facebookPagePluginSrc()}
                width={500}
                height={720}
                className="mx-auto block w-full max-w-full border-0"
                style={{ minHeight: 400, height: 'min(72vh, 720px)' }}
                scrolling="no"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
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
          <div className="flex flex-col gap-4">
            {posts.slice(0, 4).map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/40 transition hover:border-[#1877F2]/35 hover:bg-white hover:shadow-md"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {post.full_picture ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Facebook CDN
                    <img
                      src={post.full_picture}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1877F2]/10 to-brand-teal/10">
                      <FacebookMark className="h-10 w-10 text-[#1877F2]/80" />
                    </div>
                  )}
                </div>
                <div className="p-3.5 sm:p-4">
                  <time className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {formatFbDate(post.created_time)}
                  </time>
                  <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-700">{truncate(post.message, 160)}</p>
                  <Link
                    href={post.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1877F2] hover:text-brand-navy"
                  >
                    View on Facebook
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
            <div className="pt-1 text-center">
              <Link
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy underline-offset-4 transition hover:text-brand-teal hover:underline"
              >
                See all on Facebook
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Default export for older imports. Home page should use `NewsEvents` only (Facebook is in the center column).
 */
export default function HomeFacebookNews(props: FacebookFeedColumnProps) {
  return <FacebookFeedColumn {...props} />;
}
