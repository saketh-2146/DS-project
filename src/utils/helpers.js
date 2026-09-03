// General helper utilities

export const generateId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatCurrency = (amount) => {
  if (amount === 0) return 'FREE';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDateTime = (dateStr, timeStr) =>
  `${formatDate(dateStr)} at ${timeStr}`;

export const isEventUpcoming = (dateStr) =>
  new Date(dateStr) >= new Date(new Date().toDateString());

export const isEventPast = (dateStr) =>
  new Date(dateStr) < new Date(new Date().toDateString());

export const getSeatPercentage = (available, total) =>
  total > 0 ? Math.round(((total - available) / total) * 100) : 0;

export const getSeatStatusColor = (available, total) => {
  const ratio = available / total;
  if (ratio === 0) return '#ef4444';     // red — sold out
  if (ratio < 0.2) return '#f97316';    // orange — almost full
  if (ratio < 0.5) return '#eab308';    // yellow — limited
  return '#22c55e';                      // green — available
};

export const getSeatStatusLabel = (available, total) => {
  if (available === 0) return 'Sold Out';
  if (available / total < 0.2) return 'Almost Full';
  if (available / total < 0.5) return 'Filling Fast';
  return 'Available';
};

export const truncate = (str, len = 120) =>
  str && str.length > len ? str.slice(0, len) + '…' : str;

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date(new Date().toDateString());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getCategoryColor = (category) => {
  const map = {
    Technology: { bg: '#1e3a5f', text: '#60a5fa', border: '#3b82f6' },
    Music: { bg: '#3b0764', text: '#c084fc', border: '#a855f7' },
    Sports: { bg: '#052e16', text: '#4ade80', border: '#22c55e' },
    Workshops: { bg: '#431407', text: '#fb923c', border: '#f97316' },
    Cultural: { bg: '#450a0a', text: '#f87171', border: '#ef4444' },
    'College Events': { bg: '#1e3a5f', text: '#93c5fd', border: '#60a5fa' },
  };
  return map[category] || { bg: '#1e293b', text: '#94a3b8', border: '#475569' };
};

export const hashPassword = (password) => {
  // Simple deterministic hash for demo (not production-safe)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};
