export interface MuhurtaInfo {
  name: string;
  sanskritName: string;
  type: 'auspicious' | 'inauspicious';
  significance: string;
  recommended: string[];
  avoid?: string[];
  origin: string;
  color: string;
}

export const MUHURTA_INFO: Record<string, MuhurtaInfo> = {
  abhijitMuhurta: {
    name: 'Abhijit Muhurta',
    sanskritName: 'अभिजित् मुहूर्त',
    type: 'auspicious',
    significance:
      'Abhijit is considered the most auspicious muhurta of the day, associated with Lord Vishnu and representing the zenith of solar power. It falls at the midpoint of the day when the Sun is at its highest point.',
    recommended: [
      'Starting new ventures and businesses',
      'Signing important agreements',
      'Housewarming ceremonies',
      'Auspicious travel',
      'Performing Puja and rituals',
    ],
    origin: 'Mentioned in the Mahabharata; Abhijit was one of the 28 nakshatras in ancient Vedic tradition.',
    color: '#1A5C38',
  },
  brahmaMuhurta: {
    name: 'Brahma Muhurta',
    sanskritName: 'ब्रह्म मुहूर्त',
    type: 'auspicious',
    significance:
      "Brahma Muhurta (Creator's Time) occurs 96 minutes before sunrise. The atmosphere is charged with positive energy, fresh oxygen, and divine vibrations. This is the optimal time for spiritual practices and mental clarity.",
    recommended: [
      'Meditation and pranayama',
      'Study and learning',
      'Yoga practice',
      'Reciting mantras and prayers',
      'Planning important decisions',
    ],
    origin:
      'Referenced in Ayurvedic texts like Charaka Samhita and spiritual texts including the Bhagavata Purana as the most sattvic time of day.',
    color: '#7B5EA7',
  },
  vijayaMuhurta: {
    name: 'Vijaya Muhurta',
    sanskritName: 'विजय मुहूर्त',
    type: 'auspicious',
    significance:
      'Vijaya (Victory) Muhurta is an afternoon period known to bestow success in competitive endeavors and courageous actions. Warriors historically began battles during this time.',
    recommended: [
      'Competitive activities and sports',
      'Legal proceedings and court matters',
      'Job interviews',
      'Starting competitive examinations',
      'Launching products or campaigns',
    ],
    origin: 'Described in Muhurta Chintamani and Jyotisha Shastra texts as the muhurta that brings victory to righteous causes.',
    color: '#1A5C38',
  },
  godhuliMuhurta: {
    name: 'Godhuli Muhurta',
    sanskritName: 'गोधूलि मुहूर्त',
    type: 'auspicious',
    significance:
      "Godhuli (Cow Dust) Muhurta occurs at dusk when cows return from grazing, raising sacred dust with their hooves. This transitional twilight period is considered naturally sanctified and free from malefic planetary influences.",
    recommended: [
      'Wedding ceremonies and engagements',
      'Griha Pravesh (entering a new home)',
      'Evening prayers and Sandhyavandana',
      'Beginning auspicious family events',
    ],
    origin: "Named in classical texts like Dharmasindhu. The cow's association with Kamadhenu (wish-fulfilling divine cow) makes this time inherently auspicious.",
    color: '#D4590A',
  },
  amritKalam: {
    name: 'Amrit Kalam',
    sanskritName: 'अमृत काल',
    type: 'auspicious',
    significance:
      'Amrit (Nectar) Kalam is a period of divine nourishment. The word amrit means immortal nectar — activities performed now are said to be blessed with lasting positive effects.',
    recommended: [
      'Medical treatments and surgeries',
      'Taking important medicines',
      'Spiritual healing practices',
      'Beginning fasts',
      'Performing charity',
    ],
    origin: 'Found in Hora Shastra and Jyotisha texts; corresponds to the Choghadiya system of dividing the day into auspicious and inauspicious segments.',
    color: '#1A5C38',
  },
  pratahSandhya: {
    name: 'Pratah Sandhya',
    sanskritName: 'प्रातः संध्या',
    type: 'auspicious',
    significance:
      'Pratah Sandhya is the sacred morning twilight — the junction (Sandhya) between night and day. The three Sandhya periods are considered divine gateways where cosmic energies are most accessible.',
    recommended: [
      'Surya Namaskar (Sun Salutation)',
      'Morning prayers and Gayatri mantra',
      'Offering water to the Sun (Arghya)',
      'Beginning daily spiritual practice',
    ],
    origin:
      'Central to Vedic daily routine described in Grihyasutras and Dharmashastra. The Gayatri mantra is traditionally recited during Sandhya.',
    color: '#F4A742',
  },
  rahuKalam: {
    name: 'Rahu Kalam',
    sanskritName: 'राहु काल',
    type: 'inauspicious',
    significance:
      'Rahu Kalam is the daily period governed by Rahu, the shadow planet associated with obstacles, delays, and karmic complications. New beginnings during this period may face unexpected hurdles.',
    avoid: [
      'Starting new businesses or ventures',
      'Important travel or journeys',
      'Medical operations (non-emergency)',
      'Marriage ceremonies',
      'Financial transactions',
    ],
    recommended: [
      'Worship of Rahu (can neutralize effects)',
      'Completing ongoing work',
      'Rest and reflection',
    ],
    origin: "Rahu is one of the Navagrahas (nine celestial bodies) in Vedic astrology. Rahu Kalam's calculation from the 8-fold division of the day dates back to medieval Jyotisha texts.",
    color: '#C0392B',
  },
  gulikaKalam: {
    name: 'Gulika Kalam',
    sanskritName: 'गुलिक काल',
    type: 'inauspicious',
    significance:
      "Gulika Kalam is governed by Gulika (Mandi), a shadow point considered the son of Saturn (Shani). This period carries Saturn's heavy, obstructive energy and is particularly adverse for new beginnings.",
    avoid: [
      'Starting new projects',
      'Travel, especially to the south',
      'Legal agreements and contracts',
      'Purchasing property',
    ],
    recommended: ['Performing Saturn-related worship', 'Completing pending tasks', 'Rest'],
    origin:
      'Gulika is mentioned in classical texts like Brhat Parasara Hora Shastra as an upagraha (sub-planet) with malefic influence during its period each day.',
    color: '#8B6914',
  },
  yamaGanda: {
    name: 'Yama Ganda',
    sanskritName: 'यम गण्ड',
    type: 'inauspicious',
    significance:
      "Yama Ganda is the daily period associated with Yama, the god of death. It is considered the most inauspicious of the three daily inauspicious periods (along with Rahu Kalam and Gulika Kalam). The name 'Ganda' means knot or obstacle.",
    avoid: [
      'All auspicious ceremonies and events',
      'Starting new work or travel',
      'Important meetings',
      'Religious ceremonies',
    ],
    recommended: ["Prayers to Lord Yama for protection", 'Rest and avoidance of risk'],
    origin:
      'Named after Yama (Dharmaraja), the lord of death and dharma. Referenced in Muhurta Shastra as one of the three major inauspicious daily periods.',
    color: '#7B1818',
  },
  durMuhurta: {
    name: 'Dur Muhurta',
    sanskritName: 'दुर् मुहूर्त',
    type: 'inauspicious',
    significance:
      'Dur (bad/difficult) Muhurta consists of two daily periods of approximately 15 minutes each when the energy is particularly adverse. These are specific to the day of the week and vary daily.',
    avoid: ['Any new auspicious activity', 'Important decisions', 'Starting journeys'],
    recommended: ['Reciting protective mantras', 'Completing routine tasks'],
    origin: 'Described in Muhurta Chintamani — each day has specific Dur Muhurta periods linked to the planetary lord of that day.',
    color: '#C0392B',
  },
  varjyam: {
    name: 'Varjyam',
    sanskritName: 'वर्ज्यम्',
    type: 'inauspicious',
    significance:
      "Varjyam means 'to be avoided.' It is a Moon-based inauspicious period calculated from the nakshatra the Moon occupies. During this time, the Moon's energy is said to be disturbed, making activities initiated during this period prone to failure.",
    avoid: ['Starting new work', 'Travel', 'Auspicious ceremonies'],
    recommended: ['Prayer and devotional activities', 'Rest'],
    origin:
      "Found in Hora texts and Jyotisha Shastra. Varjyam calculation is based on the Moon's daily nakshatra transit and its interaction with certain adverse portions.",
    color: '#8B4513',
  },
};
