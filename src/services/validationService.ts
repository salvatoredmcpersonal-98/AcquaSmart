import { FISH_MASTER_DATA, PLANT_MASTER_DATA, FishSpecies, PlantSpecies } from '../constants/masterData';

export interface PurchaseSuggestion {
  zone: string;
  fishName: string;
  motivation: string;
}

export interface ValidationResult {
  technicalData: { 
    netVolume: number; 
    lumenPerLiter: number; 
    co2: number; 
    totalWeight: number;
    currentParams: { ph: number; kh: number; temp: number; gh?: number; nitrates?: number };
  };
  status: 'Ottimale' | 'Warning' | 'Errore Critico';
  ecosystemType: 'TROPICALE' | 'ACQUA FREDDA';
  checks: {
    chemical: { status: 'ok' | 'error'; message: string; commonRange?: any };
    lighting: { status: 'ok' | 'error'; message: string };
    algae: { status: 'ok' | 'warning'; message: string };
    ethological: { status: 'ok' | 'error' | 'warning'; message: string };
    load: { status: 'ok' | 'warning'; message: string };
    sexRatio: { status: 'ok' | 'warning' | 'error'; message: string };
  };
  explanation: string[];
  suggestedChart?: 'Intersezione Range' | 'Ciclo Azoto' | 'Triangolo Alghe';
  biotypeAnalysis: string;
  lifeSavingAdvice: string;
  zoneAnalysis: {
    superficie: { count: number; saturation: number; status: 'Ottimo' | 'Giallo' | 'Rosso' };
    centro: { count: number; saturation: number; status: 'Ottimo' | 'Giallo' | 'Rosso' };
    fondo: { count: number; saturation: number; status: 'Ottimo' | 'Giallo' | 'Rosso' };
    territorialConflict: boolean;
    suggestions: string[];
  };
  purchaseSuggestions: PurchaseSuggestion[];
}

export interface HealthScoreResult {
  score: number;
  status: 'OTTIMO' | 'STABILE' | 'SQUILIBRATO' | 'CRITICO';
  color: string;
  riskFactors: string[];
  quickAdvice?: string;
}

export function calculateHealthScore(
  testLogs: any[],
  reminders: any[],
  validation: ValidationResult,
  inhabitants: { fish: any[]; plants: any[]; waterParams: any }
): HealthScoreResult {
  let score = 100;
  const riskFactors: string[] = [];
  let quickAdvice = "";
  const now = new Date();
  const latestLog = testLogs[0];
  const nitrates = latestLog?.nitrates || 0;
  const waterParams = validation.technicalData.currentParams;

  // 1. NITRATI (NO3) - Penale -30 pt se > 20
  if (nitrates > 50) {
    score -= 50;
    riskFactors.push(`Nitrati Critici (${nitrates}mg/L) (-50 pt)`);
  } else if (nitrates > 20) {
    score -= 30;
    riskFactors.push(`Nitrati Elevati (${nitrates}mg/L) (-30 pt)`);
  }

  // 2. INCOMPATIBILITÀ SESSO / AGGRESSIVITÀ - Penale -40 pt
  if (validation.checks.sexRatio.status === 'error' || validation.checks.ethological.status === 'error') {
    score -= 40;
    riskFactors.push("Incompatibilità sesso/aggressività (-40 pt)");
  }

  // 3. RISCHIO ALGHE - Penale -20 pt
  if (validation.checks.algae.status === 'warning') {
    score -= 20;
    riskFactors.push("Rischio esplosione alghe (-20 pt)");
  }

  // 4. INCOMPATIBILITÀ TERMICA / CHIMICA
  if (validation.checks.chemical.status === 'error') {
    score -= 30;
    riskFactors.push("Incompatibilità termica/chimica (-30 pt)");
  }

  // 5. SATURAZIONE ZONE (>70%)
  const { superficie, centro, fondo } = validation.zoneAnalysis;
  if (superficie.saturation > 70 || centro.saturation > 70 || fondo.saturation > 70) {
    score -= 15;
    if (superficie.saturation > 70) riskFactors.push("Zona Superficie satura (-15 pt)");
    if (centro.saturation > 70) riskFactors.push("Zona Centro satura (-15 pt)");
    if (fondo.saturation > 70) riskFactors.push("Zona Fondo satura (-15 pt)");
  }

  // 6. TEST OBSOLETI (>14gg)
  const isTestOld = !latestLog || (now.getTime() - new Date(latestLog.timestamp).getTime()) / (1000 * 60 * 60 * 24) > 14;
  if (isTestOld) {
    score -= 10;
    riskFactors.push("Dati obsoleti (>14gg) (-10 pt)");
  }

  // 6. EMPTY TANK CHECK (Professional Feature)
  const totalFishLength = inhabitants.fish.reduce((acc, f) => {
    const species = FISH_MASTER_DATA.find(m => f.name.includes(m.name));
    return acc + (species ? species.maxSize * f.quantity : 0);
  }, 0);
  const totalLoad = totalFishLength / (validation.technicalData.netVolume / 2); // 1.0 is full load
  if (totalLoad < 0.1 && inhabitants.fish.length > 0) {
    score = Math.min(score, 85); // Stato Giallo se troppo vuoto
    riskFactors.push("Acquario poco popolato (Rischio instabilità ciclo azoto)");
    quickAdvice = quickAdvice || "L'acquario è tecnicamente perfetto ma troppo vuoto. Considera di aggiungere gradualmente nuovi abitanti per stabilizzare il filtro biologico.";
  }

  // 7. BONUS SALUTE (Professional Feature)
  if (inhabitants.fish.length > 0 && 
      validation.zoneAnalysis.superficie.count > 0 && 
      validation.zoneAnalysis.centro.count > 0 && 
      validation.zoneAnalysis.fondo.count > 0 &&
      validation.zoneAnalysis.superficie.status === 'Ottimo' &&
      validation.zoneAnalysis.centro.status === 'Ottimo' &&
      validation.zoneAnalysis.fondo.status === 'Ottimo') {
    score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  let status: 'OTTIMO' | 'STABILE' | 'SQUILIBRATO' | 'CRITICO' = 'OTTIMO';
  let color = '#00FF00';

  if (score < 50) {
    status = 'CRITICO';
    color = '#FF0000';
  } else if (score < 70) {
    status = 'SQUILIBRATO';
    color = '#FF8C00';
  } else if (score < 90) {
    status = 'STABILE';
    color = '#FFD700';
  }

  return { 
    score, 
    status, 
    color, 
    riskFactors, 
    quickAdvice: validation.lifeSavingAdvice 
  };
}

export function validateSetup(
  tank: { length?: number; width?: number; height?: number; volume?: number },
  accessories: any[],
  inhabitants: { fish: any[]; plants: any[]; hardscape: any[] },
  waterParams: { ph: number; kh: number; temp: number; gh?: number; nitrates?: number }
): ValidationResult {
  // 1. DATA BINDING & HIERARCHY
  let L = tank.length || 0;
  let P = tank.width || 0;
  let A = tank.height || 0;
  let V = tank.volume || 0;

  // If tank dimensions are default (0 or small), try to extract from selected 'tank' accessory
  if (L === 0 || P === 0 || A === 0) {
    const selectedTank = accessories.find(a => a.type === 'tank');
    if (selectedTank && selectedTank.dimensions) {
      const dims = selectedTank.dimensions.match(/(\d+)\s*[x*]\s*(\d+)\s*[x*]\s*(\d+)/);
      if (dims) {
        L = parseInt(dims[1]);
        P = parseInt(dims[2]);
        A = parseInt(dims[3]);
        V = (L * P * A) / 1000;
      }
    }
  }

  const grossVolume = V || (L * P * A) / 1000;
  const netVolume = grossVolume > 0 ? grossVolume * 0.85 : 0;
  const totalWeight = grossVolume > 0 ? grossVolume * 1.25 : 0;

  // Lumen/Litro: Search for 'lumen' in selected lamp
  const totalLumens = accessories
    .filter(a => a.type === 'lamp')
    .reduce((acc, curr) => {
      if (curr.lumen) return acc + curr.lumen;
      // Fallback: extract watt from name and estimate 80 lm/W
      const wattMatch = curr.name.match(/(\d+)W/);
      const watts = wattMatch ? parseInt(wattMatch[1]) : (curr.watt || 0);
      return acc + (watts * 80);
    }, 0);

  const lumenPerLiter = netVolume > 0 ? totalLumens / netVolume : 0;
  const co2 = (waterParams.kh > 0 && waterParams.ph > 0) 
    ? 3 * waterParams.kh * Math.pow(10, (7 - waterParams.ph)) 
    : 0;

  const result: ValidationResult = {
    technicalData: { netVolume, lumenPerLiter, co2, totalWeight, currentParams: waterParams },
    status: 'Ottimale',
    ecosystemType: waterParams.temp >= 20 ? 'TROPICALE' : 'ACQUA FREDDA',
    checks: {
      chemical: { status: 'ok', message: 'Parametri chimici compatibili.' },
      lighting: { status: 'ok', message: 'Illuminazione adeguata.' },
      algae: { status: 'ok', message: 'Equilibrio CO2/Luce ottimale.' },
      ethological: { status: 'ok', message: 'Convivenza pacifica.' },
      load: { status: 'ok', message: 'Carico biologico sotto controllo.' },
      sexRatio: { status: 'ok', message: 'Rapporto sessi ottimale.' },
    },
    biotypeAnalysis: "Analisi in corso...",
    lifeSavingAdvice: "Monitoraggio attivo.",
    explanation: [],
    zoneAnalysis: {
      superficie: { count: 0, saturation: 0, status: 'Ottimo' },
      centro: { count: 0, saturation: 0, status: 'Ottimo' },
      fondo: { count: 0, saturation: 0, status: 'Ottimo' },
      territorialConflict: false,
      suggestions: []
    },
    purchaseSuggestions: []
  };

  // 0. ZONE ANALYSIS
  const fishWithData = inhabitants.fish.map(f => ({
    ...f,
    species: FISH_MASTER_DATA.find(m => f.name.includes(m.name))
  })).filter(f => f.species);

  const totalAdultCm = fishWithData.reduce((acc, f) => acc + (f.species!.maxSize * f.quantity), 0);
  
  const zones = {
    superficie: { cm: 0, count: 0, territorial: 0 },
    centro: { cm: 0, count: 0, territorial: 0 },
    fondo: { cm: 0, count: 0, territorial: 0 }
  };

  fishWithData.forEach(f => {
    const s = f.species!;
    let targetZone: 'superficie' | 'centro' | 'fondo' = 'centro';
    if (s.zone === 'Alto' || s.zone === 'Alto/Centro') targetZone = 'superficie';
    else if (s.zone === 'Centro') targetZone = 'centro';
    else if (s.zone === 'Fondo') targetZone = 'fondo';

    zones[targetZone].cm += (s.maxSize * f.quantity);
    zones[targetZone].count += f.quantity;
    if (s.behavior === 'Territoriale' || s.behavior === 'Aggressivo') {
      zones[targetZone].territorial += 1;
    }
  });

  const getZoneStatus = (cm: number) => {
    const sat = totalAdultCm > 0 ? (cm / totalAdultCm) * 100 : 0;
    if (sat > 70) return { sat, status: 'Rosso' as const };
    if (sat > 40) return { sat, status: 'Giallo' as const };
    return { sat, status: 'Ottimo' as const };
  };

  const supStatus = getZoneStatus(zones.superficie.cm);
  const cenStatus = getZoneStatus(zones.centro.cm);
  const fonStatus = getZoneStatus(zones.fondo.cm);

  const territorialConflict = zones.superficie.territorial > 1 || zones.centro.territorial > 1 || zones.fondo.territorial > 1;

  const suggestions: string[] = [];
  if (zones.superficie.count === 0) suggestions.push("La superficie è vuota: potresti inserire dei Guppy o dei Trichogaster.");
  if (zones.centro.count === 0) suggestions.push("Il centro è poco popolato: dei Neon o delle Rasbore darebbero colore.");
  if (zones.fondo.count === 0) suggestions.push("Il fondo è vuoto: dei Corydoras o delle Caridine aiuterebbero con la pulizia.");
  
  if (fonStatus.status === 'Rosso' && netVolume < 60) {
    suggestions.push("Troppi pesci di fondo per questa superficie: rischio di stress cronico e morsi alle pinne.");
  }

  if (territorialConflict) {
    suggestions.push("Rilevato conflitto in zona Fondo. Hai troppi pesci territoriali alla base; considera di aumentare i nascondigli o ridisporre l'hardscape.");
  }

  result.zoneAnalysis = {
    superficie: { count: zones.superficie.count, saturation: supStatus.sat, status: supStatus.status },
    centro: { count: zones.centro.count, saturation: cenStatus.sat, status: cenStatus.status },
    fondo: { count: zones.fondo.count, saturation: fonStatus.sat, status: fonStatus.status },
    territorialConflict,
    suggestions
  };

  if (territorialConflict) {
    result.status = 'Errore Critico';
    result.explanation.push("🛑 ERRORE CRITICO: Conflitto Territoriale Imminente tra specie aggressive nella stessa zona.");
  }

  // 1. CHEMICAL & THERMAL CHECK
  const selectedFish = inhabitants.fish.map(f => ({
    ...f,
    species: FISH_MASTER_DATA.find(m => f.name.includes(m.name))
  })).filter(f => f.species);
  
  const selectedPlants = inhabitants.plants.map(p => PLANT_MASTER_DATA.find(m => p.name.includes(m.name))).filter(Boolean) as PlantSpecies[];

  // BIOTYPE ANALYSIS
  if (result.ecosystemType === 'ACQUA FREDDA') {
    result.biotypeAnalysis = "Stai creando un acquario d'Acqua Fredda (Temperato). Ideale per Carassi e specie fluviali europee.";
  } else {
    const hasAmazonian = selectedFish.some(f => f.species!.note?.toLowerCase().includes('amazzonico') || f.species!.group?.includes('Ciclide-Medio'));
    const hasMalawi = selectedFish.some(f => f.species!.group === 'Aggressivo' && f.name.includes('Malawi'));
    if (hasMalawi) result.biotypeAnalysis = "Stai progettando un acquario Biotopo Lago Malawi. Attenzione all'aggressività e all'assenza di piante tenere.";
    else if (hasAmazonian) result.biotypeAnalysis = "Stai creando un acquario Tropicale Amazzonico. Acque tenere, pH acido e molta vegetazione.";
    else result.biotypeAnalysis = "Stai creando un acquario Tropicale di Comunità. Equilibrio tra specie diverse e parametri neutri.";
  }

  // Filtro Termico Rigido
  selectedFish.forEach(f => {
    const s = f.species!;
    if (result.ecosystemType === 'TROPICALE' && s.temp[0] < 18 && s.temp[1] < 22) {
      result.checks.chemical.status = 'error';
      result.status = 'Errore Critico';
      result.explanation.push(`🛑 ERRORE TERMICO CRITICO: ${s.name} è un pesce d'acqua fredda. Non può sopravvivere in un ecosistema tropicale.`);
    } else if (result.ecosystemType === 'ACQUA FREDDA' && s.temp[0] >= 22) {
      result.checks.chemical.status = 'error';
      result.status = 'Errore Critico';
      result.explanation.push(`🛑 ERRORE TERMICO CRITICO: ${s.name} è un pesce tropicale. Morirà di shock termico in acqua fredda.`);
    }
  });

  // Shock Osmotico (KH/pH vs Dashboard)
  selectedFish.forEach(f => {
    const s = f.species!;
    if (waterParams.ph < s.ph[0] || waterParams.ph > s.ph[1]) {
      result.checks.chemical.status = 'error';
      result.status = 'Errore Critico';
      result.explanation.push(`🛑 PERICOLO SHOCK OSMOTICO: Il pH attuale (${waterParams.ph}) è fuori dal range vitale di ${s.name} (${s.ph[0]}-${s.ph[1]}).`);
    }
    if (waterParams.gh && (waterParams.gh < s.gh[0] || waterParams.gh > s.gh[1])) {
      result.checks.chemical.status = 'error';
      result.status = 'Errore Critico';
      result.explanation.push(`🛑 PERICOLO SHOCK OSMOTICO: La durezza attuale (GH ${waterParams.gh}) è fuori dal range vitale di ${s.name} (${s.gh[0]}-${s.gh[1]}).`);
    }
  });

  // Ipossia (Mancanza Ossigeno)
  if (waterParams.temp > 28) {
    result.explanation.push("⚠️ PERICOLO ASFISSIA: La temperatura alta (>28°C) riduce drasticamente l'ossigeno disciolto. Aumenta la movimentazione superficiale!");
  }

  // Incompatibilità Incrociata (pH e Temp)
  if (selectedFish.length > 0) {
    let commonPh: [number, number] = [0, 14];
    let commonTemp: [number, number] = [0, 100];

    selectedFish.forEach(f => {
      const s = f.species!;
      commonPh = [Math.max(commonPh[0], s.ph[0]), Math.min(commonPh[1], s.ph[1])];
      commonTemp = [Math.max(commonTemp[0], s.temp[0]), Math.min(commonTemp[1], s.temp[1])];
    });

    if (commonPh[0] > commonPh[1] || commonTemp[0] > commonTemp[1]) {
      result.checks.chemical.status = 'error';
      result.status = 'Errore Critico';
      result.explanation.push("🛑 ERRORE CRITICO: Incompatibilità incrociata. Non esiste un range di pH/Temp comune per tutte le specie selezionate.");
    }
  }

  // 2. LIGHTING CHECK
  const highLightPlants = selectedPlants.filter(p => p.light[0] > lumenPerLiter);
  if (highLightPlants.length > 0) {
    result.checks.lighting.status = 'error';
    result.checks.lighting.message = 'Luce insufficiente per alcune piante.';
    if (result.status !== 'Errore Critico') result.status = 'Warning';
    result.explanation.push(`🛑 ERRORE: Luce Insufficiente per ${highLightPlants.map(p => p.name).join(', ')}.`);
  }

  // 3. ALGAE CHECK
  const nitrates = waterParams.nitrates || 0;
  if (nitrates > 20 && lumenPerLiter > 40 && co2 < 15) {
    result.checks.algae.status = 'warning';
    result.checks.algae.message = 'Rischio esplosione alghe verdi filamentose.';
    if (result.status === 'Ottimale') result.status = 'Warning';
    result.explanation.push('⚠️ WARNING: Rischio esplosione alghe verdi filamentose (NO3 > 20 e Luce alta senza CO2).');
  } else if (lumenPerLiter > 40 && co2 < 15) {
    result.checks.algae.status = 'warning';
    result.checks.algae.message = 'Sbilanciamento Luce/CO2.';
    if (result.status === 'Ottimale') result.status = 'Warning';
    result.explanation.push('⚠️ WARNING: Sbilanciamento Luce/CO2 (Rischio alghe).');
  }

  // 4. ETHOLOGICAL & SEX CHECK
  const bettaMales = selectedFish.filter(f => f.name.includes('Betta') && f.sex === 'M');
  const totalBettaMales = bettaMales.reduce((acc, f) => acc + f.quantity, 0);
  if (totalBettaMales > 1) {
    result.checks.sexRatio.status = 'error';
    result.status = 'Errore Critico';
    result.explanation.push("🛑 CONFLITTO MORTALE: Rilevato più di un Betta maschio. Si uccideranno a vicenda.");
  }

  const cichlidMales = selectedFish.filter(f => (f.species!.group?.includes('Ciclide') || f.species!.group === 'Aggressivo') && f.sex === 'M');
  const totalCichlidMales = cichlidMales.reduce((acc, f) => acc + f.quantity, 0);
  if (totalCichlidMales > 1 && netVolume < 200) {
    result.checks.sexRatio.status = 'error';
    if (result.status !== 'Errore Critico') result.status = 'Warning';
    result.explanation.push("⚠️ Rischio Aggressività Intraspecifica: Più maschi di Ciclidi in volume ridotto (<200L).");
  }

  const poecilids = selectedFish.filter(f => f.species!.group === 'Poecilidi');
  if (poecilids.length > 0) {
    const males = poecilids.filter(f => f.sex === 'M').reduce((acc, f) => acc + f.quantity, 0);
    const females = poecilids.filter(f => f.sex === 'F').reduce((acc, f) => acc + f.quantity, 0);
    if (males > 0 && females > 0 && males / females > 1/3) {
      result.checks.sexRatio.status = 'warning';
      if (result.status === 'Ottimale') result.status = 'Warning';
      result.explanation.push("⚠️ Femmine sotto stress: correggi il rapporto maschi/femmine (minimo 1 maschio ogni 3 femmine).");
    }
  }

  const hasScalare = selectedFish.some(f => f.name === 'Scalare');
  const hasNeon = selectedFish.some(f => f.name === 'Neon');
  if (hasScalare && hasNeon) {
    result.checks.ethological.status = 'error';
    result.checks.ethological.message = 'Predatore/Preda rilevati (Scalare/Neon).';
    result.status = 'Errore Critico';
    result.explanation.push('🛑 ERRORE CRITICO: Gli Scalari potrebbero mangiare i Neon.');
  }

  const hasBetta = selectedFish.some(f => f.name === 'Betta Splendens');
  const hasGuppy = selectedFish.some(f => f.name === 'Guppy');
  if (hasBetta && hasGuppy) {
    result.checks.ethological.status = 'warning';
    result.checks.ethological.message = 'Incompatibilità Betta/Guppy.';
    if (result.status === 'Ottimale') result.status = 'Warning';
    result.explanation.push('⚠️ WARNING: Il Betta potrebbe attaccare i Guppy a causa delle loro code lunghe.');
  }

  const hasMalawi = selectedFish.some(f => f.group === 'Aggressivo');
  const hasPlants = selectedPlants.length > 0;
  if (hasMalawi && hasPlants) {
    result.checks.ethological.status = 'warning';
    result.checks.ethological.message = 'Ciclidi Africani e Piante.';
    if (result.status === 'Ottimale') result.status = 'Warning';
    result.explanation.push('⚠️ WARNING: I Ciclidi Africani (Malawi/Tanganica) tendono a sradicare o mangiare molte piante tenere.');
  }

  const hasPreda = selectedFish.some(f => f.behavior === 'Preda');
  const hasMediumCiclide = selectedFish.some(f => f.group === 'Ciclide-Medio' || f.group === 'Ciclide-Premium');
  if (hasPreda && hasMediumCiclide) {
    result.checks.ethological.status = 'error';
    result.checks.ethological.message = 'Invertebrati a rischio.';
    result.status = 'Errore Critico';
    result.explanation.push('🛑 ERRORE CRITICO: Gli invertebrati (Caridine) sono prede naturali per i Ciclidi medi/grandi.');
  }

  // 5. LOAD CHECK
  const totalFishLength = inhabitants.fish.reduce((acc, f) => {
    const species = FISH_MASTER_DATA.find(m => f.name.includes(m.name));
    return acc + (species ? species.maxSize * f.quantity : 0);
  }, 0);

  if (totalFishLength > netVolume / 2) {
    result.checks.load.status = 'warning';
    result.checks.load.message = 'Sovraffollamento rilevato.';
    if (result.status === 'Ottimale') result.status = 'Warning';
    result.explanation.push('⚠️ WARNING: Sovraffollamento (Oltre 1cm di pesce per 2 litri netti).');
  }

  // 6. PURCHASE SUGGESTIONS (Professional Feature)
  const currentLoad = totalFishLength / (netVolume / 2);
  if (currentLoad < 0.9) {
    const emptyZones: ('Superficie' | 'Centro' | 'Fondo')[] = [];
    if (zones.superficie.count === 0) emptyZones.push('Superficie');
    if (zones.centro.count === 0) emptyZones.push('Centro');
    if (zones.fondo.count === 0) emptyZones.push('Fondo');

    // Find compatible fish for each empty zone
    emptyZones.forEach(zone => {
      const compatibleFish = FISH_MASTER_DATA.filter(f => {
        // Check zone
        const isCorrectZone = (zone === 'Superficie' && (f.zone === 'Alto' || f.zone === 'Alto/Centro')) ||
                            (zone === 'Centro' && f.zone === 'Centro') ||
                            (zone === 'Fondo' && f.zone === 'Fondo');
        if (!isCorrectZone) return false;

        // Check chemistry compatibility with current inhabitants
        const isChemCompatible = selectedFish.every(curr => 
          !(f.ph[1] < curr.species!.ph[0] || curr.species!.ph[1] < f.ph[0]) &&
          !(f.temp[1] < curr.species!.temp[0] || curr.species!.temp[1] < f.temp[0])
        );
        
        // Check specific chemistry compatibility with current water params
        const isWaterCompatible = (waterParams.ph >= f.ph[0] && waterParams.ph <= f.ph[1]) &&
                                 (waterParams.temp >= f.temp[0] && waterParams.temp <= f.temp[1]);

        return isChemCompatible && isWaterCompatible;
      });

      if (compatibleFish.length > 0) {
        // Pick the best one (or first one for now)
        const best = compatibleFish[0];
        let motivation = `Occupa la zona ${zone} e condivide i parametri chimici ideali dell'ecosistema.`;
        if (best.name === 'Otocinclus') motivation = "Eccezionale mangiatore di alghe, aiuta a mantenere pulite le foglie delle piante.";
        if (best.name === 'Corydoras') motivation = "Pesce da fondo pacifico che aiuta a smaltire i residui di cibo tra gli arredi.";
        if (best.name === 'Guppy') motivation = "Specie vivace e colorata che anima la superficie dell'acquario.";
        if (best.name === 'Betta Splendens') motivation = "Pesce di carattere, ideale come protagonista solitario per la zona alta.";
        
        result.purchaseSuggestions.push({
          zone,
          fishName: best.name,
          motivation: `${motivation} (Consigliato: ${best.group === 'Poecilidi' ? '1M + 3F' : 'Coppia M+F'})`
        });
      }
    });

    // Add functional suggestions if not already present
    if (waterParams.nitrates && waterParams.nitrates > 20) {
      result.purchaseSuggestions.push({
        zone: 'Flora',
        fishName: 'Piante a crescita rapida',
        motivation: 'I tuoi nitrati sono alti. Inserisci piante come Egeria Densa o Limnophila per assorbire i nutrienti in eccesso e prevenire le alghe.'
      });
    }

    if (!selectedFish.some(f => f.name === 'Otocinclus') && currentLoad < 0.8) {
      const oto = FISH_MASTER_DATA.find(f => f.name === 'Otocinclus');
      if (oto && selectedFish.every(curr => !(oto.ph[1] < curr.species!.ph[0] || curr.species!.ph[1] < oto.ph[0]))) {
         result.purchaseSuggestions.push({
           zone: 'Centro/Fondo',
           fishName: 'Otocinclus',
           motivation: 'Ottimo mangiatore di alghe, pacifico e instancabile lavoratore per mantenere pulito l\'ecosistema.'
         });
      }
    }
  }

  // 7. CHART SUGGESTION
  if (result.status === 'Errore Critico' && result.checks.chemical.status === 'error') {
    result.suggestedChart = 'Intersezione Range';
  } else if (result.checks.algae.status === 'warning') {
    result.suggestedChart = 'Triangolo Alghe';
  } else {
    result.suggestedChart = 'Ciclo Azoto';
  }

  // 8. LIFE SAVING ADVICE
  const nitratesVal = waterParams.nitrates || 0;
  if (nitratesVal > 50) result.lifeSavingAdvice = "Fai un cambio d'acqua del 50% IMMEDIATAMENTE per abbassare i Nitrati tossici.";
  else if (nitratesVal > 20) result.lifeSavingAdvice = "Fai un cambio d'acqua del 20% per abbassare i Nitrati e prevenire le alghe.";
  else if (result.checks.sexRatio.status === 'error') result.lifeSavingAdvice = "Separa immediatamente i maschi aggressivi per evitare decessi.";
  else if (waterParams.temp > 28) result.lifeSavingAdvice = "Aumenta l'ossigenazione dell'acqua puntando l'uscita del filtro verso l'alto.";
  else result.lifeSavingAdvice = "L'ecosistema è stabile. Continua con la manutenzione regolare e il monitoraggio dei parametri.";

  return result;
}
