export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return '$0';
  
  if (amount >= 1000000000000) {
    const value = (amount / 1000000000000).toFixed(1);
    return '$' + (value.endsWith('.0') ? value.slice(0, -2) : value) + 't';
  } else if (amount >= 1000000000) {
    const value = (amount / 1000000000).toFixed(1);
    return '$' + (value.endsWith('.0') ? value.slice(0, -2) : value) + 'b';
  } else if (amount >= 1000000) {
    const value = (amount / 1000000).toFixed(1);
    return '$' + (value.endsWith('.0') ? value.slice(0, -2) : value) + 'm';
  } else if (amount >= 1000) {
    const value = (amount / 1000).toFixed(1);
    return '$' + (value.endsWith('.0') ? value.slice(0, -2) : value) + 'k';
  }
  return '$' + amount.toFixed(0);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatAuraScore(num: number): string {
  // Always show full number with commas - no abbreviations for aura scores
  return num.toLocaleString();
}

export function formatVolume(num: number): string {
  if (num >= 1000000000000) {
    return (num / 1000000000000).toFixed(2) + 'T';
  } else if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatPercentageWithCommas(value: number): string {
  const formattedNumber = value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  return `${value >= 0 ? '+' : ''}${formattedNumber}%`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateForTimeRange(date: string, timeRange: string): string {
  const dateObj = new Date(date);
  
  if (timeRange === 'all') {
    // For all-time view, show year and month only
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } else if (timeRange === '90d') {
    // For 90 days, show month and day
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } else {
    // For shorter periods (24h, 7d, 30d), show month and day
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
} 