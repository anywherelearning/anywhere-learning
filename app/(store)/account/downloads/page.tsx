import { redirect } from 'next/navigation';

// Retired: this listed single guides bought in the old one-time shop, and
// there are none (everything lives in the membership Library now). Kept as a
// redirect so old links, bookmarks and emails still land somewhere useful.
export default function DownloadsPage() {
  redirect('/account');
}
