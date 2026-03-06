"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { SocialButtons } from "./social-buttons";
import { useTelegramAutoAuth } from "@/hooks/use-telegram-auto-auth";
import { signInAsDemo } from "@/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isRedirected = searchParams.has("callbackUrl");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { isTelegram, authStatus, signInWithTelegram } = useTelegramAutoAuth();

  const handleDemo = async () => {
    setDemoLoading(true);
    const result = await signInAsDemo();
    if (result.success) {
      window.location.href = "/dashboard";
    }
    setDemoLoading(false);
  };

  if (isTelegram) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to MoneyStyle</h1>
          <p className="text-sm text-muted-foreground">
            Choose how you want to continue
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full text-base"
            onClick={signInWithTelegram}
            disabled={authStatus === "loading"}
          >
            {authStatus === "loading" ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {authStatus === "loading" ? "Signing in..." : "Sign in with Telegram"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base"
            onClick={handleDemo}
            disabled={demoLoading}
          >
            {demoLoading ? "Loading..." : "Try Live Demo"}
          </Button>
        </div>
        {authStatus === "error" && (
          <p className="text-center text-sm text-destructive">Telegram authentication failed</p>
        )}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {isRedirected && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 text-center space-y-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            You need to sign in first
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Sign in or create an account to access your dashboard
          </p>
        </div>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">
          {isRedirected ? "Sign in to continue" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isRedirected
            ? "Log in or register to access MoneyStyle"
            : "Sign in to your MoneyStyle account"}
        </p>
      </div>

      <SocialButtons />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Your password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={isRedirected ? `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/register"} className="underline hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
