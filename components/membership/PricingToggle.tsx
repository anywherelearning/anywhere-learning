'use client';

import { useState } from 'react';

type Plan = 'monthly' | 'annual';

export default function PricingToggle() {
  const [plan, setPlan] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        window.location.href = '/sign-in?redirect_url=/membership';
        return;
      }

      const data = await res.json();

      if (data.error === 'Already an active member') {
        window.location.href = '/account/library';
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-1 bg-gray-100 p-1 rounded-full mb-8">
        <button
          onClick={() => setPlan('monthly')}
          className={`flex-1 text-sm font-medium py-2.5 px-4 rounded-full transition-all ${
            plan === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setPlan('annual')}
          className={`flex-1 text-sm font-medium py-2.5 px-4 rounded-full transition-all ${
            plan === 'annual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Annual
          <span className="ml-1.5 text-xs font-semibold text-forest">Save 37%</span>
        </button>
      </div>

      {/* Price card */}
      <div className="bg-white rounded-2xl border-2 border-forest/20 p-8 text-center shadow-sm">
        <div className="flex items-baseline justify-center gap-1 mb-1">
          <span className="text-5xl font-bold text-gray-900">
            ${plan === 'monthly' ? '19.99' : '12.49'}
          </span>
          <span className="text-gray-500 text-lg">/mo</span>
        </div>
        {plan === 'annual' && (
          <p className="text-sm text-gray-400 mb-4">
            $149.99/year &middot; billed annually
          </p>
        )}
        {plan === 'monthly' && (
          <p className="text-sm text-gray-400 mb-4">
            Cancel anytime &middot; billed monthly
          </p>
        )}

        {error && (
          <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-left animate-shake">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-forest text-cream font-semibold text-lg py-3.5 rounded-2xl hover:bg-forest-dark transition-colors disabled:opacity-60 disabled:cursor-wait shadow-sm"
        >
          {loading ? 'Setting up\u2026' : 'Start Your Membership'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Cancel anytime from your account. No questions asked.
        </p>
      </div>
    </div>
  );
}
