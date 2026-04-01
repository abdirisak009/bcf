import { NextResponse } from 'next/server';

import type { FacebookPostDto } from '@/lib/facebook-posts-types';
import { FACEBOOK_PAGE_ID, FACEBOOK_PAGE_URL } from '@/lib/site-config';

/** Graph API: set `FACEBOOK_PAGE_ACCESS_TOKEN` (Page access token). */
export async function GET() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() || FACEBOOK_PAGE_ID;

  if (!token) {
    return NextResponse.json({
      success: false,
      posts: [] as FacebookPostDto[],
      reason: 'not_configured' as const,
    });
  }

  try {
    const fields = ['id', 'message', 'story', 'created_time', 'permalink_url', 'full_picture'].join(',');
    const url = new URL(`https://graph.facebook.com/v21.0/${pageId}/posts`);
    url.searchParams.set('fields', fields);
    url.searchParams.set('limit', '12');
    url.searchParams.set('access_token', token);

    const res = await fetch(url.toString(), {
      next: { revalidate: 900 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        posts: [] as FacebookPostDto[],
        reason: 'graph_error' as const,
      });
    }

    const json = (await res.json()) as {
      data?: Array<{
        id: string;
        message?: string;
        story?: string;
        created_time?: string;
        permalink_url?: string;
        full_picture?: string;
      }>;
    };

    const raw = json.data ?? [];
    const posts: FacebookPostDto[] = [];

    for (const p of raw) {
      const text = (p.message ?? p.story ?? '').trim();
      if (!text && !p.full_picture) continue;

      const permalink = p.permalink_url?.trim() || FACEBOOK_PAGE_URL;

      posts.push({
        id: p.id,
        message: text || 'View this post on Facebook',
        created_time: p.created_time ?? '',
        permalink_url: permalink,
        full_picture: p.full_picture?.trim() || null,
      });
      if (posts.length >= 3) break;
    }

    return NextResponse.json({ success: true, posts, reason: null });
  } catch {
    return NextResponse.json({
      success: false,
      posts: [] as FacebookPostDto[],
      reason: 'fetch_failed' as const,
    });
  }
}
