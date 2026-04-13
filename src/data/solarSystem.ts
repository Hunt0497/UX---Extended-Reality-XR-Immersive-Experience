export interface CelestialBody {
  id: string;
  name: string;
  type: string;
  shortDescription: string;
  color: string;
  size: number;
  distance: number; // Distance from sun in arbitrary units for layout
  facts: string[];
  coolFact: string;
  earthComparison: string;
  textureUrl?: string;
  ring?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
    textureUrl?: string;
  };
}

export const solarSystemData: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'Star',
    shortDescription: 'The heart of our solar system, a yellow dwarf star.',
    color: '#FDB813',
    size: 20,
    distance: 0,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/sunmap.jpg',
    facts: [
      'Age: 4.6 Billion Years',
      'Surface Temp: 5,500°C',
      'Core Temp: 15 Million °C',
      'Mass: 330,000 x Earth',
    ],
    coolFact: 'The Sun accounts for 99.86% of the mass in the solar system.',
    earthComparison: 'You could fit 1.3 million Earths inside the Sun.',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Planet',
    shortDescription: 'The smallest and fastest planet, zipping around the Sun.',
    color: '#8c8c94',
    size: 2,
    distance: 40,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg',
    facts: [
      'Day: 59 Earth days',
      'Year: 88 Earth days',
      'Moons: 0',
      'Type: Terrestrial',
    ],
    coolFact: 'Despite being closest to the Sun, it is not the hottest planet.',
    earthComparison: 'Mercury is only slightly larger than Earth’s Moon.',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Planet',
    shortDescription: 'A thick, toxic atmosphere makes this the hottest planet.',
    color: '#e3bb76',
    size: 3.5,
    distance: 60,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/venusmap.jpg',
    facts: [
      'Day: 243 Earth days',
      'Year: 225 Earth days',
      'Moons: 0',
      'Surface Temp: 465°C',
    ],
    coolFact: 'Venus spins backwards compared to most other planets.',
    earthComparison: 'Often called Earth’s twin because of similar size and structure.',
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Planet',
    shortDescription: 'Our home planet, a world of liquid water and life.',
    color: '#2b82c9',
    size: 4,
    distance: 85,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg',
    facts: [
      'Day: 24 hours',
      'Year: 365.25 days',
      'Moons: 1',
      'Surface Water: 71%',
    ],
    coolFact: 'Earth is the only known planet to support life.',
    earthComparison: 'This is home!',
  },
  {
    id: 'moon',
    name: 'The Moon',
    type: 'Moon',
    shortDescription: 'Earth’s only natural satellite, a cratered and silent world.',
    color: '#d1d5db',
    size: 1.5,
    distance: 95,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/moonmap1k.jpg',
    facts: [
      'Day: 27.3 Earth days',
      'Year: 27.3 Earth days',
      'Gravity: 16.6% of Earth',
      'Type: Satellite',
    ],
    coolFact: 'The Moon always shows the same face to Earth due to tidal locking.',
    earthComparison: 'The Moon is about 1/4 the size of Earth.',
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Planet',
    shortDescription: 'A dusty, cold, desert world with a very thin atmosphere.',
    color: '#c1440e',
    size: 2.5,
    distance: 115,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg',
    facts: [
      'Day: 24.6 hours',
      'Year: 687 Earth days',
      'Moons: 2',
      'Gravity: 38% of Earth',
    ],
    coolFact: 'Mars is home to Olympus Mons, the tallest volcano in the solar system.',
    earthComparison: 'Mars is about half the size of Earth.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Planet',
    shortDescription: 'A gas giant and the largest planet in our solar system.',
    color: '#d39c7e',
    size: 12,
    distance: 160,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/jupitermap.jpg',
    facts: [
      'Day: 10 hours',
      'Year: 11.8 Earth years',
      'Moons: 95 recognized',
      'Type: Gas Giant',
    ],
    coolFact: 'Jupiter’s Great Red Spot is a storm that has been raging for centuries.',
    earthComparison: 'More than 1,300 Earths could fit inside Jupiter.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Planet',
    shortDescription: 'Adorned with a dazzling, complex system of icy rings.',
    color: '#ead6b8',
    size: 10,
    distance: 210,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnmap.jpg',
    ring: {
      innerRadius: 12,
      outerRadius: 20,
      color: '#cba884',
      textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnringcolor.jpg',
    },
    facts: [
      'Day: 10.7 hours',
      'Year: 29 Earth years',
      'Moons: 146 recognized',
      'Type: Gas Giant',
    ],
    coolFact: 'Saturn is the only planet in our solar system whose average density is less than water.',
    earthComparison: 'About 764 Earths could fit inside Saturn.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Planet',
    shortDescription: 'An ice giant that rotates on its side.',
    color: '#4b70dd',
    size: 6,
    distance: 260,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusmap.jpg',
    facts: [
      'Day: 17 hours',
      'Year: 84 Earth years',
      'Moons: 28 known',
      'Type: Ice Giant',
    ],
    coolFact: 'Uranus is the coldest planet in the solar system, with temps dropping to -224°C.',
    earthComparison: 'Uranus is about 4 times wider than Earth.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Planet',
    shortDescription: 'Dark, cold, and whipped by supersonic winds.',
    color: '#274687',
    size: 5.5,
    distance: 300,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/neptunemap.jpg',
    facts: [
      'Day: 16 hours',
      'Year: 165 Earth years',
      'Moons: 16 known',
      'Type: Ice Giant',
    ],
    coolFact: 'Neptune was the first planet located through mathematical calculations.',
    earthComparison: 'Neptune is slightly smaller than Uranus, but denser.',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'Dwarf Planet',
    shortDescription: 'A complex world of ice mountains and frozen plains.',
    color: '#ddc4b4',
    size: 1.5,
    distance: 330,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/plutomap1k.jpg',
    facts: [
      'Day: 153 hours',
      'Year: 248 Earth years',
      'Moons: 5',
      'Type: Dwarf Planet',
    ],
    coolFact: 'Pluto has a heart-shaped glacier that is the size of Texas and Oklahoma.',
    earthComparison: 'Pluto is about 1/6th the size of Earth.',
  },
  {
    id: 'milkyway',
    name: 'Milky Way',
    type: 'Galaxy',
    shortDescription: 'Our home galaxy, a vast spiral of stars, gas, and dust.',
    color: '#ffffff',
    size: 40,
    distance: 450,
    textureUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/galaxy_starfield.png',
    facts: [
      'Age: 13.6 Billion Years',
      'Stars: 100-400 Billion',
      'Diameter: 100,000 Light Years',
      'Type: Barred Spiral',
    ],
    coolFact: 'At the center of the Milky Way lies a supermassive black hole called Sagittarius A*.',
    earthComparison: 'Earth is just a tiny speck located in one of the spiral arms.',
  }
];
