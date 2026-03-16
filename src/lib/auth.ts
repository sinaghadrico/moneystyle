import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import {
  validateTelegramLoginWidget,
  validateTelegramMiniApp,
  findOrCreateTelegramUser,
} from "./telegram-auth";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#f97316", icon: "🍔" },
  { name: "Groceries", color: "#22c55e", icon: "🛒" },
  { name: "Transport", color: "#3b82f6", icon: "🚗" },
  { name: "Shopping", color: "#a855f7", icon: "🛍️" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { name: "Health", color: "#ef4444", icon: "🏥" },
  { name: "Bills & Utilities", color: "#64748b", icon: "📄" },
  { name: "Rent & Housing", color: "#8b5cf6", icon: "🏠" },
  { name: "Education", color: "#06b6d4", icon: "📚" },
  { name: "Travel", color: "#14b8a6", icon: "✈️" },
  { name: "Subscriptions", color: "#6366f1", icon: "🔄" },
  { name: "Salary", color: "#16a34a", icon: "💰" },
  { name: "Freelance", color: "#84cc16", icon: "💻" },
  { name: "Transfer", color: "#6b7280", icon: "🔁" },
  { name: "Other", color: "#9ca3af", icon: "📦" },
];

export async function seedNewUser(userId: string) {
  await prisma.account.create({
    data: { name: "Cash", type: "cash", color: "#22c55e", userId },
  });
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
  });
}

const baseAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...baseAdapter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linkAccount: (data: any) => prisma.oAuthAccount.create({ data }) as any,
    unlinkAccount: ({ provider, providerAccountId }: { provider: string; providerAccountId: string }) =>
      prisma.oAuthAccount.delete({ where: { provider_providerAccountId: { provider, providerAccountId } } }) as any,
    getAccount: (providerAccountId: string, provider: string) =>
      prisma.oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider, providerAccountId } } }) as any,
    getUserByAccount: async ({ provider, providerAccountId }: { provider: string; providerAccountId: string }) => {
      const account = await prisma.oAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return account?.user ?? null;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Google,
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: {
        telegramData: { type: "text" },
        authType: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.telegramData || !credentials?.authType) return null;

        const authType = credentials.authType as string;
        const rawData = credentials.telegramData as string;

        let tgUser;
        if (authType === "widget") {
          const data = JSON.parse(rawData);
          tgUser = validateTelegramLoginWidget(data);
        } else if (authType === "miniapp") {
          tgUser = validateTelegramMiniApp(rawData);
        }

        if (!tgUser) return null;

        const user = await findOrCreateTelegramUser(tgUser);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.id) {
        await seedNewUser(user.id);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as { role?: string }).role ?? "user";
      }
      // Refresh role from DB on every token refresh
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "user";
      }
      // Allow client-side session updates (e.g. after profile edit)
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
        (session.user as { role?: string }).role = token.role as string ?? "user";
      }
      return session;
    },
  },
});
