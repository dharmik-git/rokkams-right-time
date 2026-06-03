// Lahiri (Chitrapaksha) ayanamsha — the standard used for Hindu Panchang
// Accurate to ~0.01° for 1900-2100, reasonable for wider range
export function lahiriAyanamsha(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525; // Julian centuries from J2000.0
  // Lahiri ayanamsha at J2000.0 ≈ 23.8521°, rate ≈ 1.3969°/century
  return 23.8521 + 1.3969 * T;
}

export function tropicalToSidereal(tropicalLng: number, jdn: number): number {
  const ayanamsha = lahiriAyanamsha(jdn);
  return ((tropicalLng - ayanamsha) % 360 + 360) % 360;
}
