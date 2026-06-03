// Lunar month (Masa) names — Amanta system (month ends at new moon)
export const MASA_NAMES = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
  'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
  'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
];

// Approximate lunar month from Sun's sidereal longitude
// Sun moves ~30° per lunar month; Chaitra starts when Sun is in Pisces (~330°)
export function calculateMasaName(siderealSunLng: number): string {
  // Each lunar month roughly corresponds to the Sun's position
  // Chaitra: Sun in Pisces (330-360) or early Aries (0-30)
  // We use the Sun's sidereal sign to approximate the lunar month
  const sunSign = Math.floor(siderealSunLng / 30); // 0=Aries ... 11=Pisces

  // Map solar sign to masa: Chaitra starts when Sun is in Pisces/Aries
  // Sun in Aries (0) → Chaitra (0)
  // Sun in Taurus (1) → Vaishakha (1)
  // etc.
  const masaIndex = sunSign % 12;
  return MASA_NAMES[masaIndex];
}

export const RASHI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)',
  'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)',
  'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

export function getMoonSign(siderealMoonLng: number): { name: string; index: number } {
  const index = Math.floor(siderealMoonLng / 30);
  return { index, name: RASHI_NAMES[index] };
}
