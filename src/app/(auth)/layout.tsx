import Link from "next/link";
import { ThemeProvider } from "next-themes";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col items-center bg-background p-4">
        <div className="w-full max-w-md pt-8 pb-4">
          <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-10 w-10" />
              <span className="text-2xl font-bold tracking-tight">MoneyStyle</span>
            </Link>
          </div>
          {children}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
