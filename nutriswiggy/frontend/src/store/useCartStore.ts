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

export interface SwiggyUserProfile {
  name: string;
  phone?: string;
  email?: string;
  isAuthenticated: boolean;
}

export type MobileTab = "discovery" | "agent" | "cart";

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
  nutritionTargets: {
    maxCalories: number;
    targetProtein: number;
    targetFiber: number;
  };
  setNutritionTargets: (targets: Partial<{ maxCalories: number; targetProtein: number; targetFiber: number; }>) => void;
  swiggyUser: SwiggyUserProfile;
  setSwiggyUser: (user: Partial<SwiggyUserProfile>) => void;
  consumedMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  addConsumedMacros: (macros: { calories: number; protein: number; carbs: number; fats: number }) => void;
  
  // Mobile Tab State & Profile Modal
  activeMobileTab: MobileTab;
  setActiveMobileTab: (tab: MobileTab) => void;
  isProfileDrawerOpen: boolean;
  setIsProfileDrawerOpen: (open: boolean) => void;
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
  nutritionTargets: {
    maxCalories: 2200,
    targetProtein: 85,
    targetFiber: 40,
  },
  setNutritionTargets: (targets) => set((state) => ({
    nutritionTargets: { ...state.nutritionTargets, ...targets }
  })),
  swiggyUser: {
    name: "Swiggy Registered User",
    phone: "+91 98765 43210",
    email: "user@swiggy.nutri",
    isAuthenticated: true,
  },
  setSwiggyUser: (user) => set((state) => ({
    swiggyUser: { ...state.swiggyUser, ...user }
  })),
  consumedMacros: {
    calories: 840,
    protein: 48,
    carbs: 95,
    fats: 22,
  },
  addConsumedMacros: (macros) => set((state) => ({
    consumedMacros: {
      calories: state.consumedMacros.calories + macros.calories,
      protein: state.consumedMacros.protein + macros.protein,
      carbs: state.consumedMacros.carbs + macros.carbs,
      fats: state.consumedMacros.fats + macros.fats,
    }
  })),

  // Mobile Navigation State
  activeMobileTab: "discovery",
  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
  isProfileDrawerOpen: false,
  setIsProfileDrawerOpen: (open) => set({ isProfileDrawerOpen: open }),
}));
