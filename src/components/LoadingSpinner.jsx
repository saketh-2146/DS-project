export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className="spinner"></div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Loading...
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {spinner}
      </div>
    );
  }

  return <div className="loading-overlay">{spinner}</div>;
}
