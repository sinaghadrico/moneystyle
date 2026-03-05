import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const transactionId = formData.get("transactionId") as string | null;

    if (!file || !transactionId) {
      return NextResponse.json(
        { error: "file and transactionId are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPG, PNG, WebP, HEIC, or PDF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 },
      );
    }

    // Verify transaction exists and belongs to user
    const tx = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: { id: true, mediaFiles: true },
    });
    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const storagePath = `${transactionId}/${randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await storage.upload(storagePath, buffer, file.type);

    const url = storage.getPublicUrl(storagePath);

    // Append to transaction's mediaFiles
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        mediaFiles: { push: storagePath },
        hasReceipt: true,
      },
    });

    return NextResponse.json({
      path: storagePath,
      url,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
