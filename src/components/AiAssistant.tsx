import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, Orbit, Brain } from "lucide-react";
import { ChatMessage } from "../types";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "M0",
      role: "assistant",
      text: "### AstraAQI Atmospheric Intelligence AI\n\nGreetings! I am Dr. Sharma's AI co-pilot, configured to assist with geospatial telemetry queries.\n\n*How can I assist you with satellite air quality metrics today?*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Why is Punjab polluted?",
    "Explain Sentinel-5P HCHO",
    "Show fire affected regions",
    "Predict tomorrow's AQI"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `M_U_${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Package conversation history to preserve context
      const historyPayload = messages.slice(-5).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history: historyPayload })
      });

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: `M_A_${Date.now()}`,
        role: "assistant",
        text: data.text || "I was unable to compile a telemetry response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI chat assistant error:", err);
      const errorMsg: ChatMessage = {
        id: `M_E_${Date.now()}`,
        role: "assistant",
        text: "*Communication link failed. Please ensure server.ts is compiling properly.*",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      
      {/* Expanded Floating Chat Panel */}
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[480px] bg-[#071b36] border border-isro-orange/35 rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#040d1a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-isro-orange to-sky-blue flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-display font-bold text-white flex items-center gap-1">
                  AstraAQI Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[9px] font-mono text-slate-400">Gemini 3.5 Flash Model</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#040d1a]/25 text-left">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Profile icon */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                  m.role === "user" ? "bg-isro-orange/10 text-isro-orange" : "bg-sky-blue/10 text-sky-blue"
                }`}>
                  {m.role === "user" ? "U" : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message text bubble */}
                <div className={`p-3 rounded-lg text-xs leading-relaxed max-w-[80%] ${
                  m.role === "user" 
                    ? "bg-isro-orange/10 text-slate-200 border border-isro-orange/20" 
                    : "bg-[#040d1a]/80 text-slate-300 border border-slate-900"
                }`}>
                  {/* Simplistic markdown formatter */}
                  <div className="space-y-1">
                    {m.text.split("\n").map((line, lIdx) => {
                      if (line.startsWith("### ")) {
                        return <h5 key={lIdx} className="font-bold text-white text-xs mt-1 mb-0.5">{line.replace("### ", "")}</h5>;
                      }
                      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
                        return <p key={lIdx} className="pl-2 font-sans">{line}</p>;
                      }
                      return <p key={lIdx} className="font-sans">{line.replace(/\*\*/g, "").replace(/\*/g, "")}</p>;
                    })}
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 block mt-1.5 text-right">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-6 h-6 rounded-full bg-sky-blue/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-sky-blue animate-pulse" />
                </div>
                <div className="bg-[#040d1a]/80 border border-slate-900 p-2.5 rounded-lg text-[10px] font-mono text-slate-400">
                  Synthesizing orbital data columns...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions footer */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1 bg-[#040d1a]/20">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-2 py-1 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded text-[9px] font-mono text-slate-300 hover:text-white cursor-pointer transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(userInput);
            }}
            className="p-3 border-t border-slate-800/80 bg-[#040d1a] flex gap-2"
          >
            <input
              type="text"
              placeholder="Query atmospheric metrics..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 bg-[#071b36] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-isro-orange font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="p-2 bg-gradient-to-tr from-isro-orange to-orange-600 rounded-lg text-white disabled:opacity-40 cursor-pointer transition-all flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      ) : (
        /* Floating Button FAB */
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-isro-orange to-orange-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all glow-orange cursor-pointer relative"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-[-3px] right-[-3px] bg-sky-blue text-slate-900 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded-full animate-bounce">
            AI
          </span>
        </button>
      )}

    </div>
  );
}
