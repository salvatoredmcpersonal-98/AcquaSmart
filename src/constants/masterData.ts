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
}

export interface PlantSpecies {
  name: string;
  light: [number, number]; // lm/L
  co2: boolean;
  ph: [number, number];
  substrate: string;
}

export const FISH_MASTER_DATA: FishSpecies[] = [
  { name: 'Neon', temp: [22, 26], ph: [5.0, 7.0], gh: [2, 10], behavior: 'Pacifico', zone: 'Centro', minVolume: 60, maxSize: 4, group: 'Nano', note: 'Sensibile a sbalzi' },
  { name: 'Cardinali', temp: [24, 29], ph: [4.0, 6.5], gh: [1, 6], behavior: 'Pacifico', zone: 'Centro', minVolume: 60, maxSize: 5, group: 'Nano', note: 'Più esigente dei Neon' },
  { name: 'Scalare', temp: [24, 30], ph: [6.0, 7.5], gh: [5, 15], behavior: 'Semi-Aggressivo', zone: 'Centro', minVolume: 150, maxSize: 15, group: 'Ciclide-Medio', note: 'Mangia piccoli caracidi (Neon)' },
  { name: 'Discus', temp: [28, 31], ph: [5.5, 6.8], gh: [2, 8], behavior: 'Tranquillo', zone: 'Centro', minVolume: 250, maxSize: 20, group: 'Ciclide-Premium', note: "Richiede cambi d'acqua frequenti" },
  { name: 'Ramirezi', temp: [26, 30], ph: [5.0, 6.5], gh: [2, 10], behavior: 'Territoriale', zone: 'Fondo', minVolume: 60, maxSize: 5, group: 'Nano-Ciclide', note: 'Sensibile ai nitrati' },
  { name: 'Corydoras', temp: [22, 26], ph: [6.0, 7.8], gh: [5, 18], behavior: 'Pacifico', zone: 'Fondo', minVolume: 60, maxSize: 6, group: 'Fondo', note: 'Necessita sabbia fine (non tagliente)' },
  { name: 'Ancistrus', temp: [21, 27], ph: [6.0, 8.0], gh: [5, 25], behavior: 'Pacifico', zone: 'Fondo', minVolume: 80, maxSize: 12, group: 'Fondo', note: 'Mangia alghe e legni (cellulosa)' },
  { name: 'Otocinclus', temp: [22, 27], ph: [6.0, 7.5], gh: [2, 12], behavior: 'Pacifico', zone: 'Fondo', minVolume: 40, maxSize: 4, group: 'Fondo', note: 'Ottimo mangia-alghe per caridine' },
  { name: 'Guppy', temp: [22, 28], ph: [7.0, 8.5], gh: [12, 30], behavior: 'Pacifico', zone: 'Alto/Centro', minVolume: 40, maxSize: 5, group: 'Poecilidi', note: 'Riproduzione incontrollata' },
  { name: 'Platy/Portaspada', temp: [20, 28], ph: [7.0, 8.2], gh: [10, 25], behavior: 'Pacifico', zone: 'Alto/Centro', minVolume: 60, maxSize: 6, group: 'Poecilidi', note: 'Molto robusti' },
  { name: 'Molly', temp: [24, 28], ph: [7.5, 8.5], gh: [15, 30], behavior: 'Pacifico', zone: 'Alto/Centro', minVolume: 60, maxSize: 8, group: 'Poecilidi', note: 'Tollera acqua salmastra' },
  { name: 'Betta Splendens', temp: [24, 30], ph: [6.0, 7.5], gh: [5, 15], behavior: 'Solitario', zone: 'Alto', minVolume: 30, maxSize: 7, group: 'Solitario', note: 'Incompatibile con maschi o pesci con code lunghe' },
  { name: 'Trichogaster', temp: [24, 28], ph: [6.0, 7.8], gh: [5, 18], behavior: 'Tranquillo', zone: 'Alto/Centro', minVolume: 100, maxSize: 12, group: 'Labirintidi', note: 'Timidi, serve acqua calma' },
  { name: 'Rasbora Heteromorpha', temp: [23, 27], ph: [6.0, 7.5], gh: [5, 12], behavior: 'Pacifico', zone: 'Centro', minVolume: 60, maxSize: 4, group: 'Nano', note: 'Pesce di branco pacifico' },
  { name: 'Danio Rerio', temp: [18, 24], ph: [6.5, 8.0], gh: [8, 20], behavior: 'Dinamici', zone: 'Alto/Centro', minVolume: 60, maxSize: 5, group: 'Dinamici', note: 'Nuoto molto veloce, stressa i timidi' },
  { name: 'Ciclidi Malawi', temp: [24, 27], ph: [7.8, 8.8], gh: [15, 25], behavior: 'Aggressivo', zone: 'Fondo', minVolume: 200, maxSize: 12, group: 'Aggressivo', note: 'Solo rocce, niente piante tenere' },
  { name: 'Ciclidi Tanganica', temp: [24, 27], ph: [8.5, 9.2], gh: [18, 30], behavior: 'Aggressivo', zone: 'Fondo', minVolume: 100, maxSize: 10, group: 'Aggressivo', note: 'Specie molto specifiche (es. conchigliofili)' },
  { name: 'Caridina (Red Cherry)', temp: [20, 25], ph: [6.5, 7.5], gh: [6, 12], behavior: 'Preda', zone: 'Fondo', minVolume: 20, maxSize: 2, group: 'Preda', note: 'Vulnerabile ai pesci medi' },
  { name: 'Caridina (Japonica)', temp: [22, 27], ph: [6.0, 8.0], gh: [5, 15], behavior: 'Pulitore', zone: 'Fondo', minVolume: 40, maxSize: 5, group: 'Pulitore', note: 'Ottima per alghe, più grande' },
];

export const PLANT_MASTER_DATA: PlantSpecies[] = [
  { name: 'Anubias', light: [15, 25], co2: false, ph: [6.0, 8.5], substrate: 'Inerte/Legni' },
  { name: 'Cryptocoryne', light: [20, 30], co2: false, ph: [6.5, 7.5], substrate: 'Fertile' },
  { name: 'Rotala Rossa', light: [45, 100], co2: true, ph: [5.5, 6.8], substrate: 'Fertile' },
  { name: 'Montecarlo', light: [50, 100], co2: true, ph: [6.0, 7.0], substrate: 'Fertile' },
  { name: 'Java Moss', light: [10, 40], co2: false, ph: [5.0, 8.0], substrate: 'Qualsiasi' },
  { name: 'Vallisneria', light: [20, 40], co2: false, ph: [7.0, 8.5], substrate: 'Sabbia' },
];
