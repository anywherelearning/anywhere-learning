'use client';

import { useState } from 'react';

/** Copy-paste iframe snippet so bloggers can embed a tool on their own site. */
export default function EmbedSnippet({ toolSlug, toolName }: { toolSlug: string; toolName: string }) {
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="https://anywherelearning.co/embed/${toolSlug}" width="100%" height="760" style="border:1px solid #e5e2da;border-radius:12px;" title="${toolName} by Anywhere Learning" loading="lazy"></iframe>\n<p style="font-size:13px;">Free tool by <a href="https://anywherelearning.co/tools/${toolSlug}">Anywhere Learning</a></p>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the user can still select the text manually.
    }
  }

  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-6">
      <pre className="overflow-x-auto rounded-lg bg-warm-gray p-4 text-xs leading-relaxed text-gray-700">
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-3 rounded-full border-2 border-forest px-5 py-2 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-forest"
      >
        {copied ? 'Copied!' : 'Copy embed code'}
      </button>
    </div>
  );
}
