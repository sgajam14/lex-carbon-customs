import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userApi } from '../utils/api';

const GarageContext = createContext(null);

export const GarageProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [activeVehicle, setActiveVehicle] = useState(null);

  useEffect(() => {
    if (user?.garage?.length) {
      const primary = user.garage.find(v => v.isPrimary) || user.garage[0];
      setActiveVehicle(primary);
    } else {
      setActiveVehicle(null);
    }
  }, [user]);

  const garage = user?.garage || [];

  const addVehicle = async (vehicleData) => {
    const { data } = await userApi.addToGarage(vehicleData);
    updateUser({ ...user, garage: data.garage });
    return data.garage;
  };

  const removeVehicle = async (vehicleId) => {
    const { data } = await userApi.removeFromGarage(vehicleId);
    updateUser({ ...user, garage: data.garage });
  };

  const setPrimary = async (vehicleId) => {
    const { data } = await userApi.setPrimary(vehicleId);
    updateUser({ ...user, garage: data.garage });
  };

  return (
    <GarageContext.Provider value={{ garage, activeVehicle, setActiveVehicle, addVehicle, removeVehicle, setPrimary }}>
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useGarage must be used within GarageProvider');
  return ctx;
};
