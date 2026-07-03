"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw, PackageOpen } from "lucide-react";

export default function FeaturedProducts() {
  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.findAll({ isFeatured: "true", limit: "8" }),
  });

  const products = result?.data;

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Featured Products" href="/products?featured=true" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <SectionHeader title="Featured Products" />
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>Failed to load featured products</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section>
        <SectionHeader title="Featured Products" />
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <PackageOpen className="h-10 w-10" />
          <p>No featured products available</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Featured Products" href="/products?featured=true" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
