import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#f97316" },
  { name: "Groceries", color: "#84cc16" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Utilities", color: "#8b5cf6" },
  { name: "Housing", color: "#ec4899" },
  { name: "Entertainment", color: "#06b6d4" },
  { name: "Healthcare", color: "#ef4444" },
  { name: "Education", color: "#eab308" },
  { name: "Clothing", color: "#f43f5e" },
  { name: "Subscriptions", color: "#a855f7" },
  { name: "Transfer", color: "#14b8a6" },
  { name: "Other", color: "#6b7280" },
];

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@moneystyle.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "moneystyle2026";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      hashedPassword,
      role: "admin",
      onboardingCompleted: true,
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Create default categories for admin
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId: admin.id, name: cat.name } },
      update: { color: cat.color },
      create: { name: cat.name, color: cat.color, userId: admin.id },
    });
  }
  console.log(`Created ${DEFAULT_CATEGORIES.length} categories`);

  // Create default account
  await prisma.account.upsert({
    where: { id: "default_cash" },
    update: {},
    create: {
      id: "default_cash",
      name: "Cash",
      type: "cash",
      color: "#22c55e",
      userId: admin.id,
    },
  });
  console.log("Created default Cash account");

  // Create app settings for admin
  await prisma.appSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      currency: "USD",
      aiEnabled: false,
    },
  });
  console.log("Created admin settings");

  // Create demo user (optional)
  const demoPassword = await bcrypt.hash("demo-moneystyle-2026", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@moneystyle.app" },
    update: {},
    create: {
      email: "demo@moneystyle.app",
      name: "Demo User",
      hashedPassword: demoPassword,
      role: "user",
      onboardingCompleted: true,
    },
  });
  console.log(`Demo user: ${demo.email}`);

  // Create categories and account for demo user
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId: demo.id, name: cat.name } },
      update: { color: cat.color },
      create: { name: cat.name, color: cat.color, userId: demo.id },
    });
  }

  await prisma.account.upsert({
    where: { id: "demo_cash" },
    update: {},
    create: {
      id: "demo_cash",
      name: "Cash",
      type: "cash",
      color: "#22c55e",
      userId: demo.id,
    },
  });

  await prisma.appSettings.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      currency: "USD",
      aiEnabled: false,
    },
  });
  console.log("Created demo user data");

  console.log("\nSeeding complete!");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`  Demo:  demo@moneystyle.app / demo-moneystyle-2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
