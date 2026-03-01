import { NextRequest, NextResponse } from "next/server";
import { getFileFromR2 } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const key = params.path.join("/");
    
    if (!key) {
      return NextResponse.json({ error: "File path required" }, { status: 400 });
    }

    const file = await getFileFromR2(key);

    if (!file.body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = (file.body as any).transformToWebStream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(file.contentLength ? { "Content-Length": String(file.contentLength) } : {}),
      },
    });
  } catch (error: any) {
    console.error("[Files API] Error:", error?.message || error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
