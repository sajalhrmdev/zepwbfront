"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw, PackageOpen } from "lucide-react";

interface CategoryProductsProps {
  slug: string;
  title: string;
  href?: string;
}

export default function CategoryProducts({ slug, title, href }: CategoryProductsProps) {
  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoryService.findBySlug(slug),
  });

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => productService.findAll({ categoryId: category!.id, limit: "8" }),
    enabled: !!category?.id,
  });

  const products = result?.data;

  if (isLoading) {
    return (
      <section>
        <SectionHeader title={title} href={href} />
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
        <SectionHeader title={title} />
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>Failed to load {title.toLowerCase()}</p>
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
      <SectionHeader title={title} href={href || `/products?categoryId=${category?.id}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
