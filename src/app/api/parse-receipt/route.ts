import { parseWithAI } from "@/actions/bulk-import";
import { requireAuth } from "@/lib/auth-utils";
import { storage } from "@/lib/storage";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error no type declarations
import heicConvert from "heic-convert";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const base64 = rawBuffer.toString("base64");

  // Parse with AI
  const result = await parseWithAI(base64, ext);
  if ("error" in result) {
    return NextResponse.json(result);
  }

  // Convert HEIC/HEIF to JPEG for storage (browsers can't display HEIC)
  let storeBuffer = rawBuffer;
  let storeExt = ext;
  let storeMime = "application/octet-stream";

  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", pdf: "application/pdf",
  };

  if (ext === "heic" || ext === "heif") {
    try {
      const jpegBuf = await heicConvert({
        buffer: new Uint8Array(rawBuffer),
        format: "JPEG",
        quality: 0.9,
      });
      storeBuffer = Buffer.from(jpegBuf);
      storeExt = "jpeg";
      storeMime = "image/jpeg";
    } catch {
      // If conversion fails, store original
      storeMime = `image/${ext}`;
    }
  } else {
    storeMime = mimeMap[ext] || "application/octet-stream";
  }

  // Upload to storage
  let storedPath: string | null = null;
  try {
    const storageName = `imports/${randomUUID()}.${storeExt}`;
    await storage.upload(storageName, storeBuffer, storeMime);
    storedPath = storageName;
  } catch {
    // Storage failed — still return parse result
  }

  return NextResponse.json({ ...result, storedPath, originalFileName: file.name });
}
