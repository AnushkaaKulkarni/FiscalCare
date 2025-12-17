"use client"

import { useState } from "react"
import { Send, MessageCircle } from "lucide-react"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
          }),
        }
      )

      const data = await response.json()
      const botReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn’t generate a response."
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }])
    } catch (error) {
      console.error("Error fetching Gemini API:", error)
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error: Unable to reach Gemini API." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <div className="bg-primary text-white px-4 py-2 font-semibold">
            FiscalCare AI Assistant 🤖
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-white self-end ml-auto max-w-[80%]"
                    : "bg-muted text-foreground max-w-[80%]"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-sm text-muted-foreground italic">AI is typing...</div>
            )}
          </div>

          <div className="border-t border-border p-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask something..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
