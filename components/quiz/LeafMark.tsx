// Shared by the quiz island and the server-rendered context on /quiz.
export default function LeafMark({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M20 3C10 4 4 10 4 18c0 1 .2 2 .5 3 6 .5 15-3.5 15.5-18Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M6 20C9 13 13 8 19 5"
        fill="none"
        stroke="#faf9f6"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
