import type { SamvatResult, TithiResult } from '@/types/panchang';

// Determine if we've passed Chaitra Shukla Pratipada (Hindu New Year)
// Simple approximation: Chaitra starts ~mid-March
function isAfterChaitraShuklaEka(month: number, day: number): boolean {
  // Chaitra Shukla Pratipada usually falls in March-April
  // Approximation: after March 15
  return month > 3 || (month === 3 && day >= 15);
}

function isAfterKartikShuklaEka(month: number, day: number): boolean {
  // Kartik Shukla Pratipada (day after Diwali) usually in Oct-Nov
  // Approximation: after October 15
  return month > 10 || (month === 10 && day >= 15);
}

export function calculateSamvat(date: Date): SamvatResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const afterChaitra = isAfterChaitraShuklaEka(month, day);

  // Vikrama Samvat: +57 after Chaitra, +56 before
  const vikrama = afterChaitra ? year + 57 : year + 56;

  // Shaka Samvat: -78 after Chaitra (Vernal Equinox), -77 before
  const shaka = afterChaitra ? year - 78 : year - 77;

  // Gujarati Samvat: same as Vikrama but new year starts at Kartik Shukla 1
  // So before that date in the Gregorian year, it's still the previous Gujarati year
  const afterKartik = isAfterKartikShuklaEka(month, day);
  const gujarati = afterKartik ? year + 57 : year + 56;

  return { vikrama, shaka, gujarati };
}
