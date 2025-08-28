
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

// Define product type
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

// Define cart item type
export type CartItem = {
  product: Product;
  quantity: number;
};

// Define cart context type
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

  // Load cart from localStorage on component mount
  useEffect(() => {
    const load = async () => {
      if (isAuthenticated && user) {
        const { data } = await supabase
          .from('cart_items')
          .select('product, quantity')
          .eq('user_id', user.id);
        if (data) {
          setItems(data.map((row: any) => ({ product: row.product as Product, quantity: row.quantity })));
          return;
        }
      }
      const savedCart = localStorage.getItem('sawatsya-cart');
      if (savedCart) setItems(JSON.parse(savedCart));
    };
    load();
  }, [isAuthenticated, user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('sawatsya-cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('sawatsya-cart');
    }
    
    // Calculate totals
    setTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
    setTotalPrice(items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0));
  }, [items]);

  // Add product to cart
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
    if (isAuthenticated && user) {
      supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: product.id,
        product,
        quantity
      }).then(() => {});
    }
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
    // Remove from localStorage if cart becomes empty
    if (items.length === 1) {
      localStorage.removeItem('sawatsya-cart');
    }
    if (isAuthenticated && user) {
      supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId).then(() => {});
    }
  };

  // Update quantity of product in cart
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
    if (isAuthenticated && user) {
      supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', productId).then(() => {});
    }
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('sawatsya-cart');
    if (isAuthenticated && user) {
      supabase.from('cart_items').delete().eq('user_id', user.id).then(() => {});
    }
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
