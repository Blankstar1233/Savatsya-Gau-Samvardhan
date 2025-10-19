import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './CartContext';

export interface WishlistItem {
  product: Product;
  addedAt: Date;
  priceAtAddition: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  price: number;
  date: Date;
}

type WishlistContextType = {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  getItemCount: () => number;
  getPriceDropItems: () => WishlistItem[];
  getRecentlyAdded: (days?: number) => WishlistItem[];
  exportWishlist: () => string;
  importWishlist: (data: string) => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsed: WishlistItem[] = JSON.parse(savedWishlist);
       
        const converted: WishlistItem[] = parsed.map((item) => ({
          ...item,
          addedAt: new Date(item.addedAt),
          priceHistory: item.priceHistory.map((point) => ({
            ...point,
            date: new Date(point.date)
          }))
        }));
        setItems(converted);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.product.id === productId);
  };

  const addToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      const newItem: WishlistItem = {
        product,
        addedAt: new Date(),
        priceAtAddition: product.price,
        priceHistory: [{
          price: product.price,
          date: new Date()
        }]
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const getItemCount = (): number => {
    return items.length;
  };

  const getPriceDropItems = (): WishlistItem[] => {
    return items.filter(item => {
      const currentPrice = item.product.price;
      const originalPrice = item.priceAtAddition;
      return currentPrice < originalPrice;
    });
  };

  const getRecentlyAdded = (days: number = 7): WishlistItem[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return items.filter(item => item.addedAt >= cutoffDate)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  };

  const exportWishlist = (): string => {
    return JSON.stringify(items, null, 2);
  };

  const importWishlist = (data: string) => {
    try {
      const parsed: WishlistItem[] = JSON.parse(data);
      const converted: WishlistItem[] = parsed.map((item) => ({
        ...item,
        addedAt: new Date(item.addedAt),
        priceHistory: item.priceHistory.map((point) => ({
          ...point,
          date: new Date(point.date)
        }))
      }));
      setItems(converted);
    } catch (error) {
      throw new Error('Invalid wishlist data format');
    }
  };

  return (
    <WishlistContext.Provider value={{
      items,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      getItemCount,
      getPriceDropItems,
      getRecentlyAdded,
      exportWishlist,
      importWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
