"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";
import signupImage from "./signup.jpg"; // Import the image from the same folder

export function SignUp({
  onNavigate,
}: {
  onNavigate: (page: "login" | "signup" | "upload" | "landing") => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration successful");
        onNavigate("login");
      } else {
        alert(data.error || data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side: Form */}
        <div className="w-1/2 p-8">
          {/* Back Button */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 text-black hover:text-gray-600 transition-all duration-300 mb-6 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-black mb-2"> {/* Increased font size from text-4xl to text-5xl */}
              Create an Account
            </h1>
            <p className="text-black text-base">Join us and start your journey</p> {/* Increased from text-sm to text-base */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-semibold text-black"> {/* Increased from text-sm to text-base */}
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-12 h-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold text-black"> {/* Increased from text-sm to text-base */}
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-12 h-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold text-black"> {/* Increased from text-sm to text-base */}
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 h-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>

            {/* Sign Up Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg transform hover:scale-105"
            >
              Sign Up
            </Button>

            {/* Footer */}
            <p className="text-center text-black text-base mt-6"> {/* Increased from text-sm to text-base */}
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>

        {/* Right Side: Image */}
        <div className="w-1/2 bg-cover bg-right" style={{ backgroundImage: `url(${signupImage.src})` }}>
 {/* Fixed the image reference */}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
