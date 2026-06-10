import type { Metadata } from 'next';
import './dashboard.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Your family learning dashboard. Find activities, track progress, and plan your week.',
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
