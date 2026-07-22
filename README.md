# 🥗 NutriSwiggy: AI-Powered Healthy Food Ordering & Dietitian Platform

**A premium, high-fidelity Healthy Food Delivery Web Application & AI Dietitian inspired by the visual elegance and UX patterns of Swiggy.**

NutriSwiggy is a production-grade, food-focused web application designed to guide users toward healthier lifestyle choices. By combining a modern online food-ordering interface with a context-aware AI Dietitian agent, users can easily explore local restaurant menus, assess dish health scores, track their personal macronutrient progress, and build a unified cart that bridges standard restaurant ordering with AI recommendations.

---

## 🏆 Core Features & Architectural Highlights

### ⚡ Swiggy-Inspired visual Design & Multi-Page UX
- **Dynamic Homepage (`/`)**: A rich, responsive landing page featuring categorized food filters, custom offer banners, category carousels, restaurant discovery grids with real-time rating badges, delivery times, and distance indicators.
- **Restaurant Menu Details (`/restaurant/[id]`)**: Full menu pages with intuitive categorized drop-downs, veg/non-veg badge indicators, absolute macro details (calories, protein, carbs, fats), and individual dish health scores.
- **Context-Aware AI Dietitian Drawer (`DietitianDrawer`)**: Triggered directly from any restaurant detail page via a hovering action button, this sliding panel is pre-seeded to scan *that specific restaurant's unique menu database*. Users can ask questions like *"What's the best high-protein keto dish here?"* and receive contextually accurate recommendations.
- **Debounced Search (`/search`)**: Instant debounced query parsing that searches both restaurant lists and food categories dynamically.
- **2-Column Dedicated AI Dietitian Page (`/dietitian`)**: A spacious, streamlined interface featuring a conversational Chat interface on the left and a smart Meal Recommendation Board on the right. 

### 🛒 Unified Zustand Store & Checkout Flow
- **Single Global Cart Store (`useCartStore.ts`)**: Manages cart line-items globally. Both traditional restaurant dishes and dietitian recommended meals are pooled into a unified cart. There is **no duplicate checkout cart** on the dietitian page, ensuring a consistent user checkout experience.
- **Dynamic Cart Pricing (`/cart`)**: Provides detailed breakdowns including packaging fees, GST, delivery charges, and support for promo coupons (e.g., `NUTRI30` for 30% off up to ₹150, or `SWIGGY50` for 50% off up to ₹200).
- **Checkout Progress (`/checkout`)**: Fully animated progress steps culminating in a modern checkout success screen with fluid visual checkmarks.

### 📊 Real-Time Macro Tracker & Customer Profile (`/profile`)
- **Macro Goal Visualization**: Tracks aggregate consumption of protein, calories, carbs, and fats relative to the user's customized fitness goals (e.g. weight loss, muscle building, general fitness).
- **Consumed Progress Bars**: Displays dynamic status bars reflecting the nutrition values of recently checked-out items.

### 🧮 Smart Diet Scoring Formula
Calculates a custom, deterministic health score **normalized to 100** based on a robust multi-factor nutrition formula:
- **Protein Density Rewards**: Promotes items with high protein ratios per 100 calories.
- **Ingredient Penalties**: Heavily penalizes high saturated fats (e.g., butter, heavy cream), fried cooking methods, and excessive refined sugars.
- **Dietitian Take**: Accompanied by localized, bite-sized health rationales to guide the user's dietary decisions.

---

## 🏗️ Technical Architecture Map

```
   +------------------------------------------------------------------------+
   |                        Next.js 15+ App Router                          |
   |              Tailwind CSS • Framer Motion • Zustand Store              |
   +-----+--------+---------------+------------+-------------+--------------+
         |        |               |            |             |
   +-----v---+ +--v-----+  +------v-------+ +--v-----+  +----v------+
   |  Home   | | Search |  |  Restaurant  | |  Cart  |  | Dietitian |
   |   (/)   | |(/search|  | (/restaurant)| |(/cart) |  |(/dietitian|
   +---------+ +--------+  +------+-------+ +---+----+  +-----+-----+
                                  |             |             |
                                  | (Fab Drawer)|             | (Discovery)
                                  v             |             v
                           +--------------+     |       +-----------+
                           |  Dietitian   |     |       | Unified   |
                           |  Drawer      |     +------>| Zustand   |
                           +------+-------+             | Cart      |
                                  |                     +-----+-----+
                                  |                           |
                                  +---------------------------v
                                                        +-----------+
                                                        | Checkout  |
                                                        |(/checkout)|
                                                        +-----------+
                                                              |
                                                              v
                                                        +-----------+
                                                        | Profile & |
                                                        |  Macros   |
                                                        |(/profile) |
                                                        +-----------+
```

---

## 📂 Project Directory Structure

```
nutriswiggy/
├── backend/
│   ├── main.py                     # FastAPI server entry point & REST routers
│   ├── data/
│   │   └── mock_menu.json          # Curated database of menus, macros, and control dishes
│   ├── llm/
│   │   └── gemini_agent.py         # Gemini API Integration, tool-calling loops, & resilient fallbacks
│   ├── prompts/
│   │   └── system_prompt.txt       # Advanced AI Dietitian persona definition
│   ├── tools/
│   │   ├── search_menu.py          # Strict vegetarian filtration & case-insensitive keyword searches
│   │   ├── nutrition_tools.py      # Scientific ingredient-to-macro estimation engine
│   │   └── ranking_tools.py        # Health Scoring algorithm (normalized to 100) & penalties
│   └── services/
│       └── recommendation_service.py # Core business-logic controllers
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # App provider, responsive wrappers, custom web-safe sans-serif stack
    │   │   ├── globals.css         # Styling custom scrollbars, gradient glows, and card behaviors
    │   │   ├── page.tsx            # Main Home feed (Categories, Offers, Restaurant Lists)
    │   │   ├── search/             # Debounced Search view
    │   │   ├── restaurant/[id]/    # Restaurant menu with AI Drawer FAB
    │   │   ├── dietitian/          # Spacious 2-Column Chat + Meal recommendation view
    │   │   ├── cart/               # Review checkout list, edit quantities, apply promo codes
    │   │   ├── checkout/           # Steps animations and successful checkout splash
    │   │   └── profile/            # Order history, custom target goals, and interactive macro metrics
    │   ├── components/
    │   │   ├── Navbar.tsx          # Sticky responsive header with navigation badges
    │   │   ├── MobileNav.tsx       # Bottom navigation dock for mobile devices
    │   │   ├── DietitianDrawer.tsx # Slide-out overlay contextually seeded with restaurant menu data
    │   │   ├── ChatInterface.tsx   # Conversational AI layout with micro-animations & goal pills
    │   │   ├── MealCard.tsx        # High-fidelity custom card displaying macros, score, and unified cart toggles
    │   │   ├── FoodCard.tsx        # Restaurant menu dish presentation with score badge & add button
    │   │   ├── RestaurantCard.tsx  # Sleek card displaying distance, delivery time, tags, & ratings
    │   │   └── CategoryCarousel.tsx# Swipeable category shortcuts
    │   └── store/
    │       └── useCartStore.ts     # Global state tracker (cart sync, checkout flow, coupons, addresses)
```

---

## ⚡ Setup & Run Instructions

### Prerequisites
Make sure you have **Node.js 18+** and **Python 3.8+** installed locally.

---

### Step 1: Fire up the FastAPI Backend

1. Navigate to the backend directory:
   ```bash
   cd nutriswiggy/backend
   ```
2. Install the necessary Python packages:
   ```bash
   pip install fastapi uvicorn google-generativeai pydantic
   ```
3. Set your Gemini API key (Optional; if absent, the app gracefully falls back to deterministic local scoring and mock responses so that it **never crashes**):
   - **Windows PowerShell:**
     ```powershell
     $env:GEMINI_API_KEY="your_gemini_api_key"
     ```
   - **macOS / Linux Terminal:**
     ```bash
     export GEMINI_API_KEY="your_gemini_api_key"
     ```
4. Start the development server:
   ```bash
   python main.py
   ```
   *The backend will now serve REST endpoints at `http://127.0.0.1:8000`.*

---

### Step 2: Fire up the Next.js Frontend

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd nutriswiggy/frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Boot up the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend client will now be fully interactive at `http://localhost:3000`.*

---

## 🧪 Resiliency & Demo Fallback Mode
If you run the frontend without starting the FastAPI backend, the system automatically runs in **Offline / Demo Mode**:
- The conversational chat utilizes high-fidelity local templates to provide responsive suggestions.
- The **Discovery Board** and **Contextual Drawers** populate with beautiful, interactive mock meals.
- Dynamic cart operations, address toggles, coupon processing, animated checkout workflows, and profile macro updates remain **100% operational**!
