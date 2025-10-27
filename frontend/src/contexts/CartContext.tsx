
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type Product = {
  id: string;
  name: string;
  category: 'incense' | 'ghee';
  price: number;
  image: string;
  description: string;
  weight?: string;
  fragrance?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user, isAuthenticated } = useAuth();

 
  useEffect(() => {
    const load = async () => {
     
      const savedCart = localStorage.getItem('sawatsya-cart');
      if (savedCart) setItems(JSON.parse(savedCart));
    };
    load();
  }, [isAuthenticated, user?.id]);

 
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('sawatsya-cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('sawatsya-cart');
    }
    
   
    setTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
    setTotalPrice(items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0));
  }, [items]);

 
  const addToCart = (product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { product, quantity }];
    });
   
  };

 
  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
   
    if (items.length === 1) {
      localStorage.removeItem('sawatsya-cart');
    }
   
  };

 
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
   
  };

 
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('sawatsya-cart');
   
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
