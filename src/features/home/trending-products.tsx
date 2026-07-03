"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { SectionHeader } from "@/components/section-header";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw, Flame } from "lucide-react";

export default function TrendingProducts() {
  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "trending"],
    queryFn: () => productService.findAll({ isTrending: "true", limit: "8" }),
  });

  const products = result?.data;

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Trending Now">
          <Flame className="h-6 w-6 text-orange-500" />
        </SectionHeader>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-64 shrink-0 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <SectionHeader title="Trending Now">
          <Flame className="h-6 w-6 text-orange-500" />
        </SectionHeader>
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>Failed to load trending products</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader title="Trending Now">
        <Flame className="h-6 w-6 text-orange-500" />
      </SectionHeader>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product.id} className="w-64 shrink-0 snap-start">
            <ProductCard product={product} variant="horizontal" />
          </div>
        ))}
      </div>
    </section>
  );
}
