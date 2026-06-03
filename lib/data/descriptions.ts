export interface ElementInfo {
  description: string;
  isAuspicious: boolean;
  reason: string;
  idealFor: string;
}

// ─── ELEMENT TYPE DESCRIPTIONS ───────────────────────────────────────────────

export const ELEMENT_TYPES: Record<string, { label: string; description: string; brief: string }> = {
  tithi: {
    label: 'Tithi (Lunar Day)',
    description: 'Tithi is the lunar day — one of the five essential Panchang limbs.',
    brief: 'determines auspiciousness for ceremonies and activities',
  },
  nakshatra: {
    label: 'Nakshatra (Lunar Mansion)',
    description: 'Nakshatra is the lunar mansion occupied by the Moon.',
    brief: 'influences the quality and outcome of events',
  },
  yoga: {
    label: 'Yoga (Sun-Moon Combination)',
    description: 'Yoga is the Sun-Moon longitudinal combination, indicating day quality.',
    brief: 'affects the overall quality of the day',
  },
  karana: {
    label: 'Karana (Half-Day Period)',
    description: 'Karana is half a Tithi — each lunar day is split into two Karanas.',
    brief: 'shapes success of activities begun within it',
  },
  vara: {
    label: 'Vara (Weekday)',
    description: 'Vara is the weekday, each ruled by a planet imparting specific qualities.',
    brief: 'influences all activities of the day',
  },
  paksha: {
    label: 'Paksha (Lunar Fortnight)',
    description: 'Paksha is the lunar fortnight — Shukla (waxing) or Krishna (waning).',
    brief: 'waxing favors beginnings, waning favors completion',
  },
};

// ─── TITHIS (30) ─────────────────────────────────────────────────────────────

export const TITHIS: Record<string, ElementInfo> = {
  Pratipada: {
    description: 'Pratipada (1st Tithi) is the first lunar day, ruled by Agni.',
    isAuspicious: true,
    reason: 'Ruled by Agni, excellent for new beginnings.',
    idealFor: 'New beginnings, travel, auspicious ceremonies',
  },
  Dwitiya: {
    description: 'Dwitiya (2nd Tithi) is ruled by Brahma.',
    isAuspicious: true,
    reason: 'Favors constructive and growth-oriented activities.',
    idealFor: 'Construction, planting, starting new projects',
  },
  Tritiya: {
    description: 'Tritiya (3rd Tithi) is ruled by Gauri (Parvati).',
    isAuspicious: true,
    reason: 'Very auspicious for learning and beautification.',
    idealFor: 'Learning, beauty work, arts, decoration',
  },
  Chaturthi: {
    description: 'Chaturthi (4th Tithi) is ruled by Ganesha and Yama.',
    isAuspicious: false,
    reason: 'Generally avoided for new ventures.',
    idealFor: 'Ganesha worship only — avoid new ventures',
  },
  Panchami: {
    description: 'Panchami (5th Tithi) is ruled by the Nagas.',
    isAuspicious: true,
    reason: 'Auspicious for learning, medicine, and agriculture.',
    idealFor: 'Learning, medicine, agriculture, water activities',
  },
  Shashthi: {
    description: 'Shashthi (6th Tithi) is ruled by Kartikeya.',
    isAuspicious: true,
    reason: 'Favors valor, medical treatments, and purification.',
    idealFor: 'Valor, medical treatments, purification rituals',
  },
  Saptami: {
    description: 'Saptami (7th Tithi) is ruled by the Sun.',
    isAuspicious: true,
    reason: 'Excellent for travel, vehicles, and fire rituals.',
    idealFor: 'Travel, vehicles, fire rituals, Sun worship',
  },
  Ashtami: {
    description: 'Ashtami (8th Tithi) is ruled by Rudra (Shiva).',
    isAuspicious: false,
    reason: 'Inauspicious for ceremonies but good for courage.',
    idealFor: 'Shiva worship, courage tasks — avoid ceremonies',
  },
  Navami: {
    description: 'Navami (9th Tithi) is ruled by Durga.',
    isAuspicious: true,
    reason: 'Auspicious for Goddess worship and completing activities.',
    idealFor: 'Goddess worship, completing tasks, valor',
  },
  Dashami: {
    description: 'Dashami (10th Tithi) is ruled by Yama.',
    isAuspicious: true,
    reason: 'Auspicious for travel, education, and dharmic activities.',
    idealFor: 'Long journeys, education, dharmic activities',
  },
  Ekadashi: {
    description: 'Ekadashi (11th Tithi) is ruled by Vishnu.',
    isAuspicious: true,
    reason: 'One of the most spiritually auspicious Tithis.',
    idealFor: 'Fasting, Vishnu worship, spiritual practices',
  },
  Dwadashi: {
    description: 'Dwadashi (12th Tithi) follows Ekadashi, ruled by Vishnu.',
    isAuspicious: true,
    reason: 'Auspicious for charity, religious acts, and commerce.',
    idealFor: 'Charity, religious acts, business, commerce',
  },
  Trayodashi: {
    description: 'Trayodashi (13th Tithi) is ruled by Kama.',
    isAuspicious: true,
    reason: 'Auspicious for love, marriage, and artistic activities.',
    idealFor: 'Marriage, love, romantic activities, arts',
  },
  Chaturdashi: {
    description: 'Chaturdashi (14th Tithi) is ruled by Shiva and Kali.',
    isAuspicious: false,
    reason: 'Generally avoided for ceremonies; powerful for Shiva worship.',
    idealFor: 'Shiva worship — avoid auspicious ceremonies',
  },
  Purnima: {
    description: 'Purnima (Full Moon) is the most auspicious of all Tithis.',
    isAuspicious: true,
    reason: 'The Full Moon — excellent for all auspicious activities.',
    idealFor: 'All auspicious activities, ceremonies, worship',
  },
  Amavasya: {
    description: 'Amavasya (New Moon) is dedicated to ancestor worship.',
    isAuspicious: false,
    reason: 'Inauspicious for new beginnings but sacred for ancestors.',
    idealFor: 'Ancestor worship, charity, spiritual practices',
  },
};

// ─── NAKSHATRAS (27) ─────────────────────────────────────────────────────────

export const NAKSHATRAS: Record<string, ElementInfo> = {
  Ashwini: {
    description: 'Ashwini — 1st Nakshatra, ruled by Ketu, deity: Ashwini Kumaras.',
    isAuspicious: true, reason: 'Auspicious for healing and speed.',
    idealFor: 'Medical treatments, travel, new ventures',
  },
  Bharani: {
    description: 'Bharani — 2nd Nakshatra, ruled by Venus, deity: Yama.',
    isAuspicious: false, reason: 'Fierce nature — generally avoided.',
    idealFor: 'Avoid auspicious activities — fierce quality',
  },
  Krittika: {
    description: 'Krittika — 3rd Nakshatra, ruled by Sun, deity: Agni.',
    isAuspicious: false, reason: 'Sharp quality — not for gentle activities.',
    idealFor: 'Avoid gentle activities — sharp, cutting quality',
  },
  Rohini: {
    description: 'Rohini — 4th Nakshatra, ruled by Moon, deity: Brahma.',
    isAuspicious: true, reason: 'One of the most auspicious Nakshatras.',
    idealFor: 'All activities — most auspicious Nakshatra',
  },
  Mrigashira: {
    description: 'Mrigashira — 5th Nakshatra, ruled by Mars, deity: Soma.',
    isAuspicious: true, reason: 'Gentle and soft nature.',
    idealFor: 'Creative work, gentle activities, travel',
  },
  Ardra: {
    description: 'Ardra — 6th Nakshatra, ruled by Rahu, deity: Rudra.',
    isAuspicious: false, reason: 'Sharp and destructive — avoid beginnings.',
    idealFor: 'Avoid — storm-like, destructive quality',
  },
  Punarvasu: {
    description: 'Punarvasu — 7th Nakshatra, ruled by Jupiter, deity: Aditi.',
    isAuspicious: true, reason: 'Signifies return of good fortune.',
    idealFor: 'New ventures, return journeys, good fortune',
  },
  Pushya: {
    description: 'Pushya — 8th Nakshatra, ruled by Saturn, deity: Brihaspati.',
    isAuspicious: true, reason: 'Traditionally the most auspicious Nakshatra.',
    idealFor: 'All activities — the most auspicious Nakshatra',
  },
  Ashlesha: {
    description: 'Ashlesha — 9th Nakshatra, ruled by Mercury, deity: Nagas.',
    isAuspicious: false, reason: 'Sharp — generally avoided.',
    idealFor: 'Avoid — serpentine, clinging quality',
  },
  Magha: {
    description: 'Magha — 10th Nakshatra, ruled by Ketu, deity: Pitrus.',
    isAuspicious: false, reason: 'Fierce nature associated with ancestors.',
    idealFor: 'Ancestor ceremonies only — fierce quality',
  },
  'Purva Phalguni': {
    description: 'Purva Phalguni — 11th Nakshatra, ruled by Venus.',
    isAuspicious: false, reason: 'Fierce quality — associated with indulgence.',
    idealFor: 'Rest and recreation — avoid productive work',
  },
  'Uttara Phalguni': {
    description: 'Uttara Phalguni — 12th Nakshatra, ruled by Sun.',
    isAuspicious: true, reason: 'Auspicious for agreements and friendships.',
    idealFor: 'Contracts, partnerships, friendships, stability',
  },
  Hasta: {
    description: 'Hasta — 13th Nakshatra, ruled by Moon, deity: Savitar.',
    isAuspicious: true, reason: 'Favors skilled work and trade.',
    idealFor: 'Skilled work, trade, healing, craftsmanship',
  },
  Chitra: {
    description: 'Chitra — 14th Nakshatra, ruled by Mars, deity: Vishwakarma.',
    isAuspicious: true, reason: 'Auspicious for artistic activities.',
    idealFor: 'Arts, architecture, beauty, creative projects',
  },
  Swati: {
    description: 'Swati — 15th Nakshatra, ruled by Rahu, deity: Vayu.',
    isAuspicious: true, reason: 'Auspicious for business and independence.',
    idealFor: 'Business, trade, travel, independent work',
  },
  Vishakha: {
    description: 'Vishakha — 16th Nakshatra, ruled by Jupiter.',
    isAuspicious: true, reason: 'Auspicious for goal-oriented activities.',
    idealFor: 'Goal-setting, achieving objectives, determination',
  },
  Anuradha: {
    description: 'Anuradha — 17th Nakshatra, ruled by Saturn, deity: Mitra.',
    isAuspicious: true, reason: 'Auspicious for friendships and travel.',
    idealFor: 'Friendships, travel, group activities, devotion',
  },
  Jyeshtha: {
    description: 'Jyeshtha — 18th Nakshatra, ruled by Mercury, deity: Indra.',
    isAuspicious: false, reason: 'Sharp nature — avoided for beginnings.',
    idealFor: 'Avoid new beginnings — senior or authority activities',
  },
  Mula: {
    description: 'Mula — 19th Nakshatra, ruled by Ketu, deity: Nirriti.',
    isAuspicious: false, reason: 'Destructive quality — generally inauspicious.',
    idealFor: 'Avoid — destructive, uprooting quality',
  },
  'Purva Ashadha': {
    description: 'Purva Ashadha — 20th Nakshatra, ruled by Venus.',
    isAuspicious: false, reason: 'Fierce quality — not for gentle activities.',
    idealFor: 'Avoid gentle activities — fierce, invincible quality',
  },
  'Uttara Ashadha': {
    description: 'Uttara Ashadha — 21st Nakshatra, ruled by Sun.',
    isAuspicious: true, reason: 'Auspicious for lasting achievements.',
    idealFor: 'Long-term goals, lasting achievements, law',
  },
  Shravana: {
    description: 'Shravana — 22nd Nakshatra, ruled by Moon, deity: Vishnu.',
    isAuspicious: true, reason: 'Auspicious for learning and travel.',
    idealFor: 'Learning, listening, travel, Vishnu worship',
  },
  Dhanishtha: {
    description: 'Dhanishtha — 23rd Nakshatra, ruled by Mars.',
    isAuspicious: true, reason: 'Auspicious for wealth and music.',
    idealFor: 'Wealth, music, real estate, abundance',
  },
  Shatabhisha: {
    description: 'Shatabhisha — 24th Nakshatra, ruled by Rahu, deity: Varuna.',
    isAuspicious: false, reason: 'Reclusive — not for public activities.',
    idealFor: 'Healing, research — avoid public activities',
  },
  'Purva Bhadrapada': {
    description: 'Purva Bhadrapada — 25th Nakshatra, ruled by Jupiter.',
    isAuspicious: false, reason: 'Fierce quality — transformative but difficult.',
    idealFor: 'Avoid standard activities — transformation only',
  },
  'Uttara Bhadrapada': {
    description: 'Uttara Bhadrapada — 26th Nakshatra, ruled by Saturn.',
    isAuspicious: true, reason: 'Auspicious for spiritual practices and stability.',
    idealFor: 'Spiritual practices, wisdom, stability, depth',
  },
  Revati: {
    description: 'Revati — 27th Nakshatra, ruled by Mercury, deity: Pushan.',
    isAuspicious: true, reason: 'Auspicious for travel and completion.',
    idealFor: 'Completing activities, travel, nourishment',
  },
};

// ─── YOGAS (27) ──────────────────────────────────────────────────────────────

export const YOGAS: Record<string, ElementInfo> = {
  Vishkambha: { description: 'Vishkambha — 1st Yoga, creates obstacles.', isAuspicious: false, reason: 'Creates obstacles.', idealFor: 'Avoid new work — obstructive quality' },
  Preeti:     { description: 'Preeti — 2nd Yoga, brings love.', isAuspicious: true,  reason: 'Brings love and affection.', idealFor: 'Marriage, friendships, social activities' },
  Ayushman:   { description: 'Ayushman — 3rd Yoga, confers long life.', isAuspicious: true,  reason: 'Confers longevity and health.', idealFor: 'Health activities, new beginnings, all work' },
  Saubhagya:  { description: 'Saubhagya — 4th Yoga, brings good fortune.', isAuspicious: true,  reason: 'Brings prosperity and happiness.', idealFor: 'Wealth activities, all auspicious work' },
  Shobhana:   { description: 'Shobhana — 5th Yoga, brings splendor.', isAuspicious: true,  reason: 'Brings brightness and success.', idealFor: 'Arts, public appearance, creative work' },
  Atiganda:   { description: 'Atiganda — 6th Yoga, brings dangers.', isAuspicious: false, reason: 'Brings obstacles and dangers.', idealFor: 'Avoid — dangerous, obstacle-creating quality' },
  Sukarma:    { description: 'Sukarma — 7th Yoga, favors good deeds.', isAuspicious: true,  reason: 'Favors virtuous and spiritual activities.', idealFor: 'Charity, spiritual work, righteous deeds' },
  Dhriti:     { description: 'Dhriti — 8th Yoga, brings determination.', isAuspicious: true,  reason: 'Brings persistence and stability.', idealFor: 'Long-term projects, commitments, steady work' },
  Shula:      { description: 'Shula — 9th Yoga, brings pain.', isAuspicious: false, reason: 'Brings pain and conflicts.', idealFor: 'Avoid — painful, conflict-prone quality' },
  Ganda:      { description: 'Ganda — 10th Yoga, creates complications.', isAuspicious: false, reason: 'Creates legal issues and difficulties.', idealFor: 'Avoid important ventures — creates complications' },
  Vriddhi:    { description: 'Vriddhi — 11th Yoga, brings growth.', isAuspicious: true,  reason: 'Brings increase and expansion.', idealFor: 'Business, investments, growth activities' },
  Dhruva:     { description: 'Dhruva — 12th Yoga, brings stability.', isAuspicious: true,  reason: 'Brings permanence and endurance.', idealFor: 'Long-term investments, construction, planting' },
  Vyaghata:   { description: 'Vyaghata — 13th Yoga, brings sudden obstacles.', isAuspicious: false, reason: 'Brings sudden resistance.', idealFor: 'Avoid — sudden obstacles quality' },
  Harshana:   { description: 'Harshana — 14th Yoga, brings joy.', isAuspicious: true,  reason: 'Brings delight and happiness.', idealFor: 'Celebrations, entertainment, joyful events' },
  Vajra:      { description: 'Vajra — 15th Yoga, brings harsh challenges.', isAuspicious: false, reason: 'Brings sudden shocks like a thunderbolt.', idealFor: 'Avoid — harsh, thunderbolt-like quality' },
  Siddhi:     { description: 'Siddhi — 16th Yoga, brings achievement.', isAuspicious: true,  reason: 'Brings success in all endeavors.', idealFor: 'All important work — achievement and success' },
  Vyatipata:  { description: 'Vyatipata — 17th Yoga, highly inauspicious.', isAuspicious: false, reason: 'Brings disasters and calamities.', idealFor: 'Avoid all activities — calamitous quality' },
  Variyan:    { description: 'Variyan — 18th Yoga, brings comfort.', isAuspicious: true,  reason: 'Brings comfort and pleasant experiences.', idealFor: 'Recreation, leisure, enjoyable activities' },
  Parigha:    { description: 'Parigha — 19th Yoga, creates barriers.', isAuspicious: false, reason: 'Creates restrictions and confinements.', idealFor: 'Avoid — barrier-creating quality' },
  Shiva:      { description: 'Shiva — 20th Yoga, highly auspicious.', isAuspicious: true,  reason: 'Brings peace and divine blessings.', idealFor: 'Spiritual work, worship, auspicious ceremonies' },
  Siddha:     { description: 'Siddha — 21st Yoga, brings accomplishment.', isAuspicious: true,  reason: 'Brings accomplishment and success.', idealFor: 'Important tasks, ceremonies, new ventures' },
  Sadhya:     { description: 'Sadhya — 22nd Yoga, makes goals achievable.', isAuspicious: true,  reason: 'Makes objectives attainable.', idealFor: 'Goal-oriented work, setting targets' },
  Shubha:     { description: 'Shubha — 23rd Yoga, inherently auspicious.', isAuspicious: true,  reason: 'Brings positive outcomes for all activities.', idealFor: 'All auspicious ceremonies and activities' },
  Shukla:     { description: 'Shukla — 24th Yoga, brings purity.', isAuspicious: true,  reason: 'Brings clarity and purity.', idealFor: 'Purification, spiritual work, clear decisions' },
  Brahma:     { description: 'Brahma — 25th Yoga, brings creative energy.', isAuspicious: true,  reason: 'Brings creative and divine inspiration.', idealFor: 'Creative work, education, new beginnings' },
  Indra:      { description: 'Indra — 26th Yoga, brings power.', isAuspicious: true,  reason: 'Brings authority and royal favor.', idealFor: 'Leadership, governance, high-position activities' },
  Vaidhriti:  { description: 'Vaidhriti — 27th Yoga, inauspicious.', isAuspicious: false, reason: 'Brings lack of support.', idealFor: 'Avoid important activities — unsupported quality' },
};

// ─── KARANAS (11 types) ──────────────────────────────────────────────────────

export const KARANAS: Record<string, ElementInfo> = {
  Bava:        { description: 'Bava — moveable Karana, ruled by Indra.', isAuspicious: true,  reason: 'Auspicious for all types of work.', idealFor: 'All types of work and new ventures' },
  Balava:      { description: 'Balava — moveable Karana, ruled by Brahma.', isAuspicious: true,  reason: 'Auspicious for ceremonies and learning.', idealFor: 'Learning, auspicious ceremonies' },
  Kaulava:     { description: 'Kaulava — moveable Karana, ruled by Mitra.', isAuspicious: true,  reason: 'Auspicious for partnerships.', idealFor: 'Friendships, partnerships, social activities' },
  Taitila:     { description: 'Taitila — moveable Karana, ruled by Aryaman.', isAuspicious: true,  reason: 'Auspicious for agriculture.', idealFor: 'Agriculture, farming, land activities' },
  Garija:      { description: 'Garija — moveable Karana, ruled by Earth goddess.', isAuspicious: true,  reason: 'Auspicious for construction.', idealFor: 'Construction, real estate, groundwork' },
  Vanija:      { description: 'Vanija — moveable Karana, ruled by Vishnu.', isAuspicious: true,  reason: 'Highly auspicious for business.', idealFor: 'Trade, business, financial transactions' },
  Visti:       { description: 'Visti (Bhadra) — inauspicious moveable Karana.', isAuspicious: false, reason: 'Inauspicious — avoided for all new activities.', idealFor: 'Avoid all activities — inauspicious Karana' },
  Shakuni:     { description: 'Shakuni — fixed inauspicious Karana.', isAuspicious: false, reason: 'Associated with negative energies.', idealFor: 'Avoid — negative and deceptive quality' },
  Chatushpada: { description: 'Chatushpada — fixed Karana of mixed nature.', isAuspicious: false, reason: 'Mixed — generally avoided for ceremonies.', idealFor: 'Animal or farming activities only' },
  Naga:        { description: 'Naga — fixed inauspicious Karana.', isAuspicious: false, reason: 'Associated with hidden dangers.', idealFor: 'Avoid — serpentine, dangerous quality' },
  Kimstughna:  { description: 'Kimstughna — fixed auspicious Karana.', isAuspicious: true,  reason: 'The only fixed auspicious Karana.', idealFor: 'New beginnings — only auspicious fixed Karana' },
  Vishti:      { description: 'Vishti — inauspicious Karana (same as Visti/Bhadra).', isAuspicious: false, reason: 'Inauspicious — avoid all new activities.', idealFor: 'Avoid all activities — inauspicious Karana' },
};

// ─── VARAS (7 weekdays) ──────────────────────────────────────────────────────

export const VARAS: Record<string, ElementInfo> = {
  Sunday:    { description: 'Ravivara — ruled by the Sun.', isAuspicious: true,  reason: 'Ruled by Sun — good for authority and health.', idealFor: 'Government work, health, fire rituals, leadership' },
  Monday:    { description: 'Somavara — ruled by the Moon.', isAuspicious: true,  reason: 'Ruled by Moon — good for travel and peace.', idealFor: 'Trade, travel, agriculture, Shiva worship' },
  Tuesday:   { description: 'Mangalavara — ruled by Mars.', isAuspicious: false, reason: 'Ruled by Mars — avoided for ceremonies.', idealFor: 'Courage, surgery — avoid auspicious ceremonies' },
  Wednesday: { description: 'Budhavara — ruled by Mercury.', isAuspicious: true,  reason: 'Ruled by Mercury — excellent for education.', idealFor: 'Education, writing, trade, communication' },
  Thursday:  { description: 'Guruvara — ruled by Jupiter.', isAuspicious: true,  reason: 'The most auspicious weekday.', idealFor: 'All activities — most auspicious weekday' },
  Friday:    { description: 'Shukravara — ruled by Venus.', isAuspicious: true,  reason: 'Ruled by Venus — good for romance and arts.', idealFor: 'Marriage, romance, arts, social events' },
  Saturday:  { description: 'Shanivara — ruled by Saturn.', isAuspicious: false, reason: 'Ruled by Saturn — avoided for ceremonies.', idealFor: 'Real estate, iron, hard work — avoid ceremonies' },
  // Weekday names as they come from the calculation engine
  Ravivara:    { description: 'Sunday — ruled by the Sun.', isAuspicious: true,  reason: 'Good for authority and health.', idealFor: 'Government work, health, fire rituals, leadership' },
  Somavara:    { description: 'Monday — ruled by the Moon.', isAuspicious: true,  reason: 'Good for travel and peace.', idealFor: 'Trade, travel, agriculture, Shiva worship' },
  Mangalavara: { description: 'Tuesday — ruled by Mars.', isAuspicious: false, reason: 'Avoided for ceremonies.', idealFor: 'Courage, surgery — avoid auspicious ceremonies' },
  Budhavara:   { description: 'Wednesday — ruled by Mercury.', isAuspicious: true,  reason: 'Excellent for education and trade.', idealFor: 'Education, writing, trade, communication' },
  Guruvara:    { description: 'Thursday — ruled by Jupiter.', isAuspicious: true,  reason: 'The most auspicious weekday.', idealFor: 'All activities — most auspicious weekday' },
  Shukravara:  { description: 'Friday — ruled by Venus.', isAuspicious: true,  reason: 'Good for romance, arts, social events.', idealFor: 'Marriage, romance, arts, social events' },
  Shanivara:   { description: 'Saturday — ruled by Saturn.', isAuspicious: false, reason: 'Avoided for ceremonies.', idealFor: 'Real estate, hard work — avoid ceremonies' },
};

// ─── PAKSHAS (2) ─────────────────────────────────────────────────────────────

export const PAKSHAS: Record<string, ElementInfo> = {
  Shukla: { description: 'Shukla Paksha — waxing Moon, New Moon to Full Moon.', isAuspicious: true,  reason: 'Waxing Moon — favors new beginnings.', idealFor: 'New ventures, ceremonies, positive activities' },
  Krishna: { description: 'Krishna Paksha — waning Moon, Full Moon to New Moon.', isAuspicious: false, reason: 'Waning Moon — favors completion and introspection.', idealFor: 'Completing tasks, introspection, ancestor worship' },
};

// ─── MUHURTA DESCRIPTIONS ────────────────────────────────────────────────────

export const MUHURTA_INFO: Record<string, { name: string; description: string; howToUse: string; isAuspicious: boolean; idealFor: string }> = {
  brahmaMuhurta: {
    name: 'Brahma Muhurta',
    description: 'The sacred Creator\'s Hour — ~1.5 hrs before sunrise. The most spiritually potent time of day.',
    howToUse: 'Ideal for meditation, yoga, prayer, studying, and creative work.',
    isAuspicious: true,
    idealFor: 'Meditation, yoga, prayer, studying, creative work',
  },
  abhijitMuhurta: {
    name: 'Abhijit Muhurta',
    description: 'The Victorious Hour — around solar noon. Most auspicious daytime muhurta. Absent on Wednesdays.',
    howToUse: 'Excellent for starting any important new venture or signing contracts.',
    isAuspicious: true,
    idealFor: 'New ventures, contracts, all important activities',
  },
  godhuliMuhurta: {
    name: 'Godhuli Muhurta',
    description: 'The Cow Dust Hour — just around sunset. Sacred golden twilight time.',
    howToUse: 'Traditionally used for marriages, entering a new home, and evening worship.',
    isAuspicious: true,
    idealFor: 'Marriage, new home, evening worship, ceremonies',
  },
  amritKalam: {
    name: 'Amrit Kalam',
    description: 'The Nectar Period — nourishing lunar energy window.',
    howToUse: 'Best for health activities, taking medicines, and healing treatments.',
    isAuspicious: true,
    idealFor: 'Health, medicine, healing, nourishing activities',
  },
  pratahSandhya: {
    name: 'Pratah Sandhya',
    description: 'Morning Twilight — sacred junction from 48 min before sunrise to sunrise.',
    howToUse: 'Traditional time for Sandhyavandana prayer and morning meditation.',
    isAuspicious: true,
    idealFor: 'Morning prayer, Sandhyavandana, meditation',
  },
  vijayaMuhurta: {
    name: 'Vijaya Muhurta',
    description: 'The Victory Hour — afternoon muhurta that confers success over obstacles.',
    howToUse: 'Excellent for competitive activities, challenges, and overcoming opposition.',
    isAuspicious: true,
    idealFor: 'Competitive activities, challenges, legal matters',
  },
  sayahanaSandhya: {
    name: 'Sayahana Sandhya',
    description: 'Evening Twilight — sacred junction from sunset to ~48 min after.',
    howToUse: 'Evening Sandhyavandana prayer, lamp-lighting, and concluding the day.',
    isAuspicious: true,
    idealFor: 'Evening prayer, lamp-lighting, worship, reflection',
  },
  nishitaMuhurta: {
    name: 'Nishita Muhurta',
    description: 'The Midnight Hour — most powerful nighttime period, sacred to Shiva.',
    howToUse: 'Deep meditation, Shiva worship, and advanced spiritual practices.',
    isAuspicious: true,
    idealFor: 'Deep meditation, Shiva worship, spiritual practices',
  },
  madhyahnaSandhya: {
    name: 'Madhyahna Sandhya',
    description: 'The Midday Sandhya — sacred junction at solar noon, 24 min centred on the sun\'s peak.',
    howToUse: 'Traditional time for midday prayer, Sandhyavandana, and brief reflection.',
    isAuspicious: true,
    idealFor: 'Midday prayer, Sandhyavandana, reflection',
  },
  rahuKalam: {
    name: 'Rahu Kalam',
    description: 'The most inauspicious daily period, ruled by Rahu.',
    howToUse: 'Strongly avoid starting any new activity, journey, or important task.',
    isAuspicious: false,
    idealFor: 'Avoid new activities, travel, and important decisions',
  },
  gulikaKalam: {
    name: 'Gulika Kalam',
    description: 'Inauspicious period ruled by Saturn\'s son Gulika.',
    howToUse: 'Avoid starting new ventures, signing agreements, or financial decisions.',
    isAuspicious: false,
    idealFor: 'Avoid new ventures, agreements, financial decisions',
  },
  varjyam: {
    name: 'Varjyam',
    description: 'Moon Nakshatra-based inauspicious period — "to be avoided."',
    howToUse: 'Avoid starting auspicious activities during this period.',
    isAuspicious: false,
    idealFor: 'Avoid auspicious activities — Moon-based inauspicious time',
  },
  baana: {
    name: 'Baana',
    description: 'Tara-based inauspicious period with a sharp cutting quality.',
    howToUse: 'Avoid starting new activities or auspicious ceremonies.',
    isAuspicious: false,
    idealFor: 'Avoid new activities and ceremonies',
  },
  yamaGanda: {
    name: 'Yama Ganda',
    description: 'Inauspicious period ruled by Yama, god of death.',
    howToUse: 'Avoid starting journeys, important work, or auspicious activities.',
    isAuspicious: false,
    idealFor: 'Avoid journeys, new work, and auspicious activities',
  },
  vidalYoga: {
    name: 'Vidal Yoga',
    description: 'Unfavorable Vara-Tithi combination period with separating energy.',
    howToUse: 'Avoid starting any important activity during this period.',
    isAuspicious: false,
    idealFor: 'Avoid all important activities — separating quality',
  },
  durMuhurta: {
    name: 'Dur Muhurta',
    description: 'Two "bad time" periods per day — each ~48 min, weekday-dependent.',
    howToUse: 'Avoid starting new or important activities during these periods.',
    isAuspicious: false,
    idealFor: 'Avoid new and important activities',
  },
  bhadra: {
    name: 'Bhadra',
    description: 'Inauspicious period when Visti Karana is active — one of the most feared periods.',
    howToUse: 'Strongly avoid all auspicious activities, travel, and new ventures.',
    isAuspicious: false,
    idealFor: 'Avoid all auspicious activities, travel, and new ventures',
  },
};
