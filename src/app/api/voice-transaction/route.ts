import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's OpenAI key from AppSettings
  const settings = await prisma.appSettings.findUnique({
    where: { userId: session.user.id },
  });
  const apiKey = settings?.openaiApiKey;
  if (!apiKey)
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 400 },
    );

  const openai = new OpenAI({ apiKey });

  const formData = await request.formData();
  const audio = formData.get("audio") as File;

  if (!audio) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 },
    );
  }

  try {
    // 1. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
    });

    if (!transcription.text) {
      return NextResponse.json(
        { error: "Could not transcribe audio" },
        { status: 400 },
      );
    }

    // 2. Parse with GPT-4
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    });
    const categoryList = categories
      .map((c) => `${c.id}:${c.name}`)
      .join(", ");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract transaction details from text. Available categories: ${categoryList}. Return JSON: { "amount": number, "type": "expense"|"income", "categoryId": "id", "merchant": "string or null", "description": "string" }. If you cannot determine a field, use null for optional fields and your best guess for required fields. Amount should always be a positive number.`,
        },
        {
          role: "user",
          content: transcription.text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "Could not parse transaction details" },
        { status: 400 },
      );
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({
      transcription: transcription.text,
      amount: parsed.amount ?? null,
      type: parsed.type ?? "expense",
      categoryId: parsed.categoryId ?? null,
      merchant: parsed.merchant ?? null,
      description: parsed.description ?? "",
    });
  } catch (error) {
    console.error("Voice transaction error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process audio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
