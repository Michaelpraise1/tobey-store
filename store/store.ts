import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/sanity.types';
import type { MerchProduct } from '@/lib/queries/merch';

// ─── Cart Item ────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  // Printify-specific metadata (populated for merch items)
  printifyVariantId?: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedDesign?: string;
}

/**
 * Merch cart item uses MerchProduct instead of Product.
 * Stored separately so they can be submitted to the merch-specific checkout route.
 */
export interface MerchCartItem {
  product: MerchProduct;
  quantity: number;
  printifyVariantId?: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedDesign?: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface CartState {
  // ── Shop cart ──────────────────────────────────────────────────────────────
  items: CartItem[];
  addItem: (product: Product, options?: {
    selectedSize?: string;
    selectedColor?: string;
    printifyVariantId?: number;
  }) => void;
  removeItem: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;

  // ── Merch cart (print-on-demand) ────────────────────────────────────────────
  merchItems: MerchCartItem[];
  addMerchItem: (product: MerchProduct, options: {
    selectedSize?: string;
    selectedColor?: string;
    selectedDesign?: string;
    printifyVariantId?: number;
  }) => void;
  removeMerchItem: (productId: string, variantId?: number) => void;
  incrementMerchQuantity: (productId: string, variantId?: number) => void;
  decrementMerchQuantity: (productId: string, variantId?: number) => void;
  clearMerchCart: () => void;
  getMerchTotalPrice: () => number;
  getMerchItemCount: () => number;

  // ── Favourites ──────────────────────────────────────────────────────────────
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavoriteCount: () => number;
}

// ─── Helper: build a unique key for a merch cart item ────────────────────────
// Merch items with different sizes/colors/designs are treated as separate line items

function merchItemKey(productId: string, variantId?: number): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ── Shop cart ──────────────────────────────────────────────────────────

      items: [],

      addItem: (product, options) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product._id === product._id
          );

          if (existingIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            };
            return { items: updatedItems };
          }

          return {
            items: [
              ...state.items,
              {
                product,
                quantity: 1,
                selectedSize: options?.selectedSize,
                selectedColor: options?.selectedColor,
                printifyVariantId: options?.printifyVariantId,
              },
            ],
          };
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

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.price || 0) * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // ── Merch cart ──────────────────────────────────────────────────────────

      merchItems: [],

      addMerchItem: (product, options) => {
        set((state) => {
          const existingIndex = state.merchItems.findIndex(
            (item) =>
              item.product._id === product._id &&
              item.printifyVariantId === options.printifyVariantId
          );

          if (existingIndex !== -1) {
            const updated = [...state.merchItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1,
            };
            return { merchItems: updated };
          }

          return {
            merchItems: [
              ...state.merchItems,
              {
                product,
                quantity: 1,
                selectedSize: options.selectedSize,
                selectedColor: options.selectedColor,
                selectedDesign: options.selectedDesign,
                printifyVariantId: options.printifyVariantId,
              },
            ],
          };
        });
      },

      removeMerchItem: (productId, variantId) => {
        set((state) => ({
          merchItems: state.merchItems.filter(
            (item) =>
              !(
                item.product._id === productId &&
                item.printifyVariantId === variantId
              )
          ),
        }));
      },

      incrementMerchQuantity: (productId, variantId) => {
        set((state) => ({
          merchItems: state.merchItems.map((item) =>
            item.product._id === productId && item.printifyVariantId === variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },

      decrementMerchQuantity: (productId, variantId) => {
        set((state) => ({
          merchItems: state.merchItems.map((item) =>
            item.product._id === productId && item.printifyVariantId === variantId
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          ),
        }));
      },

      clearMerchCart: () => set({ merchItems: [] }),

      getMerchTotalPrice: () => {
        return get().merchItems.reduce((total, item) => {
          return total + (item.product.basePrice || 0) * item.quantity;
        }, 0);
      },

      getMerchItemCount: () => {
        return get().merchItems.reduce((count, item) => count + item.quantity, 0);
      },

      // ── Favourites ──────────────────────────────────────────────────────────

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
