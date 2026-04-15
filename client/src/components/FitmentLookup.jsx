import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Search, QrCode, ChevronDown, Loader } from 'lucide-react';
import { vehicleApi } from '../utils/api';
import { useGarage } from '../context/GarageContext';

export default function FitmentLookup({ onFitmentSelect, compact = false }) {
  const [mode, setMode] = useState('manual'); // manual | vin
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { activeVehicle } = useGarage();

  useEffect(() => {
    vehicleApi.getYears().then(({ data }) => setYears(data.years || []));
    vehicleApi.getMakes().then(({ data }) => setMakes((data.makes || []).slice(0, 100)));
  }, []);

  useEffect(() => {
    if (make) {
      setModel('');
      setLoading(true);
      vehicleApi.getModels(make, year || undefined)
        .then(({ data }) => setModels(data.models || []))
        .catch(() => setModels([]))
        .finally(() => setLoading(false));
    }
  }, [make, year]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!make || !model || !year) { setError('Please select make, model, and year.'); return; }
    const fitment = { make, model, year: parseInt(year) };
    if (onFitmentSelect) { onFitmentSelect(fitment); return; }
    navigate(`/shop?make=${make}&model=${model}&year=${year}`);
  };

  const handleVinLookup = async (e) => {
    e.preventDefault();
    if (!vin) return;
    setVinLoading(true);
    setError('');
    try {
      const { data } = await vehicleApi.vinLookup(vin);
      const v = data.vehicle;
      setMake(v.make);
      setYear(String(v.year));
      setMode('manual');
      // load models
      const { data: mData } = await vehicleApi.getModels(v.make, v.year);
      setModels(mData.models || []);
      setModel(v.model);
    } catch (err) {
      setError(err.response?.data?.message || 'VIN lookup failed');
    } finally {
      setVinLoading(false);
    }
  };

  return (
    <div className={`dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
      {!compact && (
        <div className="flex items-center gap-2 mb-5">
          <Car className="text-brand-red" size={20} />
          <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900 tracking-wide uppercase">Find Parts For Your Car</h3>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 dark:bg-dark-surface-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 text-xs font-heading font-semibold tracking-wider uppercase py-2 rounded-md transition-all ${
            mode === 'manual' ? 'bg-brand-red text-white' : 'dark:text-gray-400 text-gray-500'
          }`}
        >
          Year/Make/Model
        </button>
        <button
          onClick={() => setMode('vin')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-heading font-semibold tracking-wider uppercase py-2 rounded-md transition-all ${
            mode === 'vin' ? 'bg-brand-red text-white' : 'dark:text-gray-400 text-gray-500'
          }`}
        >
          <QrCode size={12} /> VIN Lookup
        </button>
      </div>

      {mode === 'vin' ? (
        <form onSubmit={handleVinLookup} className="space-y-3">
          <input
            type="text"
            value={vin}
            onChange={e => setVin(e.target.value.toUpperCase())}
            placeholder="Enter 17-character VIN"
            maxLength={17}
            className="input-dark font-mono tracking-widest text-sm"
          />
          <button
            type="submit"
            disabled={vinLoading || vin.length !== 17}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {vinLoading ? <Loader size={14} className="animate-spin" /> : <QrCode size={14} />}
            Decode VIN
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className={compact ? 'flex gap-2 flex-wrap' : 'space-y-3'}>
          {/* Year */}
          <div className={`relative ${compact ? 'flex-1 min-w-[90px]' : ''}`}>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="input-dark appearance-none pr-8"
            >
              <option value="">Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Make */}
          <div className={`relative ${compact ? 'flex-1 min-w-[120px]' : ''}`}>
            <select
              value={make}
              onChange={e => setMake(e.target.value)}
              className="input-dark appearance-none pr-8"
            >
              <option value="">Make</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Model */}
          <div className={`relative ${compact ? 'flex-1 min-w-[120px]' : ''}`}>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              disabled={!make || loading}
              className="input-dark appearance-none pr-8 disabled:opacity-50"
            >
              <option value="">Model</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={!make || !model || !year}
            className={`btn-primary flex items-center justify-center gap-2 disabled:opacity-50 ${compact ? 'px-4' : 'w-full'}`}
          >
            <Search size={14} /> Find Parts
          </button>
        </form>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {activeVehicle && !compact && (
        <div className="mt-4 pt-4 border-t dark:border-dark-border border-light-border">
          <p className="text-xs dark:text-gray-500 text-gray-400 mb-2 font-heading uppercase tracking-wider">My Garage</p>
          <button
            onClick={() => {
              setMake(activeVehicle.make);
              setModel(activeVehicle.model);
              setYear(String(activeVehicle.year));
            }}
            className="flex items-center gap-2 text-sm dark:text-gray-300 text-gray-600 hover:text-brand-red transition-colors"
          >
            <Car size={14} className="text-brand-red" />
            {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
            {activeVehicle.nickname && ` — ${activeVehicle.nickname}`}
          </button>
        </div>
      )}
    </div>
  );
}
