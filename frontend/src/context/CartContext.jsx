import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = useCallback((item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                // Increment quantity if already in cart
                const newQty = existing.quantity + 1;
                const maxQty = item.available_quantity || 1;
                return prev.map(i => i.id === item.id ? { ...i, quantity: Math.min(newQty, maxQty) } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((id) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id, delta) => {
        setCartItems(prev =>
            prev.map(i => {
                if (i.id === id) {
                    const maxQty = i.available_quantity || 1;
                    return { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, maxQty)) };
                }
                return i;
            })
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const getCartCount = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);

    const getCartTotal = () => cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
};
