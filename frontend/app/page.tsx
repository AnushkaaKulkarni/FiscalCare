"use client";

import { useState } from "react";
import { Landing } from "./landing";
import { SignUp } from "./auth/sign-up";
import { Login } from "./auth/login";
import DocumentUpload from "./document-upload/page"; // ✅ make sure this file exists

export default function App() {
  const [page, setPage] = useState<"landing" | "signup" | "login" | "upload">("landing");

  switch (page) {
    case "landing":
      return <Landing onNavigate={setPage} />;
    case "signup":
      return <SignUp onNavigate={setPage} />;
    case "login":
      return <Login onNavigate={setPage} />;
    case "upload":
  return <DocumentUpload />;
    default:
      return null;
  }
}
