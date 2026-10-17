import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/customer/wishlist');
      const items: Product[] = res.data || [];
      setWishlist(items);
      setWishlistIds(new Set(items.map(p => p.id)));
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.has(productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      // Guest local fallback
      const newIds = new Set(wishlistIds);
      let inWishlist = false;
      if (newIds.has(productId)) {
        newIds.delete(productId);
      } else {
        newIds.add(productId);
        inWishlist = true;
      }
      setWishlistIds(newIds);
      return inWishlist;
    }

    try {
      const res = await api.post('/customer/wishlist/toggle', { productId });
      await refreshWishlist();
      return !!res.data.inWishlist;
    } catch (err: any) {
      console.error('Failed to toggle wishlist:', err);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      const newIds = new Set(wishlistIds);
      newIds.delete(productId);
      setWishlistIds(newIds);
      setWishlist(wishlist.filter(p => p.id !== productId));
      return;
    }

    try {
      await api.delete(`/customer/wishlist/${productId}`);
      setWishlist(wishlist.filter(p => p.id !== productId));
      const newIds = new Set(wishlistIds);
      newIds.delete(productId);
      setWishlistIds(newIds);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        isLoading,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
