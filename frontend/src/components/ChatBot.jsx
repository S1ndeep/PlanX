import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
const QUICK_SUGGESTIONS = [
  "Plan budget",
  "Suggest itinerary",
  "Best hotels",
  "Things to do"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: trimmed
      }
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: trimmed
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: response.data?.reply || "I could not generate a response right now."
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          sender: "bot",
          text:
            error.response?.data?.message ||
            "Something went wrong while contacting PlanX Assistant."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div
        className={`mb-4 h-[min(680px,84vh)] w-[min(420px,calc(100vw-1.5rem))] origin-bottom-right overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(10,25,35,0.95)] shadow-[0_28px_90px_rgba(2,18,24,0.42)] backdrop-blur-[16px] transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,rgba(8,33,38,0.98)_0%,rgba(14,57,66,0.94)_100%)] px-5 py-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,169,255,0.2),transparent_38%)]" />
          <div className="flex items-start justify-between gap-3">
            <div className="relative flex items-start gap-3">
              <span className="mt-1 flex h-12 w-12 items-center justify-center rounded-full border border-[#8edcff]/20 bg-[linear-gradient(135deg,rgba(30,200,165,0.3),rgba(45,169,255,0.3))] text-sm font-bold uppercase tracking-[0.2em] text-[#f5fbff] shadow-[0_0_28px_rgba(45,169,255,0.22)]">
                AI
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#8edcff]">
                  PlanX Assistant
                </p>
                <h3 className="mt-1 font-[var(--font-editorial)] text-2xl text-[#f5fbff]">
                  Your smart travel co-pilot
                </h3>
                <p className="mt-1 text-sm text-[#b8d3dc]">
                  Ask for routes, budget hints, stays, and destination ideas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f5fbff] transition hover:bg-white/16"
            >
              Close
            </button>
          </div>
        </div>

        <div className="h-[calc(min(680px,84vh)-206px)] overflow-y-auto bg-[linear-gradient(180deg,rgba(7,29,34,0.44)_0%,rgba(7,29,34,0.8)_100%)] px-4 py-5">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,47,58,0.9),rgba(7,29,34,0.95))] px-5 py-6 shadow-[0_16px_45px_rgba(0,0,0,0.26)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8edcff]">
                  Start here
                </p>
                <p className="mt-3 font-[var(--font-editorial)] text-2xl leading-tight text-[#f5fbff]">
                  Hi, I&apos;m PlanX.
                </p>
                <p className="mt-3 text-sm leading-7 text-[#d6eaf2]">
                  Tell me where you want to go and I&apos;ll help you plan everything.
                </p>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.sender === "user";

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-sm transition duration-300 ${
                      isUser
                        ? "bg-[linear-gradient(135deg,rgba(30,200,165,0.22)_0%,rgba(45,169,255,0.28)_100%)] text-[#f5fbff]"
                        : "border border-white/10 bg-[linear-gradient(135deg,rgba(14,47,58,0.95)_0%,rgba(11,38,46,0.95)_100%)] text-[#d6eaf2] shadow-[0_0_26px_rgba(45,169,255,0.08)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[82%] rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,47,58,0.95)_0%,rgba(11,38,46,0.95)_100%)] px-4 py-3 text-sm text-[#d6eaf2] shadow-[0_0_26px_rgba(45,169,255,0.08)]">
                  <span className="inline-flex items-center gap-2">
                    Thinking about your trip...
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8edcff] [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8edcff] [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8edcff]" />
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/10 bg-[rgba(7,29,34,0.82)] p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleQuickSuggestion(suggestion)}
                className="rounded-full border border-white/12 bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs font-semibold text-[#d6eaf2] transition hover:-translate-y-0.5 hover:border-[#8edcff]/30 hover:bg-[rgba(45,169,255,0.1)]"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 rounded-[26px] border border-white/15 bg-[rgba(255,255,255,0.06)] p-2">
            <textarea
              rows={1}
              placeholder="Ask for routes, destinations, or travel advice..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="max-h-28 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#eaf6f9] outline-none placeholder:text-[#6f8e99]"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="rounded-[20px] bg-[linear-gradient(135deg,#1EC8A5_0%,#2DA9FF_100%)] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#021014] shadow-[0_10px_30px_rgba(45,169,255,0.3)] transition hover:scale-[1.02] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Send -&gt;
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex min-h-[76px] items-center gap-3 rounded-full border border-white/10 bg-[rgba(7,29,34,0.8)] px-4 py-3 text-left shadow-[0_22px_60px_rgba(2,18,24,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1"
        aria-label="Toggle PlanX Assistant"
      >
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(30,200,165,0.6),rgba(45,169,255,0.8),rgba(30,200,165,0.6))] opacity-60 blur-md transition duration-300 group-hover:opacity-90" />
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[linear-gradient(135deg,#1EC8A5_0%,#2DA9FF_100%)] text-sm font-extrabold uppercase tracking-[0.16em] text-[#021014] shadow-[0_0_24px_rgba(45,169,255,0.3)]">
          AI
        </span>
        <span className="relative hidden sm:block">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#8edcff]">
            PlanX AI
          </span>
          <span className="mt-1 block font-[var(--font-editorial)] text-xl text-[#f5fbff]">
            Travel co-pilot
          </span>
        </span>
      </button>
    </div>
  );
};

export default ChatBot;
