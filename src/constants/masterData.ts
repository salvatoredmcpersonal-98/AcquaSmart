export interface FishSpecies {
  name: string;
  temp: [number, number];
  ph: [number, number];
  gh: [number, number];
  behavior: 'Pacifico' | 'Semi-Aggressivo' | 'Tranquillo' | 'Aggressivo' | 'Territoriale' | 'Solitario' | 'Dinamici' | 'Preda' | 'Pulitore';
  zone: 'Alto' | 'Centro' | 'Fondo' | 'Alto/Centro';
  minVolume: number;
  maxSize: number; // cm
  group?: string;
  note?: string;
  breeding?: {
    type: 'Uova' | 'Parto';
    days: number;
    description: string;
  };
}

export interface PlantSpecies {
  name: string;
  light: [number, number]; // lm/L
  co2: boolean;
  ph: [number, number];
  substrate: string;
}

export const FISH_MASTER_DATA: FishSpecies[] = [
  { 
    name: 'Neon', temp: [22, 26], ph: [5.0, 7.0], gh: [2, 10], behavior: 'Pacifico', zone: 'Centro', minVolume: 60, maxSize: 4, group: 'Nano', note: 'Sensibile a sbalzi',
    breeding: { type: 'Uova', days: 1, description: 'Depone uova libere tra le piante. Schiusa in 24h.' }
  },
  { 
    name: 'Cardinali', temp: [24, 29], ph: [4.0, 6.5], gh: [1, 6], behavior: 'Pacifico', zone: 'Centro', minVolume: 60, maxSize: 5, group: 'Nano', note: 'Più esigente dei Neon',
    breeding: { type: 'Uova', days: 1, description: 'Depone uova tra la vegetazione fitta. Schiusa in 24-30h.' }
  },
  { 
    name: 'Scalare', temp: [24, 30], ph: [6.0, 7.5], gh: [5, 15], behavior: 'Semi-Aggressivo', zone: 'Centro', minVolume: 150, maxSize: 15, group: 'Ciclide-Medio', note: 'Mangia piccoli caracidi (Neon)',
    breeding: { type: 'Uova', days: 3, description: 'Depone su superfici verticali. Schiusa in 2-3 giorni.' }
  },
  { 
    name: 'Discus', temp: [28, 31], ph: [5.5, 6.8], gh: [2, 8], behavior: 'Tranquillo', zone: 'Centro', minVolume: 250, maxSize: 20, group: 'Ciclide-Premium', note: "Richiede cambi d'acqua frequenti",
    breeding: { type: 'Uova', days: 3, description: 'Cure parentali intense. Schiusa in 60-72 ore.' }
  },
  { 
    name: 'Ramirezi', temp: [26, 30], ph: [5.0, 6.5], gh: [2, 10], behavior: 'Territoriale', zone: 'Fondo', minVolume: 60, maxSize: 5, group: 'Nano-Ciclide', note: 'Sensibile ai nitrati',
    breeding: { type: 'Uova', days: 2, description: 'Depone su pietre piatte. Schiusa in 48 ore.' }
  },
  { 
    name: 'Corydoras', temp: [22, 26], ph: [6.0, 7.8], gh: [5, 18], behavior: 'Pacifico', zone: 'Fondo', minVolume: 60, maxSize: 6, group: 'Fondo', note: 'Necessita sabbia fine (non tagliente)',
    breeding: { type: 'Uova', days: 4, description: 'Attacca le uova sui vetri o piante. Schiusa in 3-5 giorni.' }
  },
  { 
    name: 'Ancistrus', temp: [21, 27], ph: [6.0, 8.0], gh: [5, 25], behavior: 'Pacifico', zone: 'Fondo', minVolume: 80, maxSize: 12, group: 'Fondo', note: 'Mangia alghe e legni (cellulosa)',
    breeding: { type: 'Uova', days: 5, description: 'Depone in grotte, il maschio cura le uova. Schiusa in 4-5 giorni.' }
  },
  { 
    name: 'Otocinclus', temp: [22, 27], ph: [6.0, 7.5], gh: [2, 12], behavior: 'Pacifico', zone: 'Fondo', minVolume: 40, maxSize: 4, group: 'Fondo', note: 'Ottimo mangia-alghe per caridine',
    breeding: { type: 'Uova', days: 3, description: 'Difficile in acquario. Schiusa in circa 3 giorni.' }
  },
  { 
    name: 'Guppy', temp: [22, 28], ph: [7.0, 8.5], gh: [12, 30], behavior: 'Pacifico', zone: 'Alto/Centro', minVolume: 40, maxSize: 5, group: 'Poecilidi', note: 'Riproduzione incontrollata',
    breeding: { type: 'Parto', days: 28, description: 'Parto diretto di avannotti già formati. Gestazione di 25-30 giorni.' }
  },
  { 
    name: 'Platy/Portaspada', temp: [20, 28], ph: [7.0, 8.2], gh: [10, 25], behavior: 'Pacifico', zone: 'Alto/Centro', minVolume: 60, maxSize: 6, group: 'Poecilidi', note: 'Molto robusti',
    breeding: { type: 'Parto', days: 30, description: 'Parto di avannotti vivi. Gestazione di 28-32 giorni.' }
  },
  { 
    name: 'Molly', temp: [24, 28], ph: [7.5, 8.5], gh: [15, 30], behavior: 'Pacifico', zone: 'Alto/Centro', minVolume: 60, maxSize: 8, group: 'Poecilidi', note: 'Tollera acqua salmastra',
    breeding: { type: 'Parto', days: 35, description: 'Parto di avannotti vivi. Gestazione di 30-40 giorni.' }
  },
  { 
    name: 'Betta Splendens', temp: [24, 30], ph: [6.0, 7.5], gh: [5, 15], behavior: 'Solitario', zone: 'Alto', minVolume: 30, maxSize: 7, group: 'Solitario', note: 'Incompatibile con maschi o pesci con code lunghe',
    breeding: { type: 'Uova', days: 2, description: 'Nido di bolle in superficie. Schiusa in 24-48 ore.' }
  },
  { 
    name: 'Trichogaster', temp: [24, 28], ph: [6.0, 7.8], gh: [5, 18], behavior: 'Tranquillo', zone: 'Alto/Centro', minVolume: 100, maxSize: 12, group: 'Labirintidi', note: 'Timidi, serve acqua calma',
    breeding: { type: 'Uova', days: 1, description: 'Nido di bolle. Schiusa in 24 ore.' }
  },
  { 
    name: 'Rasbora Heteromorpha', temp: [23, 27], ph: [6.0, 7.5], gh: [5, 12], behavior: 'Pacifico', zone: 'Centro', minVolume: 60, maxSize: 4, group: 'Nano', note: 'Pesce di branco pacifico',
    breeding: { type: 'Uova', days: 1, description: 'Depone sotto le foglie larghe. Schiusa in 24-30h.' }
  },
  { 
    name: 'Danio Rerio', temp: [18, 24], ph: [6.5, 8.0], gh: [8, 20], behavior: 'Dinamici', zone: 'Alto/Centro', minVolume: 60, maxSize: 5, group: 'Dinamici', note: 'Nuoto molto veloce, stressa i timidi',
    breeding: { type: 'Uova', days: 2, description: 'Disperde uova sul fondo. Schiusa in 48 ore.' }
  },
  { 
    name: 'Ciclidi Malawi', temp: [24, 27], ph: [7.8, 8.8], gh: [15, 25], behavior: 'Aggressivo', zone: 'Fondo', minVolume: 200, maxSize: 12, group: 'Aggressivo', note: 'Solo rocce, niente piante tenere',
    breeding: { type: 'Uova', days: 21, description: 'Incubatore orale. Le uova schiudono in bocca dopo 21 giorni.' }
  },
  { 
    name: 'Ciclidi Tanganica', temp: [24, 27], ph: [8.5, 9.2], gh: [18, 30], behavior: 'Aggressivo', zone: 'Fondo', minVolume: 100, maxSize: 10, group: 'Aggressivo', note: 'Specie molto specifiche (es. conchigliofili)',
    breeding: { type: 'Uova', days: 15, description: 'Spesso depongono in conchiglie. Schiusa in 10-15 giorni.' }
  },
  { 
    name: 'Caridina (Red Cherry)', temp: [20, 25], ph: [6.5, 7.5], gh: [6, 12], behavior: 'Preda', zone: 'Fondo', minVolume: 20, maxSize: 2, group: 'Preda', note: 'Vulnerabile ai pesci medi',
    breeding: { type: 'Uova', days: 25, description: 'Uova portate sotto l\'addome. Schiusa in 20-30 giorni.' }
  },
  { 
    name: 'Caridina (Japonica)', temp: [22, 27], ph: [6.0, 8.0], gh: [5, 15], behavior: 'Pulitore', zone: 'Fondo', minVolume: 40, maxSize: 5, group: 'Pulitore', note: 'Ottima per alghe, più grande',
    breeding: { type: 'Uova', days: 30, description: 'Richiede acqua salmastra per lo sviluppo delle larve.' }
  },
];

export const PLANT_MASTER_DATA: PlantSpecies[] = [
  { name: 'Anubias', light: [15, 25], co2: false, ph: [6.0, 8.5], substrate: 'Inerte/Legni' },
  { name: 'Cryptocoryne', light: [20, 30], co2: false, ph: [6.5, 7.5], substrate: 'Fertile' },
  { name: 'Rotala Rossa', light: [45, 100], co2: true, ph: [5.5, 6.8], substrate: 'Fertile' },
  { name: 'Montecarlo', light: [50, 100], co2: true, ph: [6.0, 7.0], substrate: 'Fertile' },
  { name: 'Java Moss', light: [10, 40], co2: false, ph: [5.0, 8.0], substrate: 'Qualsiasi' },
  { name: 'Vallisneria', light: [20, 40], co2: false, ph: [7.0, 8.5], substrate: 'Sabbia' },
];
