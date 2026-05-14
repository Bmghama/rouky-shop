import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface CheckoutInfo {
  customerName: string;
  neighborhood: string;
  phoneNumber: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  checkoutInfo: CheckoutInfo;
  updateCheckoutInfo: (info: Partial<CheckoutInfo>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rouky_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>(() => {
    const saved = localStorage.getItem('rouky_checkout');
    return saved ? JSON.parse(saved) : { customerName: '', neighborhood: '', phoneNumber: '' };
  });

  useEffect(() => {
    localStorage.setItem('rouky_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('rouky_checkout', JSON.stringify(checkoutInfo));
  }, [checkoutInfo]);

  const updateCheckoutInfo = (info: Partial<CheckoutInfo>) => {
    setCheckoutInfo(prev => ({ ...prev, ...info }));
  };

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.id === newItem.id && 
        item.color === newItem.color && 
        item.size === newItem.size
      );
      if (existing) {
        return prev.map(item => 
          (item.id === newItem.id && item.color === newItem.color && item.size === newItem.size)
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, color?: string, size?: string) => {
    setItems(prev => prev.filter(item => 
      !(item.id === id && item.color === color && item.size === size)
    ));
  };

  const updateQuantity = (id: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, color, size);
      return;
    }
    setItems(prev => prev.map(item => 
      (item.id === id && item.color === color && item.size === size)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice,
      isCartOpen,
      setIsCartOpen,
      checkoutInfo,
      updateCheckoutInfo
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
