import { NextResponse } from "next/server";

let savedInvoices: any[] = []; // temporary in-memory storage

export async function POST(req: Request) {
  try {
    const body = await req.json();
    savedInvoices.push(body);
    console.log("Saved invoice:", body);
    return NextResponse.json({ message: "Invoice saved successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to save invoice" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ invoices: savedInvoices });
}
