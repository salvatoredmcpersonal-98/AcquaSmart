export interface Suggestion {
  category?: string;
  model: string;
  recommendedVolume?: string;
  priceRange: string;
  minPrice: number;
  dimensions?: string;
  type?: string;
  lumen?: number;
  watt?: number;
}

export const FILTER_SUGGESTIONS: Record<string, Suggestion[]> = {
  'nano': [ // 10L - 60L
    { category: 'Esterno', model: 'Eden 501', recommendedVolume: 'fino a 60L', priceRange: '€45 – €55', minPrice: 45 },
    { category: 'Esterno', model: 'Oase FiltoSmart 60', recommendedVolume: 'fino a 60L', priceRange: '€65 – €75', minPrice: 65 },
    { category: 'Esterno', model: 'Sicce Space Eko+ 100', recommendedVolume: '40L - 100L', priceRange: '€85 – €100', minPrice: 85 },
    { category: 'Zainetto', model: 'Seachem Tidal 35', recommendedVolume: 'fino a 55L', priceRange: '€50 – €65', minPrice: 50 },
    { category: 'Zainetto', model: 'Marina Slim S10', recommendedVolume: 'fino a 35L', priceRange: '€18 – €25', minPrice: 18 },
    { category: 'Zainetto', model: 'Blau FM-120', recommendedVolume: 'fino a 40L', priceRange: '€18 – €22', minPrice: 18 },
    { category: 'Zainetto', model: 'Dennerle Scaper\'s Flow', recommendedVolume: 'fino a 60L', priceRange: '€75 – €90', minPrice: 75 },
    { category: 'Interno', model: 'Aquael PAT Mini', recommendedVolume: '10L - 50L', priceRange: '€17 – €22', minPrice: 17 },
    { category: 'Interno', model: 'Dennerle Corner Filter', recommendedVolume: '10L - 40L', priceRange: '€24 – €30', minPrice: 24 },
    { category: 'Ad Aria', model: 'XY-2831 (Doppio)', recommendedVolume: 'fino a 40L', priceRange: '€5 – €9', minPrice: 5 },
  ],
  'medium': [ // 60L - 150L
    { category: 'Esterno', model: 'Askoll Pratiko 200 4.0', recommendedVolume: '100L - 200L', priceRange: '€135 – €145', minPrice: 135 },
    { category: 'Esterno', model: 'JBL CristalProfi e702', recommendedVolume: '60L - 160L', priceRange: '€105 – €115', minPrice: 105 },
    { category: 'Esterno', model: 'Eheim Classic 250', recommendedVolume: '80L - 250L', priceRange: '€85 – €95', minPrice: 85 },
    { category: 'Esterno', model: 'Fluval 207', recommendedVolume: '60L - 220L', priceRange: '€110 – €125', minPrice: 110 },
    { category: 'Zainetto', model: 'Seachem Tidal 55', recommendedVolume: 'fino a 150L', priceRange: '€60 – €85', minPrice: 60 },
    { category: 'Zainetto', model: 'AquaClear 50', recommendedVolume: '75L - 190L', priceRange: '€55 – €65', minPrice: 55 },
    { category: 'Zainetto', model: 'Oase BioStyle 115', recommendedVolume: 'fino a 115L', priceRange: '€50 – €55', minPrice: 50 },
    { category: 'Interno', model: 'Eheim Biopower 160', recommendedVolume: '80L - 160L', priceRange: '€45 – €55', minPrice: 45 },
    { category: 'Interno', model: 'Sicce Shark ADV 400', recommendedVolume: '60L - 130L', priceRange: '€32 – €38', minPrice: 32 },
    { category: 'Ad Aria', model: 'Sera L300 (Doppio)', recommendedVolume: 'fino a 150L', priceRange: '€14 – €18', minPrice: 14 },
  ],
  'large': [ // 150L - 300L
    { category: 'Esterno', model: 'Askoll Pratiko 300 4.0', recommendedVolume: '200L - 300L', priceRange: '€165 – €180', minPrice: 165 },
    { category: 'Esterno', model: 'JBL CristalProfi e1502', recommendedVolume: '160L - 600L', priceRange: '€170 – €190', minPrice: 170 },
    { category: 'Esterno', model: 'Oase BioMaster 350', recommendedVolume: 'fino a 350L', priceRange: '€195 – €210', minPrice: 195 },
    { category: 'Esterno', model: 'Aquael Ultramax 1500', recommendedVolume: 'fino a 450L', priceRange: '€150 – €170', minPrice: 150 },
    { category: 'Zainetto', model: 'Seachem Tidal 75', recommendedVolume: 'fino a 280L', priceRange: '€70 – €95', minPrice: 70 },
    { category: 'Zainetto', model: 'Fluval C4', recommendedVolume: '150L - 265L', priceRange: '€75 – €90', minPrice: 75 },
    { category: 'Zainetto', model: 'Oase BioStyle 180', recommendedVolume: 'fino a 180L', priceRange: '€60 – €70', minPrice: 60 },
    { category: 'Interno', model: 'Fluval U4', recommendedVolume: '130L - 240L', priceRange: '€70 – €85', minPrice: 70 },
    { category: 'Interno', model: 'Juwel Bioflow M', recommendedVolume: 'fino a 200L', priceRange: '€65 – €75', minPrice: 65 },
    { category: 'Interno', model: 'Sicce Shark ADV 800', recommendedVolume: '130L - 250L', priceRange: '€42 – €48', minPrice: 42 },
  ],
  'xl': [ // 300L - 600L+
    { category: 'Esterno', model: 'Fluval FX6', recommendedVolume: 'fino a 1500L', priceRange: '€340 – €380', minPrice: 340 },
    { category: 'Esterno', model: 'Askoll Pratiko 400 4.0', recommendedVolume: '300L - 400L', priceRange: '€205 – €220', minPrice: 205 },
    { category: 'Esterno', model: 'Eheim Prof. 4+ 600', recommendedVolume: '240L - 600L', priceRange: '€250 – €290', minPrice: 250 },
    { category: 'Esterno', model: 'JBL CristalProfi e1902', recommendedVolume: '200L - 800L', priceRange: '€220 – €245', minPrice: 220 },
    { category: 'Esterno', model: 'Aquael Ultramax 2000', recommendedVolume: 'fino a 700L', priceRange: '€180 – €210', minPrice: 180 },
    { category: 'Zainetto', model: 'Seachem Tidal 110', recommendedVolume: 'fino a 400L', priceRange: '€85 – €115', minPrice: 85 },
    { category: 'Zainetto', model: 'AquaClear 110', recommendedVolume: '220L - 410L', priceRange: '€95 – €110', minPrice: 95 },
    { category: 'Interno', model: 'Juwel Bioflow XL', recommendedVolume: 'fino a 500L', priceRange: '€95 – €110', minPrice: 95 },
    { category: 'Interno', model: 'Eheim PowerLine XL', recommendedVolume: 'fino a 400L', priceRange: '€80 – €95', minPrice: 80 },
    { category: 'Esterno', model: 'Oase BioMaster 850', recommendedVolume: 'fino a 850L', priceRange: '€290 – €320', minPrice: 290 },
  ]
};

export const TANK_SUGGESTIONS: Record<string, Suggestion[]> = {
  'nano': [ // 10L - 44L
    { model: 'Dennerle Nano Cube 20', recommendedVolume: '20L', dimensions: '25 x 25 x 30 cm', priceRange: '€55 – €65', minPrice: 55 },
    { model: 'Dennerle Nano Cube 30', recommendedVolume: '30L', dimensions: '30 x 30 x 35 cm', priceRange: '€65 – €75', minPrice: 65 },
    { model: 'Askoll Pure LED M', recommendedVolume: '44L', dimensions: '36 x 36 x 43 cm', priceRange: '€130 – €150', minPrice: 130 },
    { model: 'Fluval Spec V', recommendedVolume: '19L', dimensions: '52 x 19 x 29 cm', priceRange: '€110 – €130', minPrice: 110 },
    { model: 'Fluval Chi II', recommendedVolume: '19L', dimensions: '25 x 25 x 32 cm', priceRange: '€90 – €110', minPrice: 90 },
    { model: 'Aquael Shrimp Set D&N', recommendedVolume: '30L', dimensions: '29 x 29 x 35 cm', priceRange: '€75 – €90', minPrice: 75 },
    { model: 'Blau Cubic Compact 17', recommendedVolume: '17L', dimensions: '45 x 17 x 22 cm', priceRange: '€40 – €50', minPrice: 40 },
    { model: 'Tetra AquaArt 30', recommendedVolume: '30L', dimensions: '39 x 28 x 43 cm', priceRange: '€70 – €85', minPrice: 70 },
  ],
  'medium': [ // 60L - 125L
    { model: 'Juwell Primo 60', recommendedVolume: '60L', dimensions: '61 x 31 x 37 cm', priceRange: '€100 – €120', minPrice: 100 },
    { model: 'Juwell Primo 70', recommendedVolume: '70L', dimensions: '61 x 31 x 44 cm', priceRange: '€115 – €135', minPrice: 115 },
    { model: 'Juwell Rio 125 LED', recommendedVolume: '125L', dimensions: '81 x 36 x 50 cm', priceRange: '€280 – €330', minPrice: 280 },
    { model: 'Askoll Pure LED L', recommendedVolume: '68L', dimensions: '56 x 36 x 43 cm', priceRange: '€160 – €190', minPrice: 160 },
    { model: 'Askoll Emotions 100', recommendedVolume: '120L', dimensions: '102 x 40 x 40 cm', priceRange: '€250 – €290', minPrice: 250 },
    { model: 'Eheim Vivaline 126', recommendedVolume: '126L', dimensions: '81 x 36 x 45 cm', priceRange: '€350 – €400', minPrice: 350 },
    { model: 'Ferplast Capri 60', recommendedVolume: '60L', dimensions: '60 x 31 x 39 cm', priceRange: '€90 – €110', minPrice: 90 },
    { model: 'Ferplast Capri 80', recommendedVolume: '100L', dimensions: '80 x 31 x 46 cm', priceRange: '€140 – €170', minPrice: 140 },
  ],
  'large': [ // 180L - 350L
    { model: 'Juwell Rio 180 LED', recommendedVolume: '180L', dimensions: '101 x 41 x 50 cm', priceRange: '€350 – €420', minPrice: 350 },
    { model: 'Juwell Rio 240 LED', recommendedVolume: '240L', dimensions: '121 x 41 x 55 cm', priceRange: '€450 – €520', minPrice: 450 },
    { model: 'Juwell Vision 260', recommendedVolume: '260L', dimensions: '121 x 46 x 64 cm (Curvo)', priceRange: '€550 – €620', minPrice: 550 },
    { model: 'Askoll Emotions 120', recommendedVolume: '233L', dimensions: '121 x 40 x 56 cm', priceRange: '€450 – €500', minPrice: 450 },
    { model: 'Eheim Incpiria 230', recommendedVolume: '230L', dimensions: '70 x 60 x 65 cm', priceRange: '€900 – €1.100', minPrice: 900 },
    { model: 'Fluval Roma 240', recommendedVolume: '240L', dimensions: '120 x 40 x 55 cm', priceRange: '€400 – €480', minPrice: 400 },
    { model: 'Oase HighLine 300', recommendedVolume: '302L', dimensions: '115 x 50 x 56 cm', priceRange: '€1.200 – €1.500', minPrice: 1200 },
    { model: 'Juwell Rio 350 LED', recommendedVolume: '350L', dimensions: '121 x 51 x 66 cm', priceRange: '€650 – €750', minPrice: 650 },
  ],
  'scaper': [ // Vasche Nude
    { model: 'ADA Cube Garden 60P', recommendedVolume: '60L', dimensions: '60 x 30 x 36 cm', priceRange: '€160 – €190', minPrice: 160 },
    { model: 'AmTra Ultra Clear 60', recommendedVolume: '63L', dimensions: '60 x 30 x 35 cm', priceRange: '€90 – €110', minPrice: 90 },
    { model: 'AmTra Ultra Clear 90', recommendedVolume: '180L', dimensions: '90 x 45 x 45 cm', priceRange: '€240 – €280', minPrice: 240 },
    { model: 'Blau Gran Cubic 90', recommendedVolume: '182L', dimensions: '90 x 45 x 45 cm', priceRange: '€260 – €300', minPrice: 260 },
    { model: 'ILA Glass 45C', recommendedVolume: '91L', dimensions: '45 x 45 x 45 cm', priceRange: '€130 – €150', minPrice: 130 },
    { model: 'Dennerle Scaper\'s Tank', recommendedVolume: '50L', dimensions: '45 x 36 x 31 cm', priceRange: '€80 – €100', minPrice: 80 },
    { model: 'AmTra Ultra Clear 120', recommendedVolume: '300L', dimensions: '120 x 50 x 50 cm', priceRange: '€450 – €550', minPrice: 450 },
    { model: 'Twinstar Light Glass 60', recommendedVolume: '60L', dimensions: '60 x 30 x 36 cm', priceRange: '€120 – €140', minPrice: 120 },
  ]
};

export const LAMP_SUGGESTIONS: Record<string, Suggestion[]> = {
  'nano': [ // 10L - 50L
    { model: 'Twinstar Light 30B', category: '12W', watt: 12, lumen: 800, recommendedVolume: '30 cm', dimensions: '30 x 5 x 1 cm', priceRange: '€55 – €65', minPrice: 55 },
    { model: 'Chihiros C2 RGB', category: '20W', watt: 20, lumen: 1580, recommendedVolume: '20-36 cm', dimensions: '24 x 4,5 x 1 cm', priceRange: '€85 – €100', minPrice: 85 },
    { model: 'Dennerle Nano Style LED M', category: '6W', watt: 6, lumen: 500, recommendedVolume: '10-30cm', dimensions: '11 x 11 x 20 cm', priceRange: '€45 – €55', minPrice: 45 },
    { model: 'Aquael Leddy Smart Day & Night', category: '4.8W', watt: 4.8, lumen: 480, recommendedVolume: '10-35 cm', dimensions: '20 x 8 x 1 cm', priceRange: '€25 – €35', minPrice: 25 },
    { model: 'ONF Flat Nano', category: '15W', watt: 15, lumen: 1300, recommendedVolume: '25-36 cm', dimensions: '23 x 14 x 21 cm', priceRange: '€110 – €130', minPrice: 110 },
    { model: 'AmTra Vega LED Fresh', category: '10W', watt: 10, lumen: 750, recommendedVolume: '20-40 cm', dimensions: '18 x 12 x 1 cm', priceRange: '€35 – €45', minPrice: 35 },
    { model: 'Fluval Nano Plant LED', category: '15W', watt: 15, lumen: 1000, recommendedVolume: '25-45 cm', dimensions: '13 x 13 cm', priceRange: '€95 – €115', minPrice: 95 },
    { model: 'Week Aqua L Series', category: '18W', watt: 18, lumen: 1200, recommendedVolume: '30 cm', dimensions: '30 x 10 cm', priceRange: '€60 – €75', minPrice: 60 },
  ],
  'medium': [ // 60L - 150L
    { model: 'Twinstar Light 600EA IV', category: '40W', watt: 40, lumen: 2400, recommendedVolume: '60 cm', dimensions: '60 x 12 x 2 cm', priceRange: '€160 – €190', minPrice: 160 },
    { model: 'Chihiros WRGB II 60', category: '67W', watt: 67, lumen: 4500, recommendedVolume: '60-80 cm', dimensions: '60 x 14 x 2 cm', priceRange: '€210 – €240', minPrice: 210 },
    { model: 'Fluval Plant 3.0 (61cm)', category: '32W', watt: 32, lumen: 2350, recommendedVolume: '61-85 cm', dimensions: '61 x 8 x 2 cm', priceRange: '€155 – €180', minPrice: 155 },
    { model: 'JBL LED Solar Nature', category: '22W', watt: 22, lumen: 2100, recommendedVolume: '45-70 cm', dimensions: '44 x 7 x 2 cm', priceRange: '€130 – €150', minPrice: 130 },
    { model: 'Eheim ClassicLED Plants', category: '12W', watt: 12, lumen: 1100, recommendedVolume: '55-63 cm', dimensions: '55 cm (barra)', priceRange: '€75 – €95', minPrice: 75 },
    { model: 'Juwell HeliaLux Spectrum 800', category: '32W', watt: 32, lumen: 3500, recommendedVolume: '80 cm (Rio 125)', dimensions: '79 x 14 cm', priceRange: '€180 – €210', minPrice: 180 },
    { model: 'Twinstar 900B', category: '32W', watt: 32, lumen: 2100, recommendedVolume: '90 cm', dimensions: '90 x 6 x 1 cm', priceRange: '€110 – €130', minPrice: 110 },
    { model: 'Chihiros Serie A II 801', category: '32W', watt: 32, lumen: 3300, recommendedVolume: '80 cm', dimensions: '78 x 7 x 1 cm', priceRange: '€90 – €110', minPrice: 90 },
  ],
  'large': [ // 180L - 350L
    { model: 'Chihiros WRGB II 120', category: '130W', watt: 130, lumen: 7700, recommendedVolume: '120-140 cm', dimensions: '120 x 14 x 2 cm', priceRange: '€380 – €420', minPrice: 380 },
    { model: 'Twinstar 1200EA IV', category: '80W', watt: 80, lumen: 4800, recommendedVolume: '120 cm', dimensions: '120 x 12 x 2 cm', priceRange: '€280 – €320', minPrice: 280 },
    { model: 'Fluval Plant 3.0 (115cm)', category: '59W', watt: 59, lumen: 4250, recommendedVolume: '115-145 cm', dimensions: '115 x 8 x 2 cm', priceRange: '€220 – €250', minPrice: 220 },
    { model: 'Juwell HeliaLux Spectrum 1200', category: '60W', watt: 60, lumen: 6500, recommendedVolume: '120 cm (Rio 240/350)', dimensions: '119 x 14 cm', priceRange: '€240 – €270', minPrice: 240 },
    { model: 'JBL LED Solar Nature 57W', category: '57W', watt: 57, lumen: 5400, recommendedVolume: '110-140 cm', dimensions: '105 x 7 x 2 cm', priceRange: '€220 – €250', minPrice: 220 },
    { model: 'Eheim LEDcontrol+ (Set)', category: 'Var.', watt: 50, lumen: 4500, recommendedVolume: '110-130 cm', dimensions: '114 cm (barra)', priceRange: '€180 – €230', minPrice: 180 },
    { model: 'Week Aqua P Series 1200', category: '120W', watt: 120, lumen: 8000, recommendedVolume: '120 cm', dimensions: '120 x 16 cm', priceRange: '€300 – €350', minPrice: 300 },
  ],
  'premium': [ // Faretti e Sistemi a Sospensione
    { model: 'Kessil A360WE Tuna Sun', category: '90W', watt: 90, lumen: 6000, type: 'Faretto', recommendedVolume: 'Spettro regolabile', priceRange: '€450 – €490', minPrice: 450 },
    { model: 'Kessil A160WE Tuna Sun', category: '40W', watt: 40, lumen: 2500, type: 'Faretto', recommendedVolume: 'Per cubi 40-50 cm', priceRange: '€280 – €310', minPrice: 280 },
    { model: 'ADA Solar RGB', category: '130W', watt: 130, lumen: 3500, type: 'Sospensione', recommendedVolume: 'Top gamma mondiale', priceRange: '€700 – €850', minPrice: 700 },
    { model: 'Chihiros Vivid II', category: '130W', watt: 130, lumen: 5500, type: 'Sospensione', recommendedVolume: 'Bluetooth integrato', priceRange: '€350 – €400', minPrice: 350 },
    { model: 'Skylight Hyperspot L', category: '96W', watt: 96, lumen: 9000, type: 'Sospensione', recommendedVolume: 'Design cinematografico', priceRange: '€380 – €430', minPrice: 380 },
    { model: 'Zetlight Lancia 2 Fresh', category: '44W', watt: 44, lumen: 3200, type: 'Barra/Sosp.', recommendedVolume: 'WiFi integrato', priceRange: '€140 – €170', minPrice: 140 },
    { model: 'AmTra X-Flux', category: '18W', watt: 18, lumen: 1500, type: 'Barra LED', recommendedVolume: 'Sostituisce i T5/T8', priceRange: '€45 – €60', minPrice: 45 },
  ]
};

export const HARDSCAPE_SUGGESTIONS: Record<string, Suggestion[]> = {
  'substrates': [
    { model: 'ADA Amazonia Ver.2 (9L)', category: 'Fondo All-in-one', recommendedVolume: 'Top per piante', priceRange: '€45 – €52', minPrice: 45 },
    { model: 'Tropica Aquarium Soil (9L)', category: 'Fondo All-in-one', recommendedVolume: 'Granulometria perfetta', priceRange: '€35 – €40', minPrice: 35 },
    { model: 'JBL Manado (10L)', category: 'Argilla naturale', recommendedVolume: 'Porosa', priceRange: '€15 – €18', minPrice: 15 },
    { model: 'Seachem Flourite Black (7kg)', category: 'Fondale ferroso', recommendedVolume: 'Eterno', priceRange: '€30 – €35', minPrice: 30 },
    { model: 'Sabbia Ambra Fine Amtra (5kg)', category: 'Sabbia', recommendedVolume: 'Pesci da fondo', priceRange: '€8 – €12', minPrice: 8 },
    { model: 'Ghiaino di Quarzo Nero (5kg)', category: 'Ghiaino', recommendedVolume: 'Inerte', priceRange: '€10 – €14', minPrice: 10 },
    { model: 'Dennerle Nano Shrimp Gravel (2kg)', category: 'Ghiaino', recommendedVolume: 'Caridine', priceRange: '€8 – €10', minPrice: 8 },
    { model: 'JBL Sansibar White (5kg)', category: 'Sabbia', recommendedVolume: 'Bianchissima', priceRange: '€12 – €15', minPrice: 12 },
    { model: 'Substrato Fertile Sera Floredepot (4,7kg)', category: 'Substrato fertile', recommendedVolume: 'Sotto ghiaino', priceRange: '€18 – €22', minPrice: 18 },
    { model: 'Tropica Substrate (2,5L)', category: 'Substrato concentrato', recommendedVolume: 'Radici forti', priceRange: '€14 – €18', minPrice: 14 },
  ],
  'woods': [
    { model: 'Radice Red Moor (M)', category: 'Legno', recommendedVolume: '20-30cm', priceRange: '€15 – €25', minPrice: 15 },
    { model: 'Legno di Mangrovia (M)', category: 'Legno', recommendedVolume: '25-40cm', priceRange: '€12 – €20', minPrice: 12 },
    { model: 'Radice Mopani (S/M)', category: 'Legno', recommendedVolume: 'Bicolore', priceRange: '€10 – €18', minPrice: 10 },
    { model: 'Spider Wood (L)', category: 'Legno', recommendedVolume: '30-50cm', priceRange: '€25 – €40', minPrice: 25 },
    { model: 'Legno Bonsai Artigianale (20cm)', category: 'Legno', recommendedVolume: 'Sagomato', priceRange: '€35 – €55', minPrice: 35 },
    { model: 'Dark Iron Wood (M)', category: 'Legno', recommendedVolume: 'Affonda subito', priceRange: '€18 – €28', minPrice: 18 },
    { model: 'Corteccia di Sughero', category: 'Legno', recommendedVolume: 'Zone emerse', priceRange: '€8 – €15', minPrice: 8 },
    { model: 'Talawa Wood (XL)', category: 'Legno', recommendedVolume: 'Acquari alti', priceRange: '€30 – €50', minPrice: 30 },
    { model: 'Opuwa Wood (M)', category: 'Legno', recommendedVolume: 'Rugoso', priceRange: '€15 – €22', minPrice: 15 },
    { model: 'Radice di Azalea (S)', category: 'Legno', recommendedVolume: 'Nano-tank', priceRange: '€12 – €18', minPrice: 12 },
  ],
  'rocks': [
    { model: 'Seiryu Stone (Set 10kg)', category: 'Roccia', recommendedVolume: 'Grigia classica', priceRange: '€40 – €50', minPrice: 40 },
    { model: 'Dragon Stone / Ohko (Set 5kg)', category: 'Roccia', recommendedVolume: 'Bucherellata', priceRange: '€25 – €35', minPrice: 25 },
    { model: 'Pietra Lavica Nera/Rossa (kg)', category: 'Roccia', recommendedVolume: 'Porosa', priceRange: '€3 – €5', minPrice: 3 },
    { model: 'Roccia Ardesia (kg)', category: 'Roccia', recommendedVolume: 'Grotte', priceRange: '€4 – €6', minPrice: 4 },
    { model: 'Maple Leaf Rock (kg)', category: 'Roccia', recommendedVolume: 'Stratificata', priceRange: '€6 – €8', minPrice: 6 },
    { model: 'Ancient Stone (Set 10kg)', category: 'Roccia', recommendedVolume: 'Scura', priceRange: '€45 – €55', minPrice: 45 },
    { model: 'Elephant Skin Stone (kg)', category: 'Roccia', recommendedVolume: 'Rugosa', priceRange: '€7 – €9', minPrice: 7 },
    { model: 'Roccia Pagoda (kg)', category: 'Roccia', recommendedVolume: 'Montagne', priceRange: '€6 – €8', minPrice: 6 },
    { model: 'Wood Fossil (kg)', category: 'Roccia', recommendedVolume: 'Legno pietrificato', priceRange: '€5 – €7', minPrice: 5 },
    { model: 'Sassi di fiume levigati (2kg)', category: 'Roccia', recommendedVolume: 'Goldfish', priceRange: '€8 – €12', minPrice: 8 },
  ]
};
