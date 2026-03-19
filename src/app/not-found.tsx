import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <LogoMark className="h-12 w-12 mb-6" />
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Page not found. It may have been moved or deleted.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/features/smart-dashboard"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Explore Features
        </Link>
      </div>
    </div>
  );
}
