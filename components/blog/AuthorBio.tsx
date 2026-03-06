import type { BlogAuthor } from '@/lib/blog';

interface AuthorBioProps {
  author: BlogAuthor;
}

export default function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="bg-warm-gradient rounded-2xl p-8 md:p-10 border border-gray-100/50">
      <div className="flex items-start gap-5">
        <div
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-cream font-semibold text-xl flex-shrink-0"
          style={{ backgroundColor: author.avatarColor }}
        >
          {author.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">
            Written by {author.name}
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            {author.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
