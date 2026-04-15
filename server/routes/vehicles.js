const router = require('express').Router();
const axios = require('axios');

const NHTSA = 'https://vpic.nhtsa.dot.gov/api/vehicles';

router.get('/makes', async (req, res) => {
  try {
    const { data } = await axios.get(`${NHTSA}/GetAllMakes?format=json`);
    const makes = data.Results.map(m => m.Make_Name).sort();
    res.json({ success: true, makes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch makes' });
  }
});

router.get('/models', async (req, res) => {
  try {
    const { make, year } = req.query;
    const url = year
      ? `${NHTSA}/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`
      : `${NHTSA}/GetModelsForMake/${make}?format=json`;
    const { data } = await axios.get(url);
    const models = [...new Set(data.Results.map(m => m.Model_Name))].sort();
    res.json({ success: true, models });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch models' });
  }
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
    res.json({
      success: true,
      vehicle: {
        make: result.Make,
        model: result.Model,
        year: parseInt(result.ModelYear),
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
