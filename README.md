# 🥗 NutriSwiggy: AI-Powered Healthy Food Recommendation Assistant

**An Intelligent AI Dietitian and Healthy Menu Finder built for the Swiggy Builders Club Hackathon.**

NutriSwiggy is an intelligent hackathon MVP designed to guide users toward healthier meal choices using conversational AI, local ingredient databases, and deterministic scoring metrics. It provides real-time fitness analysis, estimates macros, scores Swiggy dishes with custom dietitian reasoning, and lets users build a healthy meal cart with live nutritional tracking before redirecting to Swiggy checkout.

---

## 🏆 Project Goals & Highlights

- **AI Dietitian Persona:** Provides professional, scientific, yet encouraging advice tailored to users' specific goals (fat loss, muscle gain, low carb, keto, high protein, vegetarian).
- **Tool-Binding Architecture:** Uses Gemini 2.5 Pro / Flash Function Calling connected to local Python tools for high performance.
- **Smart Diet Scoring Formula:** Calculates a custom health score (0-99) using a protein density formula, penalizing fried foods, heavy cream, and sugary items while rewarding whole grains and fibers.
- **Strict Veg-Only Filter:** Dynamically activates strict filtration rules to exclude any non-vegetarian meals whenever a plant-based/veg intent is registered.
- **Double Resiliency Fallback:** Runs a local deterministic dietitian RAG pipeline in the event that a Gemini API key is missing or rate limits are reached, ensuring the hackathon application **never crashes**. In demo mode, the frontend populates the Discovery Board with high-fidelity mock meal cards so every feature remains testable.
- **Swiggy Health Cart:** An interactive right-panel cart where users can add/remove recommended meals via a toggle button on each card, view live aggregate calorie and protein totals, and proceed to Swiggy checkout.
- **State-of-the-Art UX:** Features a responsive 3-column glassmorphism dashboard (Chat → Discovery Board → Health Cart), custom orange-emerald Swiggy styling, dynamic macro progress bars, micro-animations, and rapid-fire goal-preset pills.

---

## 🏗️ Application Architecture

```
  +---------------------------------------------------------------------+
  |                    Frontend (Next.js + React)                       |
  |   Tailwind CSS  •  Framer Motion  •  Glassmorphism 3-Column UI     |
  +--------+-----------------+------------------+----------------------+
           |                 |                  |
  +--------v--------+  +-----v------+  +--------v---------+
  | Chat Interface  |  | Discovery  |  | Swiggy Health    |
  | (AI Dietitian)  |  | Board      |  | Cart + Checkout  |
  +---------+-------+  | (MealCards |  | (Live Macro      |
            |          |  +Add Cart) |  |  Aggregator)     |
            |          +-----+------+  +--------+----------+
            |                |                  |
            +--------+-------+                  |
                     |                          |
                     | HTTP REST                |
                     v                          |
  +------------------+--------------------+     |
  |          FastAPI Backend              |     |
  |          main.py Router               |     |
  +------------------+--------------------+     |
                     |                          |
                     v                          |
  +------------------+--------------------+     |
  |         Gemini RAG Agent              |     |
  |      gemini_agent.py (LLM)            |     |
  +--------+----------+----------+--------+     |
           |          |          |              |
  +--------v---+  +---v-------+  +---v------+   |
  |search_menu |  |estimate_  |  |rank_     |   |
  |mock_menu   |  |macros()   |  |meals()   |   |
  +------------+  +-----------+  +----------+   |
                                                |
  Cart items ──────────────────────────────────>  Swiggy Checkout
  (https://www.swiggy.com/checkout)              (opens in new tab)
```

---

## 📂 Project Structure

```
nutriswiggy/
│
├── backend/
│   ├── main.py                     # FastAPI server & route setups
│   │
│   ├── data/
│   │   └── mock_menu.json          # Realistic healthy dishes and control items
│   │
│   ├── llm/
│   │   └── gemini_agent.py         # Gemini API client, automatic tool loops, fallback pipelines
│   │
│   ├── prompts/
│   │   └── system_prompt.txt       # AI Dietitian persona instructions & rules
│   │
│   ├── tools/
│   │   ├── search_menu.py          # Case-insensitive query & strict veg filtration
│   │   ├── nutrition_tools.py      # Keyword ingredient-based macro estimator
│   │   └── ranking_tools.py        # Multi-factor scoring logic and penalties
│   │
│   └── services/
│       └── recommendation_service.py # Controller service interface
│
└── frontend/
    ├── package.json                # Dependencies: Next.js, React, Tailwind, Framer Motion
    ├── tsconfig.json               # TypeScript config
    ├── tailwind.config.js          # Bespoke Swiggy HSL colors and glassmorphic shadow tokens
    ├── postcss.config.js           # PostCSS Tailwind builder
    ├── next.config.js              # NextJS options
    └── src/
        ├── app/
        │   ├── globals.css         # Custom styled scrollbar, typing dot animations, background glows
        │   ├── layout.tsx          # Root layout and Outfit Google Font loader
        │   └── page.tsx            # 3-column dashboard, cart state, macro aggregation, checkout link
        └── components/
            ├── ChatInterface.tsx   # Markdown chat log, typing, rapid-fire chips, API calls, demo fallback
            └── MealCard.tsx        # Macro bars, health score, dietitian take, +Add/✓Added cart toggle
```

---

## ⚡ Setup & Launch Instructions

### Prerequisites
Make sure you have **Python 3.8+** and **Node.js 18+** installed on your system.

---

### Step 1: Launch the FastAPI Backend

1. Navigate to the backend directory:
   ```bash
   cd nutriswiggy/backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install fastapi uvicorn google-generativeai pydantic
   ```
3. Set your Gemini API key (Optional but recommended for live LLM reasoning):
   - **Windows PowerShell:**
     ```powershell
     $env:GEMINI_API_KEY="your_gemini_api_key_here"
     ```
   - **macOS / Linux Bash:**
     ```bash
     export GEMINI_API_KEY="your_gemini_api_key_here"
     ```
4. Start the server using Uvicorn:
   ```bash
   python main.py
   ```
   *The backend will now be live on `http://127.0.0.1:8000`.*

---

### Step 2: Launch the Next.js Frontend

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd nutriswiggy/frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The client will be live on `http://localhost:3000`.*

---

## 🧪 Testing the MVP: Supported Prompts

Test these standard test cases to see NutriSwiggy in action:

1. **Strict Veg Filter Test Case:**
   - Prompt: `"High protein vegetarian dinner"`
   - *Expectation:* Displays strictly green-badged (vegetarian) paneer, tofu, or chickpea meals with 0% non-veg leakage.
2. **Low-Calorie Fat Loss Test Case:**
   - Prompt: `"Low calorie lunch under 500 kcal"`
   - *Expectation:* Recommends light salads, broth soups, or millets, showing custom dietitian deficit takes.
3. **Cheat Meal Penalty & Scoring Test Case:**
   - Prompt: `"Show me a pizza or chocolate shake"`
   - *Expectation:* If fast foods are searched, they are heavily penalized (e.g. Health Score under 30) due to fried crusts, processed heavy creams, or refined sugars, explaining the dietitian's concerns clearly.
4. **General Muscle Gain Test Case:**
   - Prompt: `"Keto dinner"` or `"Muscle gain meal"`
   - *Expectation:* Highlights high protein densities (protein > 25g) and scores them near-perfect (Score 90+).

---

## 🛒 Health Cart & Swiggy Checkout Flow

The right-hand **Swiggy Health Cart** panel enables an end-to-end ordering experience:

1. **Add to Cart:** Click the **+ Add** button on any recommended meal card in the Discovery Board. The button toggles to a green **✓ Added** state.
2. **Live Nutrition Tracker:** As items are added, the cart footer displays real-time aggregate **calories**, **protein**, and **order total (₹)**.
3. **Remove Items:** Click the trash icon on any cart item, or click the **✓ Added** button again on the card to remove it.
4. **Proceed to Swiggy Cart:** Click the orange **"Proceed to Swiggy Cart"** button to open Swiggy's checkout page in a new tab.

> **Note:** The Swiggy checkout redirect is a mock integration — it opens `https://www.swiggy.com/checkout` as a demonstration since full Swiggy API/MCP integration is not available for this hackathon.

---

## 🔌 Demo / Offline Mode

If the FastAPI backend is not running, the frontend automatically enters **Demo Mode**:

- The AI Dietitian chat generates high-fidelity mock recommendations directly in the browser.
- The **Discovery Board** populates with sample meal cards (e.g., *Paneer Tikka Salad Bowl*, *Grilled Herb Chicken Breast*) complete with macros and health scores.
- All interactive features — **+ Add to Cart**, live macro aggregation, and checkout — remain fully functional for demonstration purposes.
- Start the backend with `python main.py` to switch to live Gemini AI-powered recommendations from the full menu database.
