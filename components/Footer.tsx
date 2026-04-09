import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-gray-200/60 py-8">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <nav className="flex items-center justify-center gap-6 mb-4">
          <Link href="/shop" className="text-sm font-medium text-gray-500 hover:text-forest transition-colors">
            Activity Guides
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-forest transition-colors">
            Home
          </Link>
        </nav>
        <p className="font-[family-name:var(--font-display)] text-sm text-forest/60">
          Meaningful Learning, Wherever You Are
        </p>
        <p className="mt-2 text-xs text-gray-400">
          © {new Date().getFullYear()} Anywhere Learning · info@anywherelearning.co
        </p>
      </div>
    </footer>
  );
}
