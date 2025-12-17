import { NextResponse } from "next/server";

export async function GET() {
  const gstRates = {
    laptop: "18%",
    mobile: "12%",
    tv: "28%",
    book: "0%",
    furniture: "18%",
    clothing: "5%",
  };

  return NextResponse.json(gstRates);
}
