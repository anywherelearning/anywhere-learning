/**
 * Auth route group layout. The pages themselves render their own chrome
 * (logo, tagline, "Back to home"), so this layout is intentionally a
 * passthrough — keeping the route group structural but not visually
 * doubling the brand mark.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
