export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getDaysRemaining = (closingDate: Date) => {
  const now = new Date();
  const diffTime = closingDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getTimeProgress = (openDate: Date, closeDate: Date) => {
  const now = new Date();
  const open = new Date(openDate);
  const close = new Date(closeDate);
  const total = close.getTime() - open.getTime();
  const elapsed = now.getTime() - open.getTime();
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
};