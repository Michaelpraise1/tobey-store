import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/sanity.types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;

  // ── Favourites ──────────────────────────
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavoriteCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product._id === product._id
          );
          
          if (existingItemIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += 1;
            return { items: updatedItems };
          } else {
            return { items: [...state.items, { product, quantity: 1 }] };
          }
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
      },
      
      incrementQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },
      
      decrementQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // ── Favourites ──────────────────────────
      favorites: [],

      toggleFavorite: (product) => {
        set((state) => {
          const exists = state.favorites.some((p) => p._id === product._id);
          return {
            favorites: exists
              ? state.favorites.filter((p) => p._id !== product._id)
              : [...state.favorites, product],
          };
        });
      },

      removeFavorite: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((p) => p._id !== productId),
        }));
      },

      isFavorite: (productId) => {
        return get().favorites.some((p) => p._id === productId);
      },

      getFavoriteCount: () => {
        return get().favorites.length;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
