import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi, I am PlanX Assistant. Ask me anything about trips, itineraries, or budget travel."
    }
  ]);
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

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: trimmed
      });

      const data = response.data || {};

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply || "I could not generate a response right now.",
          estimatedCost: data.estimatedCost,
          breakdown: data.breakdown
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`mb-3 h-[min(500px,70vh)] w-[min(360px,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.28)] transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
          <div className="flex items-center justify-between bg-[#0f172a] px-4 py-3 text-white">
            <h3 className="text-sm font-semibold tracking-wide">PlanX Assistant</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-2 py-1 text-xs hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="h-[calc(min(500px,70vh)-118px)] overflow-y-auto bg-slate-50 px-3 py-4">
            <div className="space-y-3">
              {messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        isUser
                          ? "bg-[#0ea5e9] text-white"
                          : "border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-6">{message.text}</p>

                      {message.estimatedCost && message.breakdown && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-slate-800">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Budget Card
                          </p>
                          <p className="mt-1 text-base font-semibold">
                            Total: INR {message.estimatedCost}
                          </p>
                          <p className="mt-2 text-xs">Stay: INR {message.breakdown.stay}</p>
                          <p className="text-xs">Food: INR {message.breakdown.food}</p>
                          <p className="text-xs">Travel: INR {message.breakdown.travel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                    Bot is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <textarea
              rows={1}
              placeholder="Ask about your next trip..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Send
            </button>
          </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0f172a] text-xl text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] transition hover:scale-105 hover:bg-[#1e293b]"
        aria-label="Toggle PlanX Assistant"
      >
        {isOpen ? "×" : "AI"}
      </button>
    </div>
  );
};

export default ChatBot;
