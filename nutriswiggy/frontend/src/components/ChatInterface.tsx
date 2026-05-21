import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, User, ChevronRight, Zap } from "lucide-react";
import { MealProps } from "./MealCard";

export interface Message {
  sender: "user" | "assistant";
  text: string;
  meals?: MealProps[];
}

interface ChatInterfaceProps {
  onRecommendationsFound: (meals: MealProps[]) => void;
  activeFilter: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onRecommendationsFound,
  activeFilter 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "## 🥗 Welcome to NutriSwiggy!\n\nI am your **AI Dietitian**, ready to help you discover healthy food options in your neighborhood. \n\nTell me your dietary or fitness goal—for example, **'High protein vegetarian lunch'** or **'Low calorie keto dinner'**—and I will instantly search our Swiggy database, compute exact macros, score them, and rank the healthiest choices for you! Try clicking one of the quick goals below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-flash-lite");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick preset pills
  const quickGoals = [
    { label: "High Protein Veg", query: "High protein vegetarian dinner" },
    { label: "Keto Dinner 🥑", query: "Keto dinner salad bowl" },
    { label: "Fat Loss <500 kcal", query: "Low calorie lunch under 500 kcal" },
    { label: "Muscle Gain", query: "Paneer or chicken muscle gain meal" },
    { label: "Low Carb Veg", query: "Low carb vegetarian food" },
    { label: "High Fiber Millets", query: "Millet or ragi high fiber meal" }
  ];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Connect to FastAPI server
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, model: selectedModel }),
      });

      if (!response.ok) {
        throw new Error("Dietitian server is offline.");
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        sender: "assistant",
        text: data.answer,
        meals: data.meals
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Bubble up matching recommendations to parent to render card grid
      if (data.meals && data.meals.length > 0) {
        onRecommendationsFound(data.meals);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error communicating with dietitian backend:", error);
      
      // Friendly mockup mock response so it NEVER crashes during visual tests
      setTimeout(() => {
        // Mocking a local RAG fallback inside frontend just in case API server isn't run by user yet
        const mockMeals: MealProps[] = [
          {
            id: "mock-1",
            restaurant: "Fresh & Healthy Co.",
            item: "Paneer Tikka Salad Bowl",
            price: 249,
            veg: true,
            description: "Fresh paneer tikka chunks tossed with baby spinach, crisp cucumber, bell peppers, olives, and a light herb vinaigrette dressing.",
            macros: { calories: 340, protein: 22, carbohydrates: 12, fats: 18, fiber: 5 },
            raw_score: 85,
            health_score: 88,
            badges: ["Top Pick", "High Protein", "Low Carb"],
            penalties_applied: [],
            bonuses_applied: ["Leafy Greens", "Lean Protein Boost"],
            match_rationale: "High protein paneer tikka offers sustained energy while low carbohydrates keep your insulin spikes minimal."
          },
          {
            id: "mock-2",
            restaurant: "The Protein Club",
            item: "Grilled Herb Chicken Breast",
            price: 299,
            veg: false,
            description: "Tender grilled chicken breast marinated in exotic herbs, served alongside fresh steamed broccoli, carrots, and organic quinoa.",
            macros: { calories: 420, protein: 38, carbohydrates: 25, fats: 10, fiber: 6 },
            raw_score: 92,
            health_score: 94,
            badges: ["Super Protein", "Fiber Rich", "Weight Loss"],
            penalties_applied: [],
            bonuses_applied: ["High Fiber Grain", "Lean Muscle Builder"],
            match_rationale: "An absolute powerhouse for muscle synthesis with 38g of lean protein and rich micronutrients from steamed broccoli."
          }
        ];

        // Build text that references the EXACT same meals shown on the Discovery Board
        const mealSummaries = mockMeals.map((m, i) => 
          `${i + 1}. **${m.item}** from *${m.restaurant}* (₹${m.price})\n   - **Macros**: ${m.macros.calories} kcal | **P**: ${m.macros.protein}g | **C**: ${m.macros.carbohydrates}g | **F**: ${m.macros.fats}g\n   - **Health Score**: ${m.health_score}/100\n   - **Dietitian's Take**: ${m.match_rationale}`
        ).join("\n\n");

        const mockText = `### ⚠️ Backend Server Offline — Demo Mode\n\nThe FastAPI server is currently offline on \`localhost:8000\`. Showing demo recommendations for **"${messageText}"**.\n\n### 🏆 My Top Recommendations:\n\n${mealSummaries}\n\n### 💡 Pro-Tip:\n- Start the backend with \`python main.py\` to get live AI-powered recommendations from our full menu database!`;

        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: mockText,
            meals: mockMeals
          }
        ]);
        onRecommendationsFound(mockMeals);
        setLoading(false);
      }, 1000);
    }
  }, [selectedModel, onRecommendationsFound]);

  // Handle active filter changes to trigger quick queries automatically
  useEffect(() => {
    if (activeFilter) {
      handleSend(activeFilter);
    }
  }, [activeFilter, handleSend]);

  const swiggyLogoIcon = (className: string) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
    </svg>
  );

  // Safe and super clean inline markdown renderer for premium hackathon visuals
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl font-bold text-[#FC8019] mt-4 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FC8019]" /> {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-md font-bold text-[#282C3F] mt-3 mb-1.5 flex items-center gap-1.5">
            {swiggyLogoIcon("w-4 h-4 text-[#FC8019]")} {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={idx} className="ml-5 list-disc text-sm text-slate-700 my-1 leading-relaxed">
          {formatBoldWords(trimmed.substring(2))}
        </li>;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return <li key={idx} className="ml-5 list-decimal text-sm text-slate-700 my-1 leading-relaxed">
          {formatBoldWords(trimmed.replace(/^\d+\.\s/, ""))}
        </li>;
      }
      return <p key={idx} className="text-sm text-slate-700 my-1.5 leading-relaxed">
        {formatBoldWords(line)}
      </p>;
    });
  };

  // Helper to highlight bold words e.g. **Keto**
  const formatBoldWords = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      // Check for code blocks too e.g. `python`
      if (index % 2 === 1) {
        return <strong key={index} className="text-[#282C3F] font-extrabold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">{part}</strong>;
      }
      
      // Inline code rendering
      const subParts = part.split(/`([^`]+)`/g);
      return subParts.map((subPart, subIdx) => {
        if (subIdx % 2 === 1) {
          return <code key={subIdx} className="text-[#FC8019] font-mono bg-[#FC8019]/10 px-1 py-0.5 rounded text-xs">{subPart}</code>;
        }
        return subPart;
      });
    });
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[650px] shadow-md relative overflow-hidden">
      
      {/* Dynamic Glow Header Banner */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FC8019] to-amber-500 flex items-center justify-center shadow-lg shadow-[#FC8019]/20 animate-pulse">
            {swiggyLogoIcon("w-5 h-5 text-white")}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#282C3F] tracking-wide text-md">NutriSwiggy Dietitian</span>
              <span className="h-2 w-2 rounded-full bg-[#FC8019] animate-ping" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Swiggy Builders Club</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 hover:border-[#FC8019]/50 transition-colors duration-200 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-[#FC8019] animate-pulse" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="gemini-3.5-flash" className="bg-white text-slate-700">Gemini 3.5 Flash 🚀</option>
            <option value="gemini-3.1-flash-lite" className="bg-white text-slate-700">Gemini 3.1 Flash Lite ⚡</option>
            <option value="gemini-3.1-pro-preview" className="bg-white text-slate-700">Gemini 3.1 Pro ✨</option>
            <option value="gemini-2.5-flash" className="bg-white text-slate-700">Gemini 2.5 Flash</option>
            <option value="gemini-2.0-flash" className="bg-white text-slate-700">Gemini 2.0 Flash</option>
          </select>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
              msg.sender === "user" 
                ? "bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/15" 
                : "bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/15"
            }`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : swiggyLogoIcon("w-5 h-5 text-[#FC8019]")}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
              msg.sender === "user"
                ? "bg-[#FC8019] text-white rounded-tr-none font-medium"
                : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
            }`}>
              {msg.sender === "user" ? (
                <p className="text-sm">{msg.text}</p>
              ) : (
                <div className="space-y-1">
                  {renderFormattedText(msg.text)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Spinner / Typing indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-[#FC8019]/10 border border-[#FC8019]/15 flex items-center justify-center text-[#FC8019]">
              {swiggyLogoIcon("w-5 h-5 text-[#FC8019] animate-bounce")}
            </div>
            <div className="bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 p-5 flex items-center justify-center w-24">
              <div className="dot-flashing" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pills Box */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">🎯 Try Quick Dietary Goals</span>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {quickGoals.map((g, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(g.query)}
              disabled={loading}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-[#FC8019] hover:text-[#FC8019] border border-slate-200 hover:border-[#FC8019]/30 rounded-lg text-slate-600 transition-all duration-200 shadow-sm flex items-center gap-1.5"
            >
              <span>{g.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask me: 'High protein vegetarian dinner under 400 calories'..."
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FC8019] rounded-xl px-4 py-3 text-sm focus:outline-none text-[#282C3F] placeholder-slate-400 transition-colors duration-200"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#FC8019] to-amber-500 hover:shadow-lg hover:shadow-[#FC8019]/20 active:scale-95 text-white flex items-center justify-center shadow-md transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
