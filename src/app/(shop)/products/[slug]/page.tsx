"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import { useCartStore, useCartComputed } from "@/store/cart.store";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/utils";
import { optimizeImageUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { Product } from "@/types";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-12 w-full mt-6" />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { firstName: string; lastName?: string; avatar?: string };
    images?: { url: string }[];
  };
}) {
  return (
    <div className="p-4 rounded-xl border bg-card">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={review.user.avatar} />
          <AvatarFallback>
            {review.user.firstName[0]}
            {review.user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm">
              {review.user.firstName} {review.user.lastName}
            </p>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} />
          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, i) => (
                <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                  <Image src={optimizeImageUrl(img.url, 128)} alt="Review image" fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { addItem, items } = useCartStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.findBySlug(slug),
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.id],
    queryFn: () => productService.getRelated(product!.id),
    enabled: !!product?.id,
  });

  const { data: frequentlyBought } = useQuery({
    queryKey: ["frequently-bought", product?.id],
    queryFn: () => productService.getFrequentlyBought(product!.id),
    enabled: !!product?.id,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist-check", product?.id],
    queryFn: () => wishlistService.check(product!.id),
    enabled: !!product?.id && isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addItem(product!.id, quantity, selectedVariantId),
    onSuccess: (cart) => {
      const { setCart } = useCartStore.getState();
      setCart(cart);
      toast.success("Added to cart!");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const wishlistMutation = useMutation({
    mutationFn: () =>
      isWishlisted ? wishlistService.remove(product!.id) : wishlistService.add(product!.id),
    onSuccess: () => {
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    },
  });

  if (isLoading) return <ProductSkeleton />;
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ id: "0", url: "", alt: product.name, isPrimary: true }];
  const discount = calculateDiscount(product.mrp, product.sellingPrice);
  const currentPrice = product.sellingPrice;
  const inCart = items.find((i) => i.productId === product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <Link href="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
        <span className="shrink-0">/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors shrink-0">
          {product.category.name}
        </Link>
        <span className="shrink-0">/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4">
            {images[selectedImageIndex]?.url ? (
              <Image
                src={optimizeImageUrl(images[selectedImageIndex].url, 800)}
                alt={images[selectedImageIndex].alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImageIndex ? "border-green-500" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {img.url ? (
                    <Image src={optimizeImageUrl(img.url, 128)} alt={img.alt || ""} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="h-full bg-muted" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <StarRating rating={product.averageRating} />
            <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.totalReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-foreground">{formatPrice(currentPrice)}</span>
            {product.mrp > currentPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold">
                  {discount}% OFF
                </Badge>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1">{product.unit}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Size / Unit</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedVariantId === v.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "border-input hover:border-green-500"
                    }`}
                  >
                    {v.size || v.name}
                    <span className="block text-xs text-muted-foreground">{formatPrice(v.sellingPrice)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 self-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex items-center justify-center h-10 w-10 rounded-full border hover:bg-accent transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="flex items-center justify-center h-10 w-10 rounded-full border hover:bg-accent transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 flex-1">
              <Button
                size="lg"
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending || product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : addToCartMutation.isPending ? "Adding..." : inCart ? "Add Again" : "Add to Cart"}
              </Button>

              <Button variant="outline" size="lg" className="flex-1 gap-2">
                <Zap className="h-5 w-5" />
                Buy Now
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push("/auth/login");
                    return;
                  }
                  wishlistMutation.mutate();
                }}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-xs text-center text-muted-foreground">Free delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-xs text-center text-muted-foreground">Secure payment</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50">
              <RotateCcw className="h-5 w-5 text-green-600" />
              <span className="text-xs text-center text-muted-foreground">Easy returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "No description available."}
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-bold mb-4">Highlights</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>Fresh and hygienically packed</li>
              <li>Farm-fresh quality guaranteed</li>
              <li>Fast delivery within 45 minutes</li>
              {product.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Country of Origin</span>
                <span className="font-medium">India</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{product.unit}</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
              {product.brand && (
                <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">{product.brand.name}</span>
                </div>
              )}
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-bold mb-4">Nutrition Info</h2>
            <p className="text-muted-foreground">Nutritional information is not available for this product.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-bold mb-4">Ingredients</h2>
            <p className="text-muted-foreground">No ingredient information available.</p>
          </section>

          <Separator />

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Reviews ({product.totalReviews})</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Write a Review
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 p-4 sm:p-6 rounded-xl border bg-card">
              <div className="text-center shrink-0">
                <div className="text-4xl font-bold text-foreground">{product.averageRating.toFixed(1)}</div>
                <StarRating rating={product.averageRating} size="md" />
                <p className="text-xs text-muted-foreground mt-1">{product.totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = product.totalReviews > 0 ? Math.round((product.totalReviews / star) * 10) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-right text-muted-foreground">{star}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <span className="w-8 text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCard
                  key={i}
                  review={{
                    id: `review-${i}`,
                    rating: 4 + (i % 2),
                    comment: "Great product! Fresh and well packed. Will definitely order again.",
                    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
                    user: { firstName: "User", lastName: String(i + 1) },
                  }}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {relatedProducts && relatedProducts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4">Related Products</h2>
              <div className="space-y-3">
                {relatedProducts.slice(0, 4).map((rp) => {
                  const img = rp.images.find((i) => i.isPrimary)?.url || rp.images[0]?.url || "";
                  return (
                    <Link
                      key={rp.id}
                      href={`/products/${rp.slug}`}
                      className="flex gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                    >
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {img ? <Image src={optimizeImageUrl(img, 128)} alt={rp.name} fill className="object-cover" sizes="64px" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{rp.name}</p>
                        <p className="text-sm font-bold mt-1">{formatPrice(rp.sellingPrice)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {frequentlyBought && frequentlyBought.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4">Frequently Bought Together</h2>
              <div className="space-y-3">
                {frequentlyBought.slice(0, 3).map((fb) => {
                  const img = fb.images.find((i) => i.isPrimary)?.url || fb.images[0]?.url || "";
                  return (
                    <div key={fb.id} className="flex gap-3 p-3 rounded-xl border bg-card">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {img ? <Image src={optimizeImageUrl(img, 128)} alt={fb.name} fill className="object-cover" sizes="64px" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{fb.name}</p>
                        <p className="text-sm text-muted-foreground">{fb.unit}</p>
                        <p className="text-sm font-bold mt-1">{formatPrice(fb.sellingPrice)}</p>
                      </div>
                      <Button size="icon" variant="outline" className="shrink-0 self-center h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6">More Products Like This</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {relatedProducts.map((rp) => {
              const img = rp.images.find((i) => i.isPrimary)?.url || rp.images[0]?.url || "";
              return (
                <Link
                  key={rp.id}
                  href={`/products/${rp.slug}`}
                  className="group shrink-0 w-44 rounded-xl border hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square rounded-t-xl overflow-hidden bg-muted">
                    {img ? <Image src={optimizeImageUrl(img, 300)} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="176px" /> : null}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{rp.name}</p>
                    <p className="text-sm font-bold mt-1">{formatPrice(rp.sellingPrice)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
