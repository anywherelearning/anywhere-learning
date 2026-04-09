'use client';

import { useState } from 'react';

export default function ShareSection() {
  const [copied, setCopied] = useState(false);
  const shareUrl = 'https://anywherelearning.co/shop';
  const shareText =
    'I found these amazing real-world activity guides for kids, no prep, just open and go. Check them out:';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = `${shareText} ${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      'These activity guides are so good'
    );
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    const a = document.createElement('a');
    a.href = `mailto:?subject=${subject}&body=${body}`;
    a.click();
  };

  const handleTextShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Anywhere Learning',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // User cancelled or share failed - ignore
      });
    } else {
      // Fallback: copy the text
      handleCopy();
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <div className="text-center">
        <h2 className="font-display text-xl text-forest mb-1">
          Know a family who&apos;d love these?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Share the love - send them a link to browse.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Copy link */}
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border transition-all ${
              copied
                ? 'bg-forest/5 border-forest/20 text-forest'
                : 'bg-white border-gray-200 text-gray-700 hover:border-forest/30 hover:text-forest'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.03a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.59" />
                </svg>
                Copy link
              </>
            )}
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-forest/30 hover:text-forest transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Email
          </button>

          {/* Share / Text */}
          <button
            onClick={handleTextShare}
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-forest/30 hover:text-forest transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </section>
  );
}
