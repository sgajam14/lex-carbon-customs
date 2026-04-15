const User = require('../models/User');

exports.addToGarage = async (req, res) => {
  try {
    const { make, model, year, trim, nickname, vin, color } = req.body;
    const user = await User.findById(req.user._id);
    if (user.garage.length >= 10) return res.status(400).json({ success: false, message: 'Garage limit reached (10 vehicles)' });
    if (user.garage.length === 0) req.body.isPrimary = true;
    user.garage.push({ make, model, year, trim, nickname, vin, color, isPrimary: user.garage.length === 0 });
    await user.save();
    res.json({ success: true, garage: user.garage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.removeFromGarage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.garage = user.garage.filter(v => v._id.toString() !== req.params.vehicleId);
    if (user.garage.length > 0 && !user.garage.some(v => v.isPrimary)) {
      user.garage[0].isPrimary = true;
    }
    await user.save();
    res.json({ success: true, garage: user.garage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.setPrimaryVehicle = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.garage.forEach(v => { v.isPrimary = v._id.toString() === req.params.vehicleId; });
    await user.save();
    res.json({ success: true, garage: user.garage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.removeAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};
