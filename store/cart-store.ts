import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { ProductWithDetails } from '@/lib/data'; // Use the detailed product type

export interface CartItem extends ProductWithDetails {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: ProductWithDetails, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.id === product.id
        );

        let updatedItems = [...currentItems];

        if (existingItemIndex > -1) {
          // Update quantity if item already exists
          const existingItem = updatedItems[existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;
          // TODO: Check against product.stock if available
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
          toast.success(`${product.name} quantity updated in cart.`);
        } else {
          // Add new item
          // TODO: Check against product.stock if available
          updatedItems.push({ ...product, quantity });
          toast.success(`${product.name} added to cart.`);
        }

        set({ items: updatedItems });
      },

      removeItem: (productId) => {
        const currentItems = get().items;
        const updatedItems = currentItems.filter((item) => item.id !== productId);
        const removedItem = currentItems.find((item) => item.id === productId);
        set({ items: updatedItems });
        if (removedItem) {
           toast.info(`${removedItem.name} removed from cart.`);
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        const currentItems = get().items;
        const updatedItems = currentItems.map((item) => {
          if (item.id === productId) {
            // TODO: Check against product.stock if available
            toast.info(`${item.name} quantity updated.`);
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
        toast.info('Cart cleared.');
      },

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage', // Name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
      // Optionally: partialize to only persist specific parts of the state
      // partialize: (state) => ({ items: state.items }),
    }
  )
);
