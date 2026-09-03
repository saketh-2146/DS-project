import React from 'react';

// Common visual wrapper for DS components
export function DSVisualizer({ title, description, children, dsType, complexity }) {
  return (
    <div className="ds-card">
      <div className="ds-card-header">
        <div className="ds-icon" style={getIconStyle(dsType)}>
          {getIcon(dsType)}
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.25rem' }}>{title}</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-2)', lineHeight: 1.4 }}>
            {description}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
             {complexity && Object.entries(complexity).map(([op, time]) => (
               <span key={op} className="badge badge-primary" style={{ fontSize: '0.6rem' }}>
                 {op}: {time}
               </span>
             ))}
          </div>
        </div>
      </div>
      <div className="ds-card-body">
        {children}
      </div>
    </div>
  );
}

// Helpers for visualizer
function getIcon(type) {
  const map = {
    array: '[]',
    queue: '⇄',
    linkedlist: '→',
    bst: '⋎',
    heap: '▲',
    hash: '#',
    circular: '⟳'
  };
  return map[type] || '⚙';
}

function getIconStyle(type) {
  const map = {
    array: { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' },
    queue: { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' },
    linkedlist: { background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' },
    bst: { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' },
    heap: { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' },
    hash: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
    circular: { background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }
  };
  return map[type] || {};
}
