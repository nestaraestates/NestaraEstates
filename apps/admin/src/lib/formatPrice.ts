export function formatIndianCurrencyShort(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  if (num >= 10000000) {
    return '₹' + (num / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Cr';
  } else if (num >= 100000) {
    return '₹' + (num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' L';
  } else if (num >= 1000) {
    return '₹' + (num / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' K';
  } else {
    return '₹' + num.toLocaleString('en-IN');
  }
}
