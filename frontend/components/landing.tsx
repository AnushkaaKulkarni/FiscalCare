"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, TrendingUp, FileText, AlertCircle, MessageCircle, X } from "lucide-react"
import { useState } from "react"

interface LandingProps {
  onNavigate: (page: "landing" | "login" | "signup") => void
}

export function Landing({ onNavigate }: LandingProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: input
            }]
          }]
        })
      })

      const data = await response.json()
      const assistantMessage = { role: 'assistant' as const, content: data.candidates[0].content.parts[0].text }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">FiscalCare</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate("login")}>
              Sign In
            </Button>
            <Button onClick={() => onNavigate("signup")} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="text-sm font-medium text-accent">AI-Powered GST Filing</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Simplify GST Filing with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  AI Accuracy
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Smart, fast, and error-free GST filing for MSMEs and professionals. Automate compliance and focus on
                growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("signup")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Start Filing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/40">
              <div>
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <p className="text-sm text-muted-foreground">Businesses Filing</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <p className="text-sm text-muted-foreground">Support Available</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative h-96 lg:h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-card to-card/50 border border-border/40 rounded-2xl p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Filing Status</h3>
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">GSTR-1 Filed</p>
                      <p className="text-xs text-muted-foreground">Oct 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Tax Computed</p>
                      <p className="text-xs text-muted-foreground">₹45,230 payable</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">GSTR-3B Due</p>
                      <p className="text-xs text-muted-foreground">Oct 20, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose FiscalCare?</h2>
          <p className="text-lg text-muted-foreground">Everything you need for seamless GST compliance</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "AI-Powered Parsing",
              description: "Automatically extract and validate invoice data with 99.9% accuracy",
            },
            {
              icon: TrendingUp,
              title: "Real-Time Computation",
              description: "Instant tax calculations with detailed breakdowns by tax type",
            },
            {
              icon: AlertCircle,
              title: "Smart Alerts",
              description: "Never miss a deadline with intelligent compliance reminders",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
            >
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">FiscalCare</h4>
              <p className="text-sm text-muted-foreground">Simplifying GST compliance for businesses</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2025 FiscalCare. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">LinkedIn</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-card border border-border rounded-lg shadow-lg flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Chat with AI</h3>
            <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white ml-auto max-w-3/4' : 'bg-muted text-foreground max-w-3/4'}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="text-muted-foreground">AI is typing...</div>}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={sendMessage} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Landing
