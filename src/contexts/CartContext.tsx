import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Cart, CartItem, MenuItem, CartItemOptions } from '@/lib/api';

interface CartContextType {
  cart: Cart;
  itemCount: number;
  addItem: (item: MenuItem, quantity?: number, options?: CartItemOptions) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
}

const defaultCart: Cart = {
  items: [],
  subtotal: 0,
  deliveryFee: 150, // Default delivery fee in KES
  discount: 0,
  total: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kuku_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultCart;
      }
    }
    return defaultCart;
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const calculateTotals = useCallback((items: CartItem[], discount = 0, promoCode?: string): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = items.length > 0 ? 150 : 0;
    return {
      items,
      subtotal,
      deliveryFee,
      discount,
      total: Math.max(0, subtotal + deliveryFee - discount),
      promoCode,
    };
  }, []);

  const addItem = useCallback((item: MenuItem, quantity = 1, options?: CartItemOptions) => {
    setCart(prev => {
      // Check if item with same options already exists
      const existingIndex = prev.items.findIndex(
        cartItem => cartItem.menuItem.id === item.id && 
        JSON.stringify(cartItem.options) === JSON.stringify(options)
      );

      let newItems: CartItem[];
      
      if (existingIndex >= 0) {
        // Update quantity of existing item
        newItems = prev.items.map((cartItem, idx) =>
          idx === existingIndex
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                totalPrice: (cartItem.quantity + quantity) * item.price,
              }
            : cartItem
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${item.id}_${Date.now()}`,
          menuItem: item,
          quantity,
          options,
          totalPrice: quantity * item.price,
        };
        newItems = [...prev.items, newItem];
      }

      return calculateTotals(newItems, prev.discount, prev.promoCode);
    });
  }, [calculateTotals]);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        const newItems = prev.items.filter(item => item.id !== cartItemId);
        return calculateTotals(newItems, prev.discount, prev.promoCode);
      }

      const newItems = prev.items.map(item =>
        item.id === cartItemId
          ? { ...item, quantity, totalPrice: quantity * item.menuItem.price }
          : item
      );
      return calculateTotals(newItems, prev.discount, prev.promoCode);
    });
  }, [calculateTotals]);

  const removeItem = useCallback((cartItemId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== cartItemId);
      return calculateTotals(newItems, prev.discount, prev.promoCode);
    });
  }, [calculateTotals]);

  const clearCart = useCallback(() => {
    setCart(defaultCart);
  }, []);

  const applyPromo = useCallback((code: string) => {
    // In production, validate with API
    // For now, mock 10% discount
    setCart(prev => {
      const discount = prev.subtotal * 0.1;
      return { ...prev, discount, promoCode: code };
    });
  }, []);

  const removePromo = useCallback(() => {
    setCart(prev => calculateTotals(prev.items, 0));
  }, [calculateTotals]);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
