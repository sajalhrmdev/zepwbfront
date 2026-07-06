"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

function isValidImageUrl(url?: string): url is string {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
}

export default function CategorySlider() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.findAll(),
  });

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Shop by Category</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <Skeleton className="h-20 w-20 rounded-full md:h-24 md:w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Shop by Category</h2>
        <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
          <p>Failed to load categories</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Shop by Category</h2>
        <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
          <ShoppingBag className="h-10 w-10" />
          <p>No categories available yet</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Shop by Category</h2>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 hidden md:flex items-center justify-center h-10 w-10 rounded-full bg-background border shadow-md hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(`/products?categoryId=${category.id}`)}
              className="flex shrink-0 snap-start flex-col items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted md:h-24 md:w-24">
                {isValidImageUrl(category.image || category.icon) ? (
                  <Image
                    src={category.image || category.icon!}
                    alt={category.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="max-w-20 truncate text-center text-xs font-medium md:text-sm">
                {category.name}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 hidden md:flex items-center justify-center h-10 w-10 rounded-full bg-background border shadow-md hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
