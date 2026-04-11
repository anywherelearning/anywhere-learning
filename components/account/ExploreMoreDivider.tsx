/**
 * Soft visual boundary between the user's downloads list and any optional
 * "explore more" content below. Signals: what's above is yours, what's below
 * is an invitation, not a demand.
 */
export default function ExploreMoreDivider() {
  return (
    <div
      className="flex items-center gap-4 mt-14 mb-10"
      role="separator"
      aria-label="Explore more"
    >
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Explore more
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}
