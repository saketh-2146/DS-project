import { useApp } from '../context/AppContext';

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export default function Toast() {
  const { toasts } = useApp();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{ICONS[t.type] || '🔔'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
