import type { Appearance } from '@clerk/types';

export const clerkAuthAppearance: Appearance = {
  variables: {
    colorPrimary: '#588157',
    colorDanger: '#dc2626',
    colorSuccess: '#588157',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#1a1a1a',
    colorText: '#1a1a1a',
    colorTextSecondary: '#6b7280',
    fontFamily: 'DM Sans, sans-serif',
    fontFamilyButtons: 'DM Sans, sans-serif',
    borderRadius: '1rem',
    spacingUnit: '1rem',
  },
  elements: {
    card: 'shadow-lg shadow-forest/[0.04] border border-gray-100/60',
    cardBox: 'rounded-2xl',
    headerTitle: 'font-display text-2xl text-forest',
    headerSubtitle: 'text-gray-500 text-sm',
    formFieldInput:
      'rounded-xl border-gray-200 bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 text-base py-3',
    formFieldLabel: 'text-gray-700 font-medium text-sm',
    formFieldErrorText: 'text-red-600 text-sm',
    formButtonPrimary:
      'bg-forest hover:bg-forest-dark text-cream font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-base',
    formButtonReset: 'text-forest hover:text-forest-dark text-sm font-medium',
    socialButtonsBlockButton:
      'border border-gray-200 rounded-xl py-3 hover:bg-gray-50 hover:border-forest/20 transition-all',
    socialButtonsBlockButtonText: 'text-gray-700 font-medium text-sm',
    dividerLine: 'bg-gray-200',
    dividerText: 'text-gray-400 text-xs',
    footer: 'bg-transparent',
    footerActionText: 'text-gray-500 text-sm',
    footerActionLink: 'text-forest hover:text-forest-dark font-semibold',
    alert: 'rounded-xl border-red-200 bg-red-50',
    alertText: 'text-red-700 text-sm',
    otpCodeFieldInput:
      'rounded-lg border-gray-200 focus:border-forest focus:ring-2 focus:ring-forest/20',
  },
  layout: {
    logoPlacement: 'none' as const,
  },
};
