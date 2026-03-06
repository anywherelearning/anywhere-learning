import { SignUp } from '@clerk/nextjs';
import { clerkAuthAppearance } from '@/lib/clerk-theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Anywhere Learning account to get started.',
};

export default function SignUpPage() {
  return <SignUp appearance={clerkAuthAppearance} />;
}
