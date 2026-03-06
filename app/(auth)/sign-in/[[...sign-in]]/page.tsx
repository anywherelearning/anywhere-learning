import { SignIn } from '@clerk/nextjs';
import { clerkAuthAppearance } from '@/lib/clerk-theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Anywhere Learning account to access your downloads.',
};

export default function SignInPage() {
  return <SignIn appearance={clerkAuthAppearance} />;
}
