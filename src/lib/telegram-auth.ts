import crypto from "crypto";
import { prisma } from "./db";
import { seedNewUser } from "./auth";

interface TelegramLoginData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

interface TelegramUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

/**
 * Validate Telegram Login Widget data using HMAC-SHA256.
 * Secret key = SHA256(bot_token)
 */
export function validateTelegramLoginWidget(
  data: TelegramLoginData
): TelegramUser | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const { hash, ...rest } = data;

  // Check auth_date is not older than 5 minutes
  const authDate = parseInt(rest.auth_date, 10);
  if (isNaN(authDate) || Date.now() / 1000 - authDate > 300) {
    return null;
  }

  // Build check string: sorted key=value pairs joined by \n
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .filter((s) => !s.endsWith("=undefined"))
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) return null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    photoUrl: data.photo_url,
  };
}

/**
 * Validate Telegram Mini App initData using HMAC-SHA256.
 * Secret key = HMAC-SHA256("WebAppData", bot_token)
 */
export function validateTelegramMiniApp(
  initData: string
): TelegramUser | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  // Build check string: sorted key=value pairs joined by \n
  const checkString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) return null;

  // Parse user from initData
  const userParam = params.get("user");
  if (!userParam) return null;

  try {
    const user = JSON.parse(userParam);
    return {
      id: String(user.id),
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
    };
  } catch {
    return null;
  }
}

/**
 * Find or create a user from Telegram auth data.
 * 1. Check OAuthAccount for provider=telegram
 * 2. Check AppSettings for telegramChatId match
 * 3. Create new user with synthetic email
 */
export async function findOrCreateTelegramUser(tgUser: TelegramUser) {
  const telegramId = tgUser.id;

  // 1. Check existing OAuthAccount
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "telegram",
        providerAccountId: telegramId,
      },
    },
    include: { user: true },
  });

  if (existingOAuth) {
    return existingOAuth.user;
  }

  // 2. Check AppSettings for telegramChatId match
  const existingSettings = await prisma.appSettings.findFirst({
    where: { telegramChatId: telegramId },
    include: { user: true },
  });

  if (existingSettings) {
    // Link OAuthAccount to existing user
    await prisma.oAuthAccount.create({
      data: {
        userId: existingSettings.userId,
        type: "oauth",
        provider: "telegram",
        providerAccountId: telegramId,
      },
    });
    return existingSettings.user;
  }

  // 3. Create new user
  const displayName = [tgUser.firstName, tgUser.lastName]
    .filter(Boolean)
    .join(" ") || tgUser.username || `Telegram User ${telegramId}`;

  const user = await prisma.user.create({
    data: {
      name: displayName,
      email: `tg_${telegramId}@telegram.local`,
      image: tgUser.photoUrl,
    },
  });

  // Link OAuthAccount
  await prisma.oAuthAccount.create({
    data: {
      userId: user.id,
      type: "oauth",
      provider: "telegram",
      providerAccountId: telegramId,
    },
  });

  // Set telegramChatId in AppSettings
  await prisma.appSettings.create({
    data: {
      userId: user.id,
      telegramChatId: telegramId,
      telegramEnabled: true,
    },
  });

  // Seed defaults
  await seedNewUser(user.id);

  return user;
}
