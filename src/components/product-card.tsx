"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
  const addItem = useCartStore((s) => s.addItem);

  if (variant === "horizontal") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No img</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-sm font-semibold text-primary">{formatPrice(product.sellingPrice)}</p>
          {product.mrp > product.sellingPrice && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/products/${product.slug}`} className="group space-y-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No image</div>
          )}
          {product.discount > 0 && (
            <span className="absolute left-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              -{product.discount}%
            </span>
          )}
        </div>
        <div>
          <p className="truncate text-sm font-medium">{product.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.averageRating.toFixed(1)}</span>
            <span>({product.totalReviews})</span>
          </div>
          <p className="text-sm font-semibold text-primary">{formatPrice(product.sellingPrice)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
          {product.discount > 0 && (
            <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              -{product.discount}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="absolute right-2 top-2 rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white">
              Best Seller
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="mb-1 text-xs text-muted-foreground">{product.category?.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="truncate text-sm font-semibold hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>{product.averageRating.toFixed(1)}</span>
          <span>({product.totalReviews})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-primary">{formatPrice(product.sellingPrice)}</span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product.id, 1); toast.success("Added to cart!"); }}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
