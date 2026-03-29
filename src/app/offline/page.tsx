import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">You&apos;re offline</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Check your internet connection and try again. Your data is safe and will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
