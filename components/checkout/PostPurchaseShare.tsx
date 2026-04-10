'use client';

import { useState } from 'react';

interface PostPurchaseShareProps {
  referralCode?: string;
}

export default function PostPurchaseShare({ referralCode }: PostPurchaseShareProps) {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const shareUrl = 'https://anywherelearning.co/shop';
  const shareText = referralCode
    ? `I just got the best real-world activity guides for my kids, low prep, just open and go! Use my code ${referralCode} for 15% off:`
    : 'Just got the most amazing real-world activity guides for my kids, low prep, just open and go! Check them out:';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
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

  const handleCopyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = referralCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      'You need to see these activity guides'
    );
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    const a = document.createElement('a');
    a.href = `mailto:?subject=${subject}&body=${body}`;
    a.click();
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      // Combine text + URL into one string so the promo code is always visible
      // (many apps strip the separate `text` field and only show `url`)
      navigator.share({
        title: 'Anywhere Learning',
        text: `${shareText} ${shareUrl}`,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4">
      {/* Referral code box */}
      {referralCode && (
        <div className="bg-forest/5 border-2 border-dashed border-forest/30 rounded-2xl p-5 mb-2">
          <p className="text-sm text-gray-600 mb-3">
            Share your code - they get 15% off, and you will too.
          </p>
          <button
            onClick={handleCopyCode}
            className={`inline-flex items-center gap-2 text-lg font-bold tracking-wider px-6 py-3 rounded-xl transition-all ${
              codeCopied
                ? 'bg-forest text-cream'
                : 'bg-white text-forest border-2 border-forest/20 hover:border-forest/40'
            }`}
          >
            {codeCopied ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                {referralCode}
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            They enter this at checkout in the promo code field.
          </p>
        </div>
      )}

      {/* Share buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Copy link */}
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border transition-all ${
            copied
              ? 'bg-forest/10 border-forest/25 text-forest'
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              Copy message
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
          Email a friend
        </button>

        {/* Share */}
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-forest/30 hover:text-forest transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
