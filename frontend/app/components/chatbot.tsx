"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "Hello! How can I help you?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: "bot", text: "⚠️ Error: Unable to reach Gemini API." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {/* Floating Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[500px] max-h-[600px] bg-gradient-to-br from-white to-gray-50 border border-teal-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="flex justify-between items-center bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-3 rounded-t-2xl">
            <h2 className="text-lg font-semibold">AI Chatbot</h2>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white h-[400px] scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-gray-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg max-w-[90%] whitespace-pre-wrap break-words leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-teal-100 to-emerald-100 text-gray-800 ml-auto shadow-md"
                    : "bg-white border border-teal-200 text-gray-900 shadow-sm"
                }`}
              >
                <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-gray-500 text-sm italic">Thinking...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-teal-200 flex items-center p-3 bg-white rounded-b-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-teal-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition transform hover:scale-105"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
