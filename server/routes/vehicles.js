const router = require('express').Router();
const axios = require('axios');
const vehicleData = require('../data/vehicleData');

const NHTSA = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const curatedMakes = Object.keys(vehicleData).sort((a, b) => a.localeCompare(b));

const normalizeLabel = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const makeLookup = new Map(curatedMakes.map((make) => [normalizeLabel(make), make]));

const resolveMakeName = (make = '') => makeLookup.get(normalizeLabel(make.trim())) || null;
const resolveModelName = (make, model = '') => {
  if (!make || !vehicleData[make]) return model;
  const normalizedModel = normalizeLabel(model);
  const match = vehicleData[make].find((item) => normalizeLabel(item) === normalizedModel);
  return match || model;
};

router.get('/makes', (req, res) => {
  res.json({ success: true, makes: curatedMakes });
});

router.get('/models', (req, res) => {
  const { make } = req.query;
  if (!make) return res.status(400).json({ success: false, message: 'Make is required' });

  const resolvedMake = resolveMakeName(make);
  if (!resolvedMake) return res.json({ success: true, models: [] });

  const models = [...vehicleData[resolvedMake]].sort((a, b) => a.localeCompare(b));
  res.json({ success: true, models });
});

router.get('/years', async (req, res) => {
  const currentYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);
  res.json({ success: true, years });
});

router.post('/vin', async (req, res) => {
  try {
    const { vin } = req.body;
    if (!vin || vin.length !== 17) return res.status(400).json({ success: false, message: 'Invalid VIN (must be 17 characters)' });
    const { data } = await axios.get(`${NHTSA}/DecodeVinValues/${vin}?format=json`);
    const result = data.Results[0];
    if (result.ErrorCode !== '0') return res.status(400).json({ success: false, message: 'VIN could not be decoded' });

    const canonicalMake = resolveMakeName(result.Make);
    const resolvedMake = canonicalMake || result.Make;
    const resolvedModel = resolveModelName(canonicalMake, result.Model);
    const parsedYear = parseInt(result.ModelYear, 10);

    res.json({
      success: true,
      vehicle: {
        make: resolvedMake,
        model: resolvedModel,
        year: Number.isNaN(parsedYear) ? null : parsedYear,
        trim: result.Trim,
        bodyStyle: result.BodyClass,
        engineDisplacement: result.DisplacementL,
        cylinders: result.EngineCylinders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'VIN lookup failed' });
  }
});

module.exports = router;
