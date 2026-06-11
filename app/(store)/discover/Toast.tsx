'use client';

/**
 * Lightweight toast/notification system for the dashboard.
 *
 * - Replaces native confirm() and silent saves
 * - Supports success / error / info variants
 * - Supports an optional "undo" action button for destructive operations
 * - Auto-dismisses after a timeout (longer for actionable toasts)
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Entry saved');
 *   toast.error('Could not save');
 *   toast.info('5 entries imported');
 *   toast.confirm({ title: 'Delete this entry?', confirmLabel: 'Delete', onConfirm: () => ... });
 *   toast.undoable({ title: 'Entry deleted', onUndo: () => recreate() });
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'undo' | 'confirm';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  /** ms until auto-dismiss. 0 = sticky. */
  duration: number;
  /** Action label for undo / confirm variants. */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional second action (for confirm variant — e.g. "Cancel"). */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  undoable: (opts: {
    title: string;
    description?: string;
    onUndo: () => void;
    duration?: number;
  }) => void;
  confirm: (opts: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Soft fallback so callers never crash if provider missing
    return {
      success: (t) => console.log('[toast.success]', t),
      error: (t) => console.error('[toast.error]', t),
      info: (t) => console.info('[toast.info]', t),
      undoable: ({ title, onUndo }) => {
        console.log('[toast.undoable]', title);
        if (confirm(`${title}\n\nClick OK to undo.`)) onUndo();
      },
      confirm: ({ title, onConfirm }) => {
        if (confirm(title)) onConfirm();
      },
      dismiss: () => {},
    };
  }
  return ctx;
}

function genId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id?: string) => {
    setItems((prev) => (id ? prev.filter((t) => t.id !== id) : []));
    if (id) {
      const t = timers.current.get(id);
      if (t) {
        clearTimeout(t);
        timers.current.delete(id);
      }
    } else {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    }
  }, []);

  const push = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = genId();
      const toast: ToastItem = { ...item, id };
      setItems((prev) => [...prev.slice(-4), toast]); // cap at 5 visible
      if (toast.duration > 0) {
        const t = setTimeout(() => dismiss(id), toast.duration);
        timers.current.set(id, t);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) =>
        void push({ variant: 'success', title, description, duration: 3500 }),
      error: (title, description) =>
        void push({ variant: 'error', title, description, duration: 5500 }),
      info: (title, description) =>
        void push({ variant: 'info', title, description, duration: 4000 }),
      undoable: ({ title, description, onUndo, duration = 7000 }) =>
        void push({
          variant: 'undo',
          title,
          description,
          duration,
          actionLabel: 'Undo',
          onAction: onUndo,
        }),
      confirm: ({
        title,
        description,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        destructive,
        onConfirm,
        onCancel,
      }) =>
        void push({
          variant: 'confirm',
          title,
          description,
          duration: 0,
          actionLabel: destructive ? `Yes, ${confirmLabel.toLowerCase()}` : confirmLabel,
          onAction: onConfirm,
          secondaryLabel: cancelLabel,
          onSecondary: onCancel,
        }),
      dismiss,
    }),
    [push, dismiss]
  );

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function variantStyle(v: ToastVariant): { accent: string; icon: string } {
  switch (v) {
    case 'success':
      return { accent: '#588157', icon: '✓' };
    case 'error':
      return { accent: '#A65456', icon: '!' };
    case 'info':
      return { accent: '#5B8FA8', icon: 'i' };
    case 'undo':
      return { accent: '#7B8378', icon: '↺' };
    case 'confirm':
      return { accent: '#3A5A40', icon: '?' };
  }
}

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 'calc(100vw - 32px)',
        width: 360,
        pointerEvents: 'none',
      }}
    >
      {items.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { accent, icon } = variantStyle(toast.variant);
  return (
    <div
      role={toast.variant === 'error' || toast.variant === 'confirm' ? 'alertdialog' : 'status'}
      style={{
        pointerEvents: 'auto',
        background: '#FAF9F6',
        border: `1px solid ${accent}33`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 18px 36px -18px rgba(45,58,46,.35)',
        fontFamily: '"DM Sans", -apple-system, sans-serif',
        display: 'grid',
        gridTemplateColumns: '24px 1fr auto',
        gap: 12,
        alignItems: 'start',
        animation: 'toast-in .18s ease-out',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: `${accent}22`,
          color: accent,
          fontWeight: 700,
          fontSize: 13,
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: '#2D3A2E', fontWeight: 600, fontSize: 13.5, lineHeight: 1.35 }}>
          {toast.title}
        </div>
        {toast.description && (
          <div style={{ color: '#4F5A50', fontSize: 12.5, lineHeight: 1.45, marginTop: 2 }}>
            {toast.description}
          </div>
        )}
        {(toast.actionLabel || toast.secondaryLabel) && (
          <div className="flex gap-2 mt-2.5">
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss();
                }}
                style={{
                  appearance: 'none',
                  cursor: 'pointer',
                  border: 0,
                  background: accent,
                  color: '#FAF9F6',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                {toast.actionLabel}
              </button>
            )}
            {toast.secondaryLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onSecondary?.();
                  onDismiss();
                }}
                style={{
                  appearance: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#4F5A50',
                  border: '1px solid #E5E0D2',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                {toast.secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          appearance: 'none',
          cursor: 'pointer',
          background: 'transparent',
          border: 0,
          color: '#7B8378',
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
          marginTop: -2,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
