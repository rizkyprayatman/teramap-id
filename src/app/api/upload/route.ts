import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToR2, uploadBase64ToR2 } from "@/lib/r2";

const ALLOWED_FOLDERS = ["uploads", "captures", "equipment", "logos", "documents"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle base64 upload (from camera capture)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { image, folder } = body;

      if (!image) {
        return NextResponse.json({ error: "No image data" }, { status: 400 });
      }

      const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "uploads";
      const result = await uploadBase64ToR2(image, safeFolder);
      return NextResponse.json(result);
    }

    // Handle file upload (FormData)
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadToR2(file, safeFolder);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Upload gagal" },
      { status: 500 }
    );
  }
}
