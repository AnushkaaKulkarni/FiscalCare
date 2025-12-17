import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: "Gemini API key missing" },
        { status: 500 }
      );
    }

    // ✅ USE SUPPORTED MODEL
    const modelName = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();

    let botReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botReply) {
      const errorMsg = data?.error?.message?.toLowerCase() || "";

      if (errorMsg.includes("overloaded")) {
        botReply =
          "😅 I'm getting a lot of requests right now. Please try again in a few seconds.";
      } else {
        botReply =
          "Sorry, I couldn’t generate a response right now.";
      }
    }

    return NextResponse.json({ reply: botReply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { reply: "Error connecting to Gemini API" },
      { status: 500 }
    );
  }
}
