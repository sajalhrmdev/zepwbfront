"use client";

import { useCallback, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Product } from "@/types";

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

const RATING_OPTIONS = [4, 3, 2, 1];

function ProductCard({ product, index }: { product: Product; index: number }) {
  const primaryImage = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || "";
  const discount = calculateDiscount(product.mrp, product.sellingPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link
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
    </motion.div>
  );
}

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

function FiltersSidebar({
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  categories,
  brands,
}: {
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (v: { min: number; max: number } | null) => void;
  minRating: number | null;
  setMinRating: (v: number | null) => void;
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedCategories([...selectedCategories, cat.slug]);
                  else setSelectedCategories(selectedCategories.filter((s) => s !== cat.slug));
                }}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-3">Brand</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedBrands([...selectedBrands, brand]);
                    else setSelectedBrands(selectedBrands.filter((s) => s !== brand));
                  }}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-sm mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="priceRange"
                checked={priceRange?.min === range.min && priceRange?.max === range.max}
                onChange={() => setPriceRange(priceRange?.min === range.min ? null : { min: range.min, max: range.max })}
                className="accent-green-600"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3">Rating</h4>
        <div className="space-y-2">
          {RATING_OPTIONS.map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(minRating === rating ? null : rating)}
                className="accent-green-600"
              />
              <span className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-muted-foreground">& up</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setSelectedBrands([]);
          setPriceRange(null);
          setMinRating(null);
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.page === undefined && !updates.hasOwnProperty("page")) {
        params.set("page", "1");
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.findAll(),
  });

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (sort) params.sort = sort;
    if (selectedCategories.length) params.category = selectedCategories.join(",");
    if (selectedBrands.length) params.brand = selectedBrands.join(",");
    if (priceRange) {
      params.minPrice = String(priceRange.min);
      params.maxPrice = String(priceRange.max);
    }
    if (minRating) params.minRating = String(minRating);
    params.page = String(page);
    params.limit = "20";
    return params;
  }, [debouncedSearch, sort, selectedCategories, selectedBrands, priceRange, minRating, page]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productService.findAll(queryParams),
  });

  const brands = useMemo(() => {
    if (!productsData?.data) return [];
    const brandSet = new Set<string>();
    productsData.data.forEach((p) => {
      if (p.brand?.name) brandSet.add(p.brand.name);
    });
    return Array.from(brandSet);
  }, [productsData]);

  const handleSortChange = (value: string) => {
    updateParams({ sort: value === "popular" ? undefined : value, page: "1" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          {productsData && (
            <p className="text-sm text-muted-foreground mt-1">{productsData.meta.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                updateParams({ search: e.target.value, page: "1" });
              }}
              className="pl-9 pr-8"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  updateParams({ search: undefined, page: "1" });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={sort} onValueChange={handleSortChange}>
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
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
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
          <FiltersSidebar
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            categories={categoriesData || []}
            brands={brands}
          />
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
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedBrands([]);
                  setPriceRange(null);
                  setMinRating(null);
                  setSearchInput("");
                  router.push("/products");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsData.data.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {productsData.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!productsData.meta.hasPrevPage}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: productsData.meta.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === productsData.meta.totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateParams({ page: String(p) })}
                        >
                          {p}
                        </Button>
                      </span>
                    ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!productsData.meta.hasNextPage}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
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
