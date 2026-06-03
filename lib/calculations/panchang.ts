import * as Astronomy from 'astronomy-engine';
import { dateObjectToJDN } from './jdn';
import { sunLongitude, moonLongitude } from './astronomy';
import { tropicalToSidereal } from './ayanamsha';
import { calculateTithi } from './tithi';
import { calculateNakshatra, suryaNakshatra } from './nakshatra';
import { calculateYoga } from './yoga';
import { calculateKarana } from './karana';
import { calculateVara } from './vara';
import { calculateSamvat } from './samvat';
import { calculateMasaName, getMoonSign } from './masa';
import { calculateMuhurta } from './muhurta';
import type { PanchangData, Location } from '@/types/panchang';


function getRiseSetTimes(date: Date, location: Location) {
  const elevation = location.elevation ?? 0;
  const observer = new Astronomy.Observer(location.lat, location.lng, elevation);

  // Search sun from 18h before the given time — safely before local sunrise for any timezone
  const sunSearchStart = new Date(date.getTime() - 18 * 60 * 60 * 1000);

  const sunriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, sunSearchStart, 1);
  const sunsetResult = sunriseResult
    ? Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, sunriseResult.date, 1)
    : null;
  const solarNoonResult = Astronomy.SearchHourAngle(Astronomy.Body.Sun, observer, 0, sunSearchStart, +1);

  const sunrise = sunriseResult ? sunriseResult.date : new Date(date.getTime() - 6 * 3600000);
  const sunset = sunsetResult ? sunsetResult.date : new Date(date.getTime() + 6 * 3600000);
  const solarNoon = solarNoonResult ? solarNoonResult.time.date : new Date((sunrise.getTime() + sunset.getTime()) / 2);

  // Vedic convention: panchang day starts at sunrise.
  // Use SearchAltitude(0°) for the Moon — this matches DrikPanchang's Swiss Ephemeris results
  // within 1 minute. SearchRiseSet uses a fixed 34-arcmin refraction that doesn't account for
  // the Moon's large horizontal parallax (~57 arcmin), causing 3–5 min errors.
  const moonriseResult = Astronomy.SearchAltitude(Astronomy.Body.Moon, observer, +1, sunrise, 1, 0.0);
  const moonsetResult  = Astronomy.SearchAltitude(Astronomy.Body.Moon, observer, -1, sunrise, 1, 0.0);

  return {
    sunrise,
    sunset,
    solarNoon,
    moonrise: moonriseResult ? moonriseResult.date : null,
    moonset: moonsetResult  ? moonsetResult.date  : null,
  };
}

export function computePanchang(date: Date, location: Location): PanchangData {
  const jdn = dateObjectToJDN(date);

  const sunLng = sunLongitude(jdn);
  const moonLng = moonLongitude(jdn);
  const siderealSunLng = tropicalToSidereal(sunLng, jdn);
  const siderealMoonLng = tropicalToSidereal(moonLng, jdn);

  const tithi = calculateTithi(sunLng, moonLng);
  const nakshatra = calculateNakshatra(siderealMoonLng);
  const yoga = calculateYoga(siderealSunLng, siderealMoonLng);
  const karana = calculateKarana(sunLng, moonLng);
  const vara = calculateVara(date);
  const samvat = calculateSamvat(date);
  const masaName = calculateMasaName(siderealSunLng);
  const moonSign = getMoonSign(siderealMoonLng);
  const surya = suryaNakshatra(siderealSunLng);

  const { sunrise, sunset, solarNoon, moonrise, moonset } = getRiseSetTimes(date, location);

  // Compute Brahma Muhurta using previous day's sunset
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const prevRiseSet = getRiseSetTimes(yesterday, location);
  const prevSunset = prevRiseSet.sunset;

  const muhurta = calculateMuhurta(sunrise, sunset, solarNoon, date.getDay(), prevSunset);

  return {
    date,
    location,
    tithi,
    nakshatra,
    yoga,
    karana,
    vara,
    sunMoonTimes: { sunrise, sunset, solarNoon, moonrise, moonset },
    muhurta,
    samvat,
    masaName,
    paksha: tithi.paksha,
    moonSign: moonSign.name,
    moonSignIndex: moonSign.index,
    suryaNakshatra: surya.name,
    suryaNakshatraIndex: surya.index,
    suryaPada: surya.pada,
    nakshatraPada: nakshatra.pada,
    sunLongitude: sunLng,
    moonLongitude: moonLng,
    siderealSunLng,
    siderealMoonLng,
  };
}
