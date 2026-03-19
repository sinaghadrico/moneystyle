import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="text-sm font-bold">MoneyStyle</span>
            </Link>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            API Docs
          </span>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
