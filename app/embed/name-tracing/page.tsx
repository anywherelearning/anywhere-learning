import NameTracingTool from '@/components/tools/NameTracingTool';

/**
 * Embeddable name tracing generator: the widget bloggers iframe onto their
 * own sites. Minimal chrome, one "powered by" backlink. The headers()
 * carve-out in next.config.ts makes /embed/* frameable by any origin.
 */
export default function NameTracingEmbedPage() {
  return (
    <div className="p-4 sm:p-6">
      <NameTracingTool embed />
      <p className="mt-4 text-center text-xs text-gray-500">
        Free tool by{' '}
        <a
          href="https://anywherelearning.co/tools/name-tracing"
          target="_blank"
          rel="noopener"
          className="font-semibold text-forest underline-offset-2 hover:underline"
        >
          Anywhere Learning
        </a>{' '}
        · Meaningful Learning, Wherever You Are
      </p>
    </div>
  );
}
