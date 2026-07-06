"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { optimizeImageUrl } from "@/lib/cloudinary";

export default function BestSellers() {
  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "bestSellers"],
    queryFn: () => productService.findAll({ isBestSeller: "true", limit: "10" }),
  });

  const products = result?.data;

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Best Sellers" href="/products?featured=true" />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-48 shrink-0 space-y-3 md:w-56">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <SectionHeader title="Best Sellers" />
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>Failed to load best sellers</p>
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
        <SectionHeader title="Best Sellers" />
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>No best sellers available</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Best Sellers" href="/products?featured=true" />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {products.map((product) => {
          const primaryImage =
            product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group w-44 shrink-0 snap-start space-y-2 md:w-52"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {primaryImage ? (
                  <Image
                    src={optimizeImageUrl(primaryImage, 300)}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 176px, 208px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                {product.discount > 0 && (
                  <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div>
                <p className="truncate text-sm font-medium">{product.name}</p>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(product.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.totalReviews})
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.sellingPrice)}
                  </span>
                  {product.mrp > product.sellingPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.mrp)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
