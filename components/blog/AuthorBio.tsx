import Image from 'next/image';
import type { BlogAuthor } from '@/lib/blog';

interface AuthorBioProps {
  author: BlogAuthor;
}

export default function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="relative rounded-2xl bg-white p-7 md:p-9 border border-gray-100/60 shadow-[0_1px_16px_-4px_rgba(0,0,0,0.04)]">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="flex items-start gap-5">
        {author.avatarImage ? (
          <Image
            src={author.avatarImage}
            alt={author.name}
            width={64}
            height={64}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0 shadow-sm ring-2 ring-white"
          />
        ) : (
          <div
            className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-cream font-semibold text-xl flex-shrink-0 shadow-sm ring-2 ring-white"
            style={{ backgroundColor: author.avatarColor }}
          >
            {author.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold/70 mb-1.5">
            Written by
          </p>
          <p className="font-semibold text-gray-900 text-lg leading-tight mb-2">
            {author.name}
          </p>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            {author.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
