"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star, SlidersHorizontal, X, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category, Product } from "@/types";

const SORT_OPTIONS = [
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Popular", value: "popular" },
];

const PRICE_RANGES = [
  { label: "Under ₹100", min: 0, max: 100 },
  { label: "₹100 - ₹250", min: 100, max: 250 },
  { label: "₹250 - ₹500", min: 250, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "Above ₹1000", min: 1000, max: Infinity },
];

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="mt-3 space-y-2 px-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-32 mb-6" />
      <ProductGridSkeleton />
    </div>
  );
}

export default function CategoryProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.findAll(),
  });

  const category = useMemo(() => {
    if (!categories) return undefined;
    return categories.find((c: Category) => c.slug === slug);
  }, [categories, slug]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    params.category = slug;
    if (debouncedSearch) params.search = debouncedSearch;
    if (sort) params.sort = sort;
    if (priceRange) {
      params.minPrice = String(priceRange.min);
      params.maxPrice = String(priceRange.max);
    }
    params.page = String(page);
    params.limit = "20";
    return params;
  }, [slug, debouncedSearch, sort, priceRange, page]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["category-products", queryParams],
    queryFn: () => productService.findAll(queryParams),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{category?.name || "Category"}</h1>
        {category?.image && (
          <div className="relative h-48 rounded-xl overflow-hidden mt-4 mb-6">
            <Image src={category.image} alt={category.name} fill className="object-cover" />
          </div>
        )}
        {productsData && (
          <p className="text-sm text-muted-foreground mt-1">{productsData.meta.total} products found</p>
        )}
      </div>

      {category?.children && category.children.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in this category..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-8">
        <aside className={`${mobileFiltersOpen ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:p-0" : "hidden"} lg:block w-64 shrink-0`}>
          {mobileFiltersOpen && (
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="font-semibold text-lg">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Price Range</h4>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange?.min === range.min && priceRange?.max === range.max}
                      onChange={() => { setPriceRange(priceRange?.min === range.min ? null : { min: range.min, max: range.max }); setPage(1); }}
                      className="accent-green-600"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => { setPriceRange(null); setSort(""); setSearchInput(""); setPage(1); }}
            >
              Clear All Filters
            </Button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : !productsData || productsData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
                Try adjusting your filters or search term
              </p>
              <Button variant="outline" onClick={() => { setPriceRange(null); setSearchInput(""); setPage(1); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsData.data.map((product: Product) => {
                  const primaryImage = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || "";
                  const discount = calculateDiscount(product.mrp, product.sellingPrice);
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group block bg-card rounded-xl overflow-hidden border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-muted">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No image</div>
                        )}
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{product.unit}</p>
                        {product.averageRating > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-foreground">{product.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({product.totalReviews})</span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-bold text-foreground">{formatPrice(product.sellingPrice)}</span>
                          {product.mrp > product.sellingPrice && (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                              <span className="text-[10px] font-medium text-green-600">{discount}% off</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {productsData.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button variant="outline" size="icon" disabled={!productsData.meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: productsData.meta.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === productsData.meta.totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                        <Button variant={p === page ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setPage(p)}>
                          {p}
                        </Button>
                      </span>
                    ))}
                  <Button variant="outline" size="icon" disabled={!productsData.meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
