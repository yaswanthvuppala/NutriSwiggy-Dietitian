export interface MacroData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  veg: boolean;
  category: string;
  macros: MacroData;
  healthScore: number;
  badges: string[];
  image: string;
  matchRationale?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  ratingCount: string;
  deliveryTime: number;
  distance: number;
  costForTwo: number;
  cuisines: string[];
  address: string;
  image: string;
  veg: boolean;
  offer: string;
  isPopular: boolean;
  isRecommended: boolean;
  menu: MenuItem[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  textColor: string;
}

export const CATEGORIES = [
  { id: "biryani", name: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&auto=format&fit=crop&q=60" },
  { id: "pizza", name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60" },
  { id: "burgers", name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60" },
  { id: "healthy", name: "Healthy Food", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=60" },
  { id: "south-indian", name: "South Indian", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=60" },
  { id: "desserts", name: "Desserts", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=150&auto=format&fit=crop&q=60" },
];

export const BANNERS: Banner[] = [
  {
    id: "banner-1",
    title: "50% OFF on Healthy Bowls",
    subtitle: "Fuel your fitness goals with premium salads and diet wraps. Use code NUTRI50.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    bgColor: "from-emerald-950 via-slate-900 to-slate-950",
    textColor: "text-healthy-emerald",
  },
  {
    id: "banner-2",
    title: "Weekend Biryani Feast",
    subtitle: "Get free delivery and special rewards on popular biryani outlets.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
    bgColor: "from-amber-950 via-slate-900 to-slate-950",
    textColor: "text-swiggy-orange",
  },
  {
    id: "banner-3",
    title: "AI Dietitian Consultations",
    subtitle: "Get instant macro scoring and restaurant recommendations from your personalized AI Coach.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80",
    bgColor: "from-blue-950 via-slate-900 to-slate-950",
    textColor: "text-cyan-400",
  },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "rest-1",
    name: "The Green Salad Hub",
    rating: 4.6,
    ratingCount: "1.2K+ ratings",
    deliveryTime: 22,
    distance: 2.1,
    costForTwo: 400,
    cuisines: ["Salads", "Healthy Food", "Keto", "Juices"],
    address: "HSR Layout, Sector 3, Bangalore",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    veg: true,
    offer: "Flat 30% off | Use NUTRI30",
    isPopular: true,
    isRecommended: true,
    menu: [
      {
        id: "r1-m1",
        name: "Paneer Tikka Salad Bowl",
        price: 249,
        description: "Fresh paneer tikka chunks tossed with baby spinach, crisp cucumber, bell peppers, olives, and a light herb vinaigrette dressing.",
        veg: true,
        category: "Salads",
        macros: { calories: 340, protein: 22, carbohydrates: 12, fats: 18, fiber: 5 },
        healthScore: 88,
        badges: ["Top Pick", "High Protein", "Low Carb"],
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=60",
        matchRationale: "High protein paneer tikka offers sustained energy while low carbohydrates keep your insulin spikes minimal."
      },
      {
        id: "r1-m2",
        name: "Keto Avocado Salad Wrap",
        price: 279,
        description: "Low-carb almond flour wrap stuffed with ripe avocados, cottage cheese, organic lettuce, and zero-calorie dressing.",
        veg: true,
        category: "Wraps",
        macros: { calories: 290, protein: 14, carbohydrates: 8, fats: 22, fiber: 6 },
        healthScore: 92,
        badges: ["Keto", "High Fiber", "Healthy Fats"],
        image: "https://images.unsplash.com/photo-1626700051175-6518c4793f76?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Rich in monosaturated healthy fats from avocados, perfect for maintaining ketosis."
      },
      {
        id: "r1-m3",
        name: "Quinoa Veggie Harvest Bowl",
        price: 229,
        description: "Organic steamed quinoa paired with edamame beans, cherry tomatoes, broccoli, chickpeas, and lemon-tahini glaze.",
        veg: true,
        category: "Bowls",
        macros: { calories: 380, protein: 16, carbohydrates: 48, fats: 9, fiber: 9 },
        healthScore: 95,
        badges: ["Superfood", "High Fiber", "Micro Nutrient Rich"],
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Incredible fiber and complete protein profile from quinoa and edamame, promoting excellent digestion."
      },
      {
        id: "r1-m4",
        name: "Fruity Green Cleanser Juice",
        price: 149,
        description: "Cold-pressed juice loaded with celery, organic kale, spinach, green apple, cucumber, and ginger.",
        veg: true,
        category: "Beverages",
        macros: { calories: 95, protein: 2, carbohydrates: 18, fats: 0.5, fiber: 2 },
        healthScore: 82,
        badges: ["Detox", "Zero Fat", "Vitamins Pack"],
        image: "https://images.unsplash.com/photo-1610970881699-44a5587caa90?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Ultra-hydrating and rich in antioxidants, aiding systemic cellular detoxification."
      }
    ]
  },
  {
    id: "rest-2",
    name: "The Protein Club",
    rating: 4.8,
    ratingCount: "500+ ratings",
    deliveryTime: 25,
    distance: 3.5,
    costForTwo: 500,
    cuisines: ["Healthy Food", "North Indian", "Fitness Meals"],
    address: "Koramangala 4th Block, Bangalore",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    veg: false,
    offer: "Flat 20% off | Use HEALTHY20",
    isPopular: true,
    isRecommended: false,
    menu: [
      {
        id: "r2-m1",
        name: "Grilled Herb Chicken Breast",
        price: 299,
        description: "Tender chicken breast grilled with exotic herbs, served with broccoli, baby carrots, and organic quinoa.",
        veg: false,
        category: "Fitness Special",
        macros: { calories: 420, protein: 38, carbohydrates: 25, fats: 10, fiber: 6 },
        healthScore: 96,
        badges: ["Super Protein", "Muscle Gain", "Lean Eat"],
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=60",
        matchRationale: "An absolute powerhouse for muscle synthesis with 38g of lean protein and rich micronutrients from steamed broccoli."
      },
      {
        id: "r2-m2",
        name: "High Protein Soya chunks Keema",
        price: 219,
        description: "Finely minced soy chunks simmered in mild Indian spices, served with two multi-grain rotis.",
        veg: true,
        category: "Protein Veg",
        macros: { calories: 360, protein: 26, carbohydrates: 38, fats: 8, fiber: 8 },
        healthScore: 89,
        badges: ["High Protein", "High Fiber", "Pure Veg"],
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Top-tier soy protein content providing a superb amino acid profile for vegetarian trainers."
      },
      {
        id: "r2-m3",
        name: "Baked Salmon in Lemon Butter",
        price: 499,
        description: "Fresh Atlantic salmon steak baked in zero-fat lemon herb seasoning, served with asparagus shoots.",
        veg: false,
        category: "Premium Fitness",
        macros: { calories: 450, protein: 32, carbohydrates: 5, fats: 24, fiber: 3 },
        healthScore: 94,
        badges: ["Omega 3 Rich", "Keto Friendly", "Premium Quality"],
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Superb source of Omega-3 fatty acids which support cardiovascular and neurological health."
      }
    ]
  },
  {
    id: "rest-3",
    name: "Royal Biryani Darbar",
    rating: 4.4,
    ratingCount: "2K+ ratings",
    deliveryTime: 28,
    distance: 4.2,
    costForTwo: 450,
    cuisines: ["Biryani", "Mughlai", "North Indian"],
    address: "Indiranagar, 100 Feet Road, Bangalore",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    veg: false,
    offer: "50% OFF | Code SWIGGY50",
    isPopular: false,
    isRecommended: true,
    menu: [
      {
        id: "r3-m1",
        name: "Hyderabadi Chicken Dum Biryani",
        price: 299,
        description: "Layered basmati rice and marinated chicken cooked under dum with saffron, mint, and original spices.",
        veg: false,
        category: "Biryani",
        macros: { calories: 720, protein: 28, carbohydrates: 85, fats: 25, fiber: 3 },
        healthScore: 62,
        badges: ["Classic Delight", "Rich Calorie"],
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=60",
        matchRationale: "High calorie and high carbs. Enjoy in moderation, ideally after a vigorous endurance workout."
      },
      {
        id: "r3-m2",
        name: "Zesty Paneer Dum Biryani",
        price: 269,
        description: "Dum-cooked basmati rice loaded with soft paneer chunks marinated in yogurt, green chilies, and cardamoms.",
        veg: true,
        category: "Biryani",
        macros: { calories: 680, protein: 20, carbohydrates: 88, fats: 22, fiber: 4 },
        healthScore: 65,
        badges: ["Pure Veg Classic"],
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Great vegetarian protein source from paneer, but high glycemic load from refined basmati rice."
      }
    ]
  },
  {
    id: "rest-4",
    name: "Milano Pizzeria",
    rating: 4.5,
    ratingCount: "800+ ratings",
    deliveryTime: 32,
    distance: 1.8,
    costForTwo: 600,
    cuisines: ["Pizza", "Italian", "Pasta", "Salads"],
    address: "Koramangala 3rd Block, Bangalore",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    veg: false,
    offer: "Buy 1 Get 1 Free | Italian Feast",
    isPopular: true,
    isRecommended: true,
    menu: [
      {
        id: "r4-m1",
        name: "Classic Sourdough Margherita Pizza",
        price: 349,
        description: "Slow-fermented sourdough crust topped with organic marinara, fresh mozzarella slices, and handpicked sweet basil.",
        veg: true,
        category: "Woodfired Pizza",
        macros: { calories: 510, protein: 18, carbohydrates: 62, fats: 16, fiber: 4 },
        healthScore: 74,
        badges: ["Sourdough Base", "Fresh Mozzarella"],
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Sourdough fermentation increases digestibility and lowers the glycemic response compared to standard dough."
      },
      {
        id: "r4-m2",
        name: "Vibrant Mediterranean Veggie Pizza",
        price: 399,
        description: "Sourdough pizza garnished with fresh bell peppers, baby spinach, black olives, artichoke hearts, and feta cheese crumbs.",
        veg: true,
        category: "Woodfired Pizza",
        macros: { calories: 490, protein: 16, carbohydrates: 65, fats: 14, fiber: 6 },
        healthScore: 79,
        badges: ["High Fiber", "Vitamins Pack"],
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Rich in essential dietary fiber and antioxidants from the diverse blend of roasted Mediterranean vegetables."
      }
    ]
  },
  {
    id: "rest-5",
    name: "The Sugarless Corner",
    rating: 4.7,
    ratingCount: "300+ ratings",
    deliveryTime: 20,
    distance: 2.8,
    costForTwo: 350,
    cuisines: ["Desserts", "Healthy Food", "Beverages"],
    address: "HSR Layout, Sector 1, Bangalore",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
    veg: true,
    offer: "Flat 25% off | Code DIET25",
    isPopular: false,
    isRecommended: true,
    menu: [
      {
        id: "r5-m1",
        name: "Sugar-Free Chia Seed Pudding",
        price: 189,
        description: "Nutritious chia seeds soaked in organic almond milk, sweetened with stevia, and topped with fresh raspberries.",
        veg: true,
        category: "Healthy Puddings",
        macros: { calories: 180, protein: 6, carbohydrates: 15, fats: 10, fiber: 9 },
        healthScore: 94,
        badges: ["Stevia Sweetened", "Superfood", "Omega-3 Rich"],
        image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Extremely high in soluble fiber and antioxidants, sweetened naturally without compromising insulin levels."
      },
      {
        id: "r5-m2",
        name: "High-Protein Almond Oats Cookie",
        price: 129,
        description: "Freshly baked cookies composed of gluten-free rolled oats, whey protein, almond chunks, and sugar-free cocoa chips.",
        veg: true,
        category: "Cookies & Bites",
        macros: { calories: 150, protein: 10, carbohydrates: 14, fats: 6, fiber: 3 },
        healthScore: 89,
        badges: ["Gluten Free", "Sugar Free", "Protein Snack"],
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&auto=format&fit=crop&q=60",
        matchRationale: "Excellent low-calorie high-protein healthy snacking alternative, satisfying sweet cravings safely."
      }
    ]
  }
];
