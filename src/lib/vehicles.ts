export interface VehicleMake {
  name: string;
  models: string[];
}

export const VEHICLE_CATALOG: VehicleMake[] = [
  // GM Brands
  {
    name: 'Chevrolet',
    models: ['Trax', 'Trailblazer', 'Equinox', 'Equinox EV', 'Blazer EV', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Silverado 1500', 'Silverado HD', 'Silverado EV', 'Corvette', 'Malibu'],
  },
  {
    name: 'Buick',
    models: ['Envista', 'Encore GX', 'Envision', 'Enclave'],
  },
  {
    name: 'GMC',
    models: ['Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Canyon', 'Sierra 1500', 'Sierra HD', 'Sierra EV', 'HUMMER EV Pickup', 'HUMMER EV SUV'],
  },
  {
    name: 'Cadillac',
    models: ['CT4', 'CT5', 'CT5-V', 'XT4', 'XT5', 'XT6', 'Escalade', 'Escalade IQ', 'OPTIQ', 'LYRIQ', 'VISTIQ', 'CELESTIQ'],
  },
  // Toyota / Lexus
  {
    name: 'Toyota',
    models: ['Corolla', 'Camry', 'Camry Hybrid', 'Avalon', 'Prius', 'Prius Prime', 'GR Corolla', 'GR86', 'Supra', 'RAV4', 'RAV4 Hybrid', 'RAV4 Prime', 'Highlander', 'Highlander Hybrid', '4Runner', 'Sequoia', 'Land Cruiser', 'Venza', 'bZ4X', 'Sienna', 'Tacoma', 'Tundra', 'Crown'],
  },
  {
    name: 'Lexus',
    models: ['IS', 'ES', 'LS', 'UX', 'UX Hybrid', 'NX', 'NX Hybrid', 'RX', 'RX Hybrid', 'RX Plug-in', 'TX', 'TX Hybrid', 'GX', 'LX', 'RC', 'LC', 'LC Hybrid', 'RZ'],
  },
  // Honda / Acura
  {
    name: 'Honda',
    models: ['Civic', 'Civic Hatchback', 'Civic Type R', 'Accord', 'Accord Hybrid', 'HR-V', 'CR-V', 'CR-V Hybrid', 'Pilot', 'Passport', 'Prologue', 'Odyssey', 'Ridgeline'],
  },
  {
    name: 'Acura',
    models: ['Integra', 'Integra Type S', 'TLX', 'RDX', 'MDX', 'MDX Type S', 'ZDX'],
  },
  // Ford / Lincoln
  {
    name: 'Ford',
    models: ['Mustang', 'Mustang Mach-E', 'Bronco', 'Bronco Sport', 'Escape', 'Escape Hybrid', 'Explorer', 'Explorer Hybrid', 'Edge', 'Expedition', 'F-150', 'F-150 Lightning', 'Super Duty', 'Ranger', ' Maverick', 'Maverick Hybrid', 'Transit'],
  },
  {
    name: 'Lincoln',
    models: ['Aviator', 'Aviator Hybrid', 'Corsair', 'Corsair Hybrid', 'Nautilus', 'Nautilus Hybrid', 'Navigator', 'Zephyr'],
  },
  // Nissan / Infiniti
  {
    name: 'Nissan',
    models: ['Sentra', 'Altima', 'Maxima', 'Versa', 'Leaf', 'Ariya', 'Kicks', 'Rogue', 'Rogue Sport', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Z'],
  },
  {
    name: 'Infiniti',
    models: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  },
  // Hyundai / Kia / Genesis
  {
    name: 'Hyundai',
    models: ['Elantra', 'Elantra Hybrid', 'Sonata', 'Sonata Hybrid', 'Kona', 'Kona Electric', 'Tucson', 'Tucson Hybrid', 'Santa Fe', 'Santa Fe Hybrid', 'Palisade', 'Ioniq 5', 'Ioniq 6', 'Venue', 'Crown'],
  },
  {
    name: 'Kia',
    models: ['Forte', 'K5', 'Stinger', 'Soul', 'Seltos', 'Sportage', 'Sportage Hybrid', 'Sorento', 'Sorento Hybrid', 'Telluride', 'Carnival', 'Niro EV', 'Niro Hybrid', 'EV6', 'EV9', 'Rio'],
  },
  {
    name: 'Genesis',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV70 EV', 'GV80', 'GV80 Coupe', 'GV60', 'Electrified G80'],
  },
  // Mazda / Subaru / Mitsubishi
  {
    name: 'Mazda',
    models: ['Mazda3', 'Mazda3 Hatchback', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-70', 'CX-90', 'MX-5 Miata'],
  },
  {
    name: 'Subaru',
    models: ['Impreza', 'Legacy', 'WRX', 'Crosstrek', 'Crosstrek Hybrid', 'Forester', 'Outback', 'Solterra', 'Ascent', 'BRZ'],
  },
  {
    name: 'Mitsubishi',
    models: ['Mirage', 'Mirage G4', 'Outlander', 'Outlander PHEV', 'Eclipse Cross'],
  },
  // Stellantis: Jeep / Ram / Dodge / Chrysler
  {
    name: 'Jeep',
    models: ['Compass', 'Cherokee', 'Grand Cherokee', 'Grand Cherokee L', 'Wrangler', 'Wrangler 4xe', 'Gladiator', 'Renegade', 'Wagoneer', 'Grand Wagoneer', 'Avenger'],
  },
  {
    name: 'Ram',
    models: ['1500', '1500 Classic', '2500', '3500', 'Promaster', 'Promaster City'],
  },
  {
    name: 'Dodge',
    models: ['Charger', 'Charger Daytona', 'Durango', 'Hornet', 'Hornet R/T', 'Challenger'],
  },
  {
    name: 'Chrysler',
    models: ['300', 'Pacifica', 'Pacifica Hybrid', 'Voyager'],
  },
  // BMW / Mercedes / Audi / VW / Porsche
  {
    name: 'BMW',
    models: ['2 Series', '2 Series Gran Coupe', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X5 Hybrid', 'X6', 'X7', 'XM', 'i4', 'i5', 'i7', 'iX', 'Z4', 'M2', 'M3', 'M4', 'M5', 'M8', 'X3 M', 'X4 M', 'X5 M', 'X6 M'],
  },
  {
    name: 'Mercedes-Benz',
    models: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLE', 'CLS', 'GLA', 'GLB', 'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLS', 'G-Class', 'EQB', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'Metris', 'AMG GT', 'SL'],
  },
  {
    name: 'Audi',
    models: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q4 e-tron', 'Q5', 'Q5 Sportback', 'Q7', 'Q8', 'Q8 e-tron', 'RS 5', 'RS 6', 'RS 7', 'RS Q8', 'R8', 'TT', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8'],
  },
  {
    name: 'Volkswagen',
    models: ['Jetta', 'Jetta GLI', 'Passat', 'Arteon', 'Golf', 'Golf GTI', 'Golf R', 'Taos', 'Tiguan', 'Atlas', 'Atlas Cross Sport', 'ID.4', 'Beetle'],
  },
  {
    name: 'Porsche',
    models: ['911', '718 Cayman', '718 Boxster', 'Taycan', 'Panamera', 'Macan', 'Macan EV', 'Cayenne', 'Cayenne Coupe'],
  },
  // Volvo / MINI / Land Rover / Jaguar
  {
    name: 'Volvo',
    models: ['S60', 'S90', 'V60', 'V60 Cross Country', 'V90 Cross Country', 'XC40', 'XC40 Recharge', 'XC60', 'XC60 Recharge', 'XC90', 'XC90 Recharge', 'EX30', 'EX90', 'C40 Recharge'],
  },
  {
    name: 'MINI',
    models: ['Hardtop 2 Door', 'Hardtop 4 Door', 'Convertible', 'Clubman', 'Countryman', 'Countryman SE', 'Aceman'],
  },
  {
    name: 'Land Rover',
    models: ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport', 'Defender'],
  },
  {
    name: 'Jaguar',
    models: ['XE', 'XF', 'XJ', 'E-PACE', 'F-PACE', 'I-PACE', 'F-TYPE'],
  },
  // Tesla / Rivian / Lucid
  {
    name: 'Tesla',
    models: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  },
  {
    name: 'Rivian',
    models: ['R1T', 'R1S', 'R2', 'R3', 'EDV'],
  },
  {
    name: 'Lucid',
    models: ['Air', 'Gravity'],
  },
];

export const ALL_MAKES: string[] = VEHICLE_CATALOG.map((m) => m.name);

export function getModelsForMake(make: string): string[] {
  const entry = VEHICLE_CATALOG.find((m) => m.name === make);
  return entry ? entry.models : [];
}

export function getMakeModelString(make: string, model: string): string {
  return `${make} ${model}`;
}

export function parseMakeModel(vehicleInterest: string): { make: string; model: string } | null {
  if (!vehicleInterest || vehicleInterest === 'Not sure yet') return null;
  for (const entry of VEHICLE_CATALOG) {
    if (vehicleInterest.startsWith(entry.name + ' ')) {
      return { make: entry.name, model: vehicleInterest.slice(entry.name.length + 1) };
    }
  }
  return null;
}

export const NOT_SURE_YET = 'Not sure yet';

export const DEFAULT_BRANDS = ['Chevrolet', 'Buick', 'GMC', 'Cadillac'];

export function parseBrands(brandsString: string | null | undefined): string[] {
  if (!brandsString) return DEFAULT_BRANDS;
  const parsed = brandsString.split(',').map((b) => b.trim()).filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_BRANDS;
}

export function serializeBrands(brands: string[]): string {
  return brands.join(',');
}
