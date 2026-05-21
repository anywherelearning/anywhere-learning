/**
 * Anywhere Learning brand styling for Clerk's hosted UI components.
 *
 * Used by:
 *   - <SignIn />        (sign-in page + reverification modal)
 *   - <SignUp />        (sign-up page)
 *   - <UserButton />    (avatar menu, used in some embedded contexts)
 *
 * Tailwind utility classes are passed straight into Clerk's slot names.
 * Variables drive the underlying CSS custom properties (focus rings,
 * dividers, etc.) that aren't reachable via element slots.
 */

export const clerkAuthAppearance = {
  variables: {
    // Brand colors — sage forest as the primary action, cream as the surface
    colorPrimary: '#588157',
    colorDanger: '#7A3D24', // brand terracotta for errors, not generic red
    colorSuccess: '#588157',
    colorBackground: '#FAF8F3', // cream
    colorInputBackground: '#FAF8F3',
    colorInputText: '#2D3A2E', // ink
    colorText: '#2D3A2E',
    colorTextSecondary: '#7B8378',
    colorNeutral: '#7B8378',
    // Typography — DM Sans body, no Google Fonts roundtrip required by Clerk
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    fontFamilyButtons: '"DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    fontSize: '15px',
    borderRadius: '12px',
    spacingUnit: '1rem',
  },
  elements: {
    // Outer card / shell
    rootBox: 'w-full max-w-[440px]',
    card: 'bg-cream border border-[#D8D4C5] rounded-[18px] shadow-[0_24px_48px_-24px_rgba(45,58,46,0.18)] px-7 py-8',
    cardBox: 'shadow-none border-0 bg-transparent',
    main: 'gap-5',

    // Header
    header: 'pb-1',
    headerTitle:
      'font-display text-[clamp(1.625rem,3vw,2rem)] leading-[1.1] tracking-tight text-ink',
    headerSubtitle: 'text-[14px] text-gray-500 leading-[1.5] mt-1',

    // Social buttons
    socialButtons: 'gap-2.5',
    socialButtonsBlockButton:
      'border border-[#D8D4C5] bg-cream rounded-[10px] py-2.5 px-4 font-body font-medium text-[14px] text-ink hover:bg-[#F2EFE4] hover:border-[#C9C5B7] transition-all shadow-none',
    socialButtonsBlockButtonText: 'font-body font-medium text-[14px]',
    socialButtonsProviderIcon: 'w-4 h-4',

    // Divider
    dividerRow: 'my-4',
    dividerLine: 'bg-[#D8D4C5]',
    dividerText:
      'text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400 px-3',

    // Form fields
    formFieldLabel:
      'block font-body font-semibold text-[12.5px] uppercase tracking-[0.14em] text-gray-600 mb-1.5',
    formFieldInput:
      'w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all',
    formFieldInputShowPasswordButton: 'text-gray-500 hover:text-forest-dark',
    formFieldHintText: 'text-[12.5px] text-gray-500 mt-1',
    formFieldErrorText:
      'text-[12.5px] text-[#7A3D24] mt-1 font-body font-medium',
    formFieldAction:
      'text-[12.5px] text-forest-dark font-body font-semibold no-underline border-b border-forest/25 hover:text-forest hover:border-forest transition-colors',

    // Primary button
    formButtonPrimary:
      'w-full bg-forest text-cream font-body font-semibold text-[14.5px] py-3 rounded-[10px] shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all border-0',
    formButtonReset: 'text-forest-dark font-body font-medium text-[13.5px] hover:text-forest',

    // OTP / verification code
    otpCodeFieldInputs: 'gap-2',
    otpCodeFieldInput:
      'w-12 h-12 text-center bg-cream border border-[#D8D4C5] rounded-[10px] font-body text-[18px] tracking-[0.2em] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all',

    // Footer (sign up / forgot password links)
    footer: 'bg-transparent pt-2 -mt-1',
    footerAction: 'text-[13.5px] text-gray-500',
    footerActionText: 'text-[13.5px] text-gray-500',
    footerActionLink:
      'text-forest-dark font-body font-semibold border-b border-forest/25 hover:text-forest hover:border-forest transition-colors no-underline',

    // Alerts
    alert: 'rounded-[10px] border border-[#E8D4C2] bg-[#F7EBE2] px-3.5 py-2.5',
    alertText: 'text-[13px] text-[#7A3D24] font-body',

    // Modal (the reverification challenge that pops up mid-flow)
    modalBackdrop: 'bg-[#2D3A2E]/40 backdrop-blur-sm',
    modalContent: 'bg-cream border border-[#D8D4C5] rounded-[18px] shadow-[0_32px_64px_-16px_rgba(45,58,46,0.35)]',

    // Loading spinner
    spinner: 'text-forest',

    // Logo (hidden — we set our own brand context outside the widget)
    logoBox: 'hidden',

    // Internal page nav (forgot password breadcrumb, etc.)
    backLink: 'text-[13px] text-gray-500 hover:text-forest-dark',
  },
  layout: {
    logoPlacement: 'none' as const,
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'blockButton' as const,
    showOptionalFields: false,
  },
};
