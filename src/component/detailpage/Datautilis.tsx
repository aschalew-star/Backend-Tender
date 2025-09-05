export const formatDate = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return ""; // return empty string if invalid/null

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const getDaysRemaining = (closingDateInput: string | Date | null | undefined) => {
  if (!closingDateInput) return 0; // no date → 0 days remaining

  const closingDate =
    typeof closingDateInput === "string" ? new Date(closingDateInput) : closingDateInput;

  const now = new Date();
  const diffTime = closingDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getTimeProgress = (
  openDateInput: string | Date | null | undefined,
  closeDateInput: string | Date | null | undefined
) => {
  if (!openDateInput || !closeDateInput) return 0;

  const open = typeof openDateInput === "string" ? new Date(openDateInput) : openDateInput;
  const close = typeof closeDateInput === "string" ? new Date(closeDateInput) : closeDateInput;
  const now = new Date();

  const total = close.getTime() - open.getTime();
  if (total <= 0) return 100; // already closed or invalid range

  const elapsed = now.getTime() - open.getTime();
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
};
