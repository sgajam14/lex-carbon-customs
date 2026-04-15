import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lcc_cart')) || []; } catch { return []; }
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    localStorage.setItem('lcc_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, fitment = null) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i);
      }
      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
      return [...prev, { ...product, qty, fitment, cartPrice: price }];
    });
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i._id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i => i._id === productId ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.cartPrice * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      subtotal, count, selectedVehicle, setSelectedVehicle,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
