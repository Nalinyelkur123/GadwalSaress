import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  appliedCoupon: { code: string; discount: number; message: string } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);

  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/cart');
      setItems(res.data.items || []);
      setSubtotal(res.data.subtotal || 0);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setIsLoading(true);
      const res = await api.post('/cart/add', { productId, quantity });
      setItems(res.data.items || []);
      setSubtotal(res.data.subtotal || 0);
      setIsCartDrawerOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not add to cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.put('/cart/update', { itemId, quantity });
      setItems(res.data.items || []);
      setSubtotal(res.data.subtotal || 0);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update quantity.');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await api.delete(`/cart/remove/${itemId}`);
      setItems(res.data.items || []);
      setSubtotal(res.data.subtotal || 0);
    } catch (err: any) {
      console.error(err);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.post('/cart/apply-coupon', { code, subtotal });
      const { coupon_code, discount_amount, message } = res.data;
      setAppliedCoupon({ code: coupon_code, discount: discount_amount, message });
      return { success: true, message };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to apply coupon.';
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      isLoading,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
