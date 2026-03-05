import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `avatars/${session.user.id}/${randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await storage.upload(storagePath, buffer, file.type);

    const url = storage.getPublicUrl(storagePath);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
