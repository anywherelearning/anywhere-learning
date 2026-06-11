'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        background: '#588157',
        color: '#FAF9F6',
        border: 0,
        padding: '10px 18px',
        borderRadius: 10,
        fontWeight: 600,
        fontFamily: 'inherit',
        fontSize: 13,
        cursor: 'pointer',
        boxShadow: '0 12px 26px -14px rgba(58,90,64,.55)',
        zIndex: 100,
      }}
    >
      Print / Save as PDF
    </button>
  );
}
