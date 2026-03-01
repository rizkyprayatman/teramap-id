import { NextRequest, NextResponse } from "next/server";
import bwipjs from "bwip-js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "";

  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: text.trim(),
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: "center",
    });

    const pngBytes = new Uint8Array(png);

    return new NextResponse(pngBytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[Barcode API] Error:", error?.message || error);
    return NextResponse.json({ error: "Failed to generate barcode" }, { status: 500 });
  }
}
