'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold text-destructive">Oops!</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Something went wrong
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
