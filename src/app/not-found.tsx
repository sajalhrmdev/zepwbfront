import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mb-8 text-lg">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
}
