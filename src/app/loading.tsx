export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-8 w-20 rounded bg-muted" />
          <div className="flex gap-4">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        </div>
      </header>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-4 h-12 w-96 rounded bg-muted-foreground/20" />
          <div className="mx-auto mb-8 h-6 w-64 rounded bg-muted-foreground/20" />
          <div className="mx-auto h-12 w-32 rounded-full bg-muted-foreground/20" />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 h-8 w-48 rounded bg-muted" />
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 w-32 shrink-0 rounded-xl bg-muted"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
