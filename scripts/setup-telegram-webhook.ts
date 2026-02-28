import "dotenv/config";

const TELEGRAM_API = "https://api.telegram.org/bot";

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set in .env");
    process.exit(1);
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const args = process.argv.slice(2);
  const deleteFlag = args.includes("--delete");
  const url = args.find((a) => !a.startsWith("--"));

  // Show current webhook info
  console.log("Current webhook info:");
  const infoRes = await fetch(`${TELEGRAM_API}${token}/getWebhookInfo`);
  const info = await infoRes.json();
  console.log(JSON.stringify(info.result, null, 2));
  console.log();

  if (deleteFlag) {
    console.log("Deleting webhook...");
    const res = await fetch(`${TELEGRAM_API}${token}/deleteWebhook`);
    const data = await res.json();
    console.log(data.ok ? "Webhook deleted." : `Error: ${data.description}`);
    return;
  }

  if (!url) {
    console.log(
      "Usage: npx tsx scripts/setup-telegram-webhook.ts <webhook-url>"
    );
    console.log(
      "       npx tsx scripts/setup-telegram-webhook.ts --delete"
    );
    return;
  }

  console.log(`Setting webhook to: ${url}`);
  const body: Record<string, string> = { url };
  if (secret) {
    body.secret_token = secret;
    console.log("Using secret token from TELEGRAM_WEBHOOK_SECRET");
  }

  const res = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.ok) {
    console.log("Webhook set successfully!");
  } else {
    console.error(`Error: ${data.description}`);
    process.exit(1);
  }
}

main();
