import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount?: number | null,
  currency: string = 'INR'
): string {
  if (amount === undefined || amount === null) return '';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  currency: string = 'INR'
): string {
  if (!min && !max) return 'Not specified';
  
  // Clean LPA display for Indian Rupee amounts
  if (currency === 'INR') {
    const toLpa = (val: number) => {
      const lpa = val / 100000;
      return Number.isInteger(lpa) ? `${lpa} LPA` : `${lpa.toFixed(1)} LPA`;
    };
    if (min && !max) return min >= 100000 ? `₹${toLpa(min)}+` : `${formatCurrency(min, 'INR')}+`;
    if (!min && max) return max >= 100000 ? `Up to ₹${toLpa(max)}` : `Up to ${formatCurrency(max, 'INR')}`;
    if (min && max && min >= 100000 && max >= 100000) {
      return `₹${toLpa(min)} - ${toLpa(max)}`;
    }
  }

  if (min && !max) return `${formatCurrency(min, currency)}+`;
  if (!min && max) return `Up to ${formatCurrency(max, currency)}`;
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
