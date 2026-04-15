/**
 * Curated vehicle makes and models — similar to CarMax / CarGurus catalog.
 * Covers major brands sold in the US market, ~2000–present.
 */

const vehicleData = {
  'Acura': [
    'ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'RLX', 'TL', 'TLX', 'TSX', 'ZDX',
  ],
  'Alfa Romeo': [
    '4C', '4C Spider', 'Brera', 'Giulia', 'GTV', 'Spider', 'Stelvio', 'Tonale',
  ],
  'Aston Martin': [
    'DB9', 'DB11', 'DBS', 'DBS Superleggera', 'DBX', 'Rapide', 'Vanquish', 'Vantage',
  ],
  'Audi': [
    'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'e-tron GT', 'e-tron S',
    'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'R8', 'RS3', 'RS4', 'RS5',
    'RS6', 'RS7', 'RS e-tron GT', 'RS Q8', 'S3', 'S4', 'S5', 'S6',
    'S7', 'S8', 'SQ5', 'SQ7', 'SQ8', 'TT', 'TT RS', 'TTS',
  ],
  'Bentley': [
    'Bentayga', 'Continental GT', 'Continental GT Speed', 'Continental GTC',
    'Flying Spur', 'Mulsanne',
  ],
  'BMW': [
    '1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series',
    '7 Series', '8 Series', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX',
    'M2', 'M3', 'M4', 'M5', 'M6', 'M8',
    'X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7',
    'Z3', 'Z4',
  ],
  'Buick': [
    'Enclave', 'Encore', 'Encore GX', 'Envision', 'LaCrosse', 'Regal', 'Verano',
  ],
  'Cadillac': [
    'ATS', 'ATS-V', 'CT4', 'CT4-V', 'CT5', 'CT5-V', 'CT6', 'CTS', 'CTS-V',
    'Escalade', 'Escalade ESV', 'Lyriq', 'SRX', 'STS', 'XT4', 'XT5', 'XT6',
  ],
  'Chevrolet': [
    'Blazer', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Express',
    'Impala', 'Malibu', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD',
    'Sonic', 'Spark', 'SS', 'Suburban', 'Tahoe', 'Trailblazer', 'Trax', 'Traverse',
  ],
  'Chrysler': [
    '200', '300', '300C', 'Pacifica', 'Sebring', 'Town & Country', 'Voyager',
  ],
  'Dodge': [
    'Challenger', 'Charger', 'Dart', 'Durango', 'Journey', 'Viper',
  ],
  'Ferrari': [
    '296 GTB', '296 GTS', '488 GTB', '488 Pista', '488 Spider',
    '812 Competizione', '812 Superfast', 'F8 Spider', 'F8 Tributo',
    'GTC4Lusso', 'Portofino', 'Portofino M', 'Roma', 'SF90 Spider', 'SF90 Stradale',
  ],
  'FIAT': [
    '124 Spider', '500', '500 Abarth', '500L', '500X',
  ],
  'Ford': [
    'Bronco', 'Bronco Sport', 'EcoSport', 'Edge', 'Escape', 'Expedition',
    'Explorer', 'F-150', 'F-150 Lightning', 'F-250 Super Duty', 'F-350 Super Duty',
    'Fiesta', 'Focus', 'Fusion', 'GT', 'Maverick', 'Mustang', 'Mustang Mach-E',
    'Ranger', 'Taurus',
  ],
  'Genesis': [
    'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80',
  ],
  'GMC': [
    'Acadia', 'Canyon', 'Envoy', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD',
    'Terrain', 'Yukon', 'Yukon XL',
  ],
  'Honda': [
    'Accord', 'Civic', 'Civic Type R', 'Clarity', 'CR-V', 'CR-Z',
    'Element', 'Fit', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot',
    'Ridgeline', 'S2000',
  ],
  'Hyundai': [
    'Accent', 'Azera', 'Elantra', 'Elantra N', 'Genesis Coupe', 'Ioniq',
    'Ioniq 5', 'Ioniq 6', 'Kona', 'Kona N', 'Nexo', 'Palisade',
    'Santa Cruz', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster', 'Veloster N',
  ],
  'INFINITI': [
    'EX35', 'FX35', 'FX50', 'G35', 'G37', 'M35', 'M37', 'M56',
    'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX60', 'QX80',
  ],
  'Jaguar': [
    'E-Pace', 'F-Pace', 'F-Pace SVR', 'F-Type', 'I-Pace',
    'S-Type', 'X-Type', 'XE', 'XF', 'XJ', 'XK',
  ],
  'Jeep': [
    'Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee 4xe',
    'Grand Cherokee L', 'Grand Wagoneer', 'Liberty', 'Patriot',
    'Renegade', 'Wagoneer', 'Wrangler', 'Wrangler 4xe',
  ],
  'Kia': [
    'Cadenza', 'Carnival', 'EV6', 'Forte', 'K5', 'Niro', 'Niro EV',
    'Optima', 'Rio', 'Seltos', 'Soul', 'Sorento', 'Sportage', 'Stinger',
    'Telluride',
  ],
  'Lamborghini': [
    'Aventador', 'Aventador SVJ', 'Gallardo', 'Huracán', 'Huracán Evo',
    'Huracán STO', 'Urus',
  ],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Freelander',
    'LR2', 'LR4', 'Range Rover', 'Range Rover Evoque',
    'Range Rover Sport', 'Range Rover Velar',
  ],
  'Lexus': [
    'CT 200h', 'ES', 'GS', 'GS F', 'GX', 'IS', 'IS F', 'LC', 'LFA',
    'LS', 'LX', 'NX', 'RC', 'RC F', 'RX', 'RX L', 'SC', 'UX',
  ],
  'Lincoln': [
    'Aviator', 'Continental', 'Corsair', 'MKC', 'MKS', 'MKT',
    'MKX', 'MKZ', 'Nautilus', 'Navigator', 'Navigator L',
  ],
  'Lotus': [
    'Elise', 'Emira', 'Evija', 'Evora', 'Exige',
  ],
  'Lucid': [
    'Air', 'Air Grand Touring', 'Air Pure', 'Air Sapphire',
  ],
  'Maserati': [
    'Ghibli', 'GranSport', 'GranTurismo', 'GranTurismo Convertible',
    'Levante', 'MC20', 'Quattroporte',
  ],
  'Mazda': [
    'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'Mazda2', 'Mazda3',
    'Mazda6', 'MX-30', 'MX-5 Miata', 'RX-8',
  ],
  'McLaren': [
    '540C', '570GT', '570S', '600LT', '620R', '650S',
    '675LT', '720S', '750S', '765LT', 'Artura', 'GT',
    'MP4-12C', 'P1', 'Senna',
  ],
  'Mercedes-Benz': [
    'A-Class', 'AMG GT', 'AMG GT 4-Door', 'C-Class', 'CLA', 'CLS',
    'E-Class', 'EQB', 'EQC', 'EQE', 'EQS', 'G-Class', 'GLA', 'GLB',
    'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLS', 'S-Class',
    'SL', 'SLC', 'SLS AMG', 'Sprinter',
  ],
  'MINI': [
    'Clubman', 'Convertible', 'Cooper', 'Cooper S', 'Countryman',
    'Coupe', 'John Cooper Works', 'Paceman', 'Roadster',
  ],
  'Mitsubishi': [
    'Eclipse', 'Eclipse Cross', 'Galant', 'Lancer', 'Lancer Evolution',
    'Mirage', 'Outlander', 'Outlander Sport',
  ],
  'Nissan': [
    '370Z', '400Z', 'Altima', 'Armada', 'Frontier', 'GT-R',
    'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Quest',
    'Rogue', 'Rogue Sport', 'Sentra', 'Titan', 'Titan XD', 'Versa',
  ],
  'Polestar': [
    'Polestar 1', 'Polestar 2', 'Polestar 3', 'Polestar 4',
  ],
  'Porsche': [
    '718 Boxster', '718 Cayman', '718 Cayman GT4', '718 Spyder',
    '911', '911 Carrera', '911 GT3', '911 GT3 RS', '911 Targa', '911 Turbo',
    '944', 'Cayenne', 'Cayenne Coupe', 'Macan', 'Panamera', 'Taycan',
  ],
  'Ram': [
    '1500', '1500 Classic', '2500', '3500', 'ProMaster', 'ProMaster City',
  ],
  'Rivian': [
    'R1S', 'R1T',
  ],
  'Rolls-Royce': [
    'Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Spectre', 'Wraith',
  ],
  'Subaru': [
    'Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza',
    'Legacy', 'Outback', 'WRX', 'WRX STI',
  ],
  'Tesla': [
    'Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster',
  ],
  'Toyota': [
    '4Runner', '86', 'Avalon', 'C-HR', 'Camry', 'Corolla', 'Corolla Cross',
    'FJ Cruiser', 'GR Corolla', 'GR86', 'GR Supra', 'Highlander',
    'Land Cruiser', 'Mirai', 'Prius', 'Prius Prime', 'RAV4', 'RAV4 Prime',
    'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza',
  ],
  'Volkswagen': [
    'Arteon', 'Atlas', 'Atlas Cross Sport', 'CC', 'Golf', 'Golf GTI',
    'Golf R', 'ID.4', 'ID.Buzz', 'Jetta', 'Jetta GLI', 'Passat',
    'Taos', 'Tiguan', 'Touareg',
  ],
  'Volvo': [
    'C30', 'C40 Recharge', 'C70', 'S40', 'S60', 'S60 Recharge',
    'S80', 'S90', 'V40', 'V60', 'V60 Recharge', 'V70', 'V90', 'V90 Recharge',
    'XC40', 'XC40 Recharge', 'XC60', 'XC60 Recharge', 'XC70', 'XC90', 'XC90 Recharge',
  ],
};

module.exports = vehicleData;
