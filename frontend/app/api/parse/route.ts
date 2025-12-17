import { NextResponse } from "next/server";

// 🔹 This route only talks to the backend APIs
// It does NOT directly connect to MongoDB

export async function POST(req: Request) {
  try {
    // Get uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1️⃣ Send file to backend parser (Node/Express)
    const parseResp = await fetch("http://localhost:5000/api/parse", {
      method: "POST",
      body: formData,
    });

    const parsedData = await parseResp.json();

    // 2️⃣ Send parsed data to backend /api/invoices to store in MongoDB
    const saveResp = await fetch("http://localhost:5000/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData.parsed), // send only parsed data
    });

    const saveResult = await saveResp.json();

    // 3️⃣ Return combined response to frontend
    return NextResponse.json({
      parsed: parsedData.parsed,
      saved: saveResult,
    });
  } catch (err: any) {
    console.error("❌ Parse route error:", err);
    return NextResponse.json(
      { error: "Failed to parse or save invoice", details: err.message },
      { status: 500 }
    );
  }
}
