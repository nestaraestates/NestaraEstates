export function formatIndianCurrency(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '';
  
  if (num >= 10000000) {
    return '₹' + parseFloat((num / 10000000).toFixed(2)).toString() + ' Cr';
  } else if (num >= 100000) {
    return '₹' + parseFloat((num / 100000).toFixed(2)).toString() + ' L';
  } else if (num >= 1000) {
    return '₹' + parseFloat((num / 1000).toFixed(2)).toString() + ' k';
  } else {
    return '₹' + num.toString();
  }
}

export function parseIndianCurrencyString(val: string): string {
  if (!val) return '';
  const lower = val.toLowerCase().replace(/,/g, '').trim();
  let num = parseFloat(lower);
  if (isNaN(num)) return '';

  if (lower.includes('cr')) {
    num = num * 10000000;
  } else if (lower.includes('l')) {
    num = num * 100000;
  } else if (lower.includes('k')) {
    num = num * 1000;
  }

  return Math.round(num).toString();
}
