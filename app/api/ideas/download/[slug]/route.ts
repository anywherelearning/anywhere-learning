import { NextRequest, NextResponse } from 'next/server';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';
import {
  getIdeaListPdfUrls,
  getIdeaListPdfFilename,
  type IdeaListPdfVariant,
} from '@/lib/idea-list-pdfs';
import {
  IDEAS_UNLOCK_COOKIE,
  IDEAS_UNLOCK_QUERY,
  ideaUnlockCookie,
  verifyIdeaUnlockToken,
} from '@/lib/idea-list-unlock';

// ─── Gated delivery of an idea-list printable ───
//
// Proof of signup is a signed token, either in the httpOnly cookie the
// subscribe route set, or in `?t=` on the link from the Kit welcome email.
// A valid email-link token also sets the cookie, so that device is unlocked
// from then on.
//
// The PDF is streamed through here rather than redirected to, because the
// idea-list Blob paths are plain filenames with no random suffix. A redirect
// would put the permanent public URL in the address bar and the gate would
// be a formality. The files are one or two pages, so the hop is cheap.
//
// Without proof, the visitor is sent back to the list page with a flag the
// unlock card reads to clear a stale browser-side unlock and show the form.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
  const urls = getIdeaListPdfUrls(slug);
  if (!urls) {
    return NextResponse.json({ error: 'Unknown checklist' }, { status: 404 });
  }

  const variant: IdeaListPdfVariant =
    req.nextUrl.searchParams.get('v') === 'bw' ? 'bw' : 'color';

  const linkToken = req.nextUrl.searchParams.get(IDEAS_UNLOCK_QUERY);
  const cookieToken = req.cookies.get(IDEAS_UNLOCK_COOKIE)?.value;
  const viaLink = verifyIdeaUnlockToken(linkToken);
  const unlocked = viaLink || verifyIdeaUnlockToken(cookieToken);

  if (!unlocked) {
    const back = new URL(`/ideas/${slug}`, req.nextUrl.origin);
    back.searchParams.set('unlock', 'needed');
    return NextResponse.redirect(back, 303);
  }

  const upstream = await fetch(urls[variant], { cache: 'no-store' });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: 'The file is not available right now. Please try again.' },
      { status: 502 },
    );
  }

  const filename = getIdeaListPdfFilename(slug, variant) ?? `${slug}.pdf`;
  const res = new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // Inline so the browser opens it in its viewer, filename for "save as".
      'Content-Disposition': `inline; filename="${filename.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
      ...(upstream.headers.get('content-length')
        ? { 'Content-Length': upstream.headers.get('content-length')! }
        : {}),
    },
  });

  // An email-link visit unlocks this device too. Refresh the cookie with the
  // link's token rather than minting a new one, so its expiry is honoured.
  if (viaLink && linkToken && linkToken !== cookieToken) {
    res.cookies.set(ideaUnlockCookie(linkToken));
  }

  return res;
}
