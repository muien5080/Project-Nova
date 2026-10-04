export function formatNumber(val: number, decimals: number = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  if (val < 0) return '-' + formatNumber(-val, decimals);
  if (val === 0) return '0';

  if (val < 1000) {
    // If it has decimals, show at most 1 or 2 decimals
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(decimals);
  }

  const suffixes = [
    '',
    'K',
    'M',
    'B',
    'T',
    'Qa',
    'Qi',
    'Sx',
    'Sp',
    'Oc',
    'No',
    'Dc',
  ];
  const tier = (Math.log10(val) / 3) | 0;

  if (tier < suffixes.length) {
    const scale = Math.pow(10, tier * 3);
    const scaled = val / scale;
    return scaled.toFixed(decimals) + suffixes[tier];
  }

  return val.toExponential(2);
}

export function formatPerSecond(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '+0/s';
  const sign = val > 0 ? '+' : '';
  return `${sign}${formatNumber(val, 1)}/s`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSec = Math.floor(seconds % 60);
  if (minutes < 60) return `${minutes}m ${remainingSec}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (hours < 24) return `${hours}h ${remainingMin}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}
