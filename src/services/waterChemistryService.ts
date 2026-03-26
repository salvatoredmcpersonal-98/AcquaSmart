
/**
 * Water Chemistry Service
 * Handles GH correction and evaporation calculations
 */

export interface GHCorrectionResult {
  type: 'lower' | 'raise' | 'stable';
  value: number; // Liters to replace or Grams to add
  target: number;
}

export interface EvaporationResult {
  liters: number;
  percentLost: number;
}

/**
 * Calculate GH correction
 * @param vNet Net volume in Liters
 * @param ghAtt Current GH in °dGH
 * @param ghTar Target GH in °dGH
 * @param kSale Salt constant (default 1)
 */
export const calculateCorrection = (vNet: number, ghAtt: number, ghTar: number, kSale: number = 1) => {
  if (ghAtt > ghTar && ghAtt > 0) {
    // Lower GH using Osmosis water
    const vOsmosis = vNet * (1 - (ghTar / ghAtt));
    return { type: 'lower', value: Number(vOsmosis.toFixed(2)), target: ghTar };
  } else if (ghAtt < ghTar) {
    // Raise GH using mineral salts
    const grams = ((ghTar - ghAtt) * vNet / 100) * kSale;
    return { type: 'higher', value: Number(grams.toFixed(2)), target: ghTar };
  }
  return null;
};

/**
 * Calculate NH3 toxicity based on NH4, pH and Temperature
 * @param nh4 Ammonium in mg/L
 * @param ph pH value
 * @param temp Temperature in °C
 */
export const calculateNH3Toxicity = (nh4: number, ph: number, temp: number) => {
  if (nh4 <= 0) return 0;
  
  // pKa calculation
  const pKa = 0.09018 + 2729.92 / (temp + 273.15);
  
  // Fraction of un-ionized ammonia (NH3)
  const fraction = 1 / (Math.pow(10, pKa - ph) + 1);
  
  // NH3 concentration
  const nh3 = nh4 * fraction;
  
  return Number(nh3.toFixed(4));
};

/**
 * Analyze Redfield Ratio (N:P)
 * @param no3 Nitrates in mg/L
 * @param po4 Phosphates in mg/L
 */
export const analyzeRedfieldRatio = (no3: number, po4: number) => {
  if (po4 <= 0) return { ratio: 0, status: 'PO4_ZERO' };
  
  const ratio = no3 / po4;
  
  if (ratio < 5) return { ratio, status: 'CYANO_RISK', advice: 'Rapporto troppo basso. Rischio cianobatteri. Aumenta NO3 o riduci PO4.' };
  if (ratio > 20) return { ratio, status: 'GSA_RISK', advice: 'Rapporto troppo alto. Rischio alghe a puntini verdi (GSA). Aumenta PO4 o riduci NO3.' };
  
  return { ratio, status: 'IDEAL', advice: 'Rapporto Redfield ideale (10:1 - 15:1).' };
};

/**
 * Analyze CO2 concentration based on pH and KH
 * @param ph pH value
 * @param kh KH value
 */
export const calculateCO2 = (ph: number, kh: number) => {
  if (ph <= 0 || kh <= 0) return 0;
  
  // CO2 (mg/L) = 3 * KH * 10^(7 - pH)
  const co2 = 3 * kh * Math.pow(10, 7 - ph);
  
  return Number(co2.toFixed(1));
};

/**
 * Get CO2 status
 * @param co2 CO2 in mg/L
 */
export const getCO2Status = (co2: number) => {
  if (co2 < 15) return { status: 'LOW', color: 'text-blue-400', advice: 'CO2 insufficiente per piante esigenti.' };
  if (co2 > 35) return { status: 'HIGH', color: 'text-red-400', advice: 'CO2 troppo alta! Pericolo per i pesci.' };
  return { status: 'IDEAL', color: 'text-emerald-400', advice: 'Livello di CO2 ottimale.' };
};

/**
 * Calculate evaporation refill and percentage lost
 * @param length Tank length in cm
 * @param width Tank width in cm
 * @param vNet Net volume in Liters
 * @param hEvap Evaporated height in cm
 */
export const calculateEvaporation = (length: number, width: number, vNet: number, hEvap: number): EvaporationResult => {
  if (length <= 0 || width <= 0 || hEvap <= 0) return { liters: 0, percentLost: 0 };
  
  // V_evap = (S * hEvap) / 1000
  const vEvap = (length * width * hEvap) / 1000;
  
  // %_lost = (V_evap / vNet) * 100
  const percentLost = vNet > 0 ? (vEvap / vNet) * 100 : 0;
  
  return {
    liters: Number(vEvap.toFixed(2)),
    percentLost: Number(percentLost.toFixed(1))
  };
};

/**
 * Parse dimensions string (e.g., "60 x 30 x 35 cm" or "60x30x35")
 * @param dimensions String containing dimensions
 */
export const parseDimensions = (dimensions: string) => {
  if (!dimensions) return { length: 0, width: 0, height: 0 };
  
  // Remove "cm" and other non-numeric characters except 'x', '.', and ','
  const clean = dimensions.toLowerCase().replace(/cm/g, '').replace(/,/g, '.');
  const parts = clean.split('x').map(p => parseFloat(p.trim()));
  
  return {
    length: parts[0] || 0,
    width: parts[1] || 0,
    height: parts[2] || 0
  };
};
