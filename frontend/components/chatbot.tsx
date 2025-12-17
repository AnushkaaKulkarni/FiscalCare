"use client"

import { useState } from "react"
import { Send, MessageCircle, X } from "lucide-react"


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<
  { sender: "user" | "bot"; text: string }[]
>([
  {
    sender: "bot",
    text: "Hello 👋 How can I help you today?",
  },
])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  // const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const sendMessage = async () => {
  if (!input.trim()) return
  const userMessage = input.trim()

  setMessages((prev) => [...prev, { sender: "user", text: userMessage }])
  setInput("")
  setLoading(true)

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    })

    const data = await response.json()

    const botReply =
      data?.reply || "Sorry, I couldn’t generate a response right now."

    setMessages((prev) => [...prev, { sender: "bot", text: botReply }])
  } catch (error) {
    console.error("Chat error:", error)
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "⚠️ Error: Unable to reach server." },
    ])
  } finally {
    setLoading(false)
  }
}


const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    sendMessage();
  }
};


 return (
  <>
    {/* Floating Chat Button */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-6 right-6 z-50 bg-[#008C8C] text-white p-5 rounded-full shadow-xl hover:bg-[#007777] hover:scale-110 transition-all duration-300"
    >
      <MessageCircle className="w-8 h-8" />
    </button>

    {/* Chat Window */}
    {isOpen && (
      <div className="fixed bottom-20 right-6 z-50 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#008C8C] text-white px-4 py-3 font-semibold flex items-center justify-between">
          <span>FiscalCare AI Assistant 🤖</span>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg text-sm break-words whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-[#008C8C] text-white self-end ml-auto max-w-[80%]"
                  : "bg-slate-100 text-slate-800 max-w-[80%]"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="text-sm text-slate-500 italic">
              AI is typing...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask something..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008C8C]"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="p-3 rounded-full bg-[#008C8C] text-white hover:bg-[#007777] transition-all duration-300 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </>
);
}
