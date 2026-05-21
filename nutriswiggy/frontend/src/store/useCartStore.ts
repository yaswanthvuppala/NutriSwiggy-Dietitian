import { create } from "zustand";

export interface MacroData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  veg: boolean;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  macros?: MacroData;
  image?: string;
  category?: string;
}

interface CartStore {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
  selectedCoupon: { code: string; discountPercent: number } | null;
  applyCoupon: (code: string | null) => boolean;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  dietitianMode: boolean;
  setDietitianMode: (val: boolean) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  addItem: (item) => {
    set((state) => {
      const existingItem = state.cart.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    });
  },
  removeItem: (id) => {
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== id),
    }));
  },
  updateQuantity: (id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((i) => i.id !== id) };
      }
      return {
        cart: state.cart.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      };
    });
  },
  clearCart: () => set({ cart: [] }),
  selectedAddress: "Home: 45, Green Glen Layout, Outer Ring Road, Bangalore",
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  selectedCoupon: null,
  applyCoupon: (code) => {
    if (!code) {
      set({ selectedCoupon: null });
      return true;
    }
    const coupons: Record<string, number> = {
      "SWIGGY50": 50,
      "NUTRI30": 30,
      "HEALTHY20": 20,
      "DIET50": 50,
    };
    const discount = coupons[code.toUpperCase()];
    if (discount !== undefined) {
      set({ selectedCoupon: { code: code.toUpperCase(), discountPercent: discount } });
      return true;
    }
    return false;
  },
  activeFilter: "All",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  dietitianMode: false,
  setDietitianMode: (val) => set({ dietitianMode: val }),
}));
