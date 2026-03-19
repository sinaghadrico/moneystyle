import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function authenticateApiKey(
  request: NextRequest
): Promise<{ userId: string; currency: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Authorization header. Use: Bearer <api-key>" },
      { status: 401 }
    );
  }

  const settings = await prisma.appSettings.findFirst({
    where: { developerApiKey: apiKey },
    select: { userId: true, currency: true },
  });

  if (!settings) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return { userId: settings.userId, currency: settings.currency };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
