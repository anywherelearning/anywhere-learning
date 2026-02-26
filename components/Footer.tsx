import Link from "next/link";
import { LogoIcon } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-forest/10 py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link href="/" aria-label="Anywhere Learning home">
            <LogoIcon size={32} />
          </Link>
          <p className="font-display text-sm text-forest/50">
            Meaningful Learning, Wherever You Are
          </p>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Anywhere Learning &middot; info@anywherelearning.co
          </p>
        </div>
      </div>
    </footer>
  );
}
