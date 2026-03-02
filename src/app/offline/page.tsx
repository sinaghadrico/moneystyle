"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl">📡</div>
      <h1 className="text-2xl font-bold">You are offline</h1>
      <p className="max-w-md text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Please check your
        network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );
}
