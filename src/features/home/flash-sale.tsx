"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { optimizeImageUrl } from "@/lib/cloudinary";
import { Product } from "@/types";

function CountdownTimer({ targetDate }: { targetDate?: string }) {
  const calcRemaining = useCallback(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [remaining, setRemaining] = useState(calcRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setRemaining(calcRemaining());
    intervalRef.current = setInterval(() => {
      setRemaining(calcRemaining());
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calcRemaining]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex gap-1.5">
      {[
        { label: "Days", value: remaining.days },
        { label: "Hours", value: remaining.hours },
        { label: "Mins", value: remaining.minutes },
        { label: "Secs", value: remaining.seconds },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600 text-sm font-bold text-white md:h-10 md:w-10 md:text-base">
            {pad(unit.value)}
          </div>
          <span className="mt-0.5 text-[10px] text-muted-foreground">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function FlashSaleCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
  const sold = Math.floor(Math.random() * 80) + 10;
  const total = 100;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group space-y-2 rounded-lg border p-2 transition-shadow hover:shadow-md md:p-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {primaryImage ? (
          <Image
            src={optimizeImageUrl(primaryImage, 400)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
          -{product.discount}%
        </span>
      </div>
      <div>
        <p className="truncate text-sm font-medium">{product.name}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold text-red-500">
            {formatPrice(product.flashSalePrice ?? product.sellingPrice)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(product.mrp)}
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <Progress value={(sold / total) * 100} className="h-2 bg-red-100" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-red-500">{sold}</span> sold out of {total}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function FlashSale() {
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "flashSale"],
    queryFn: () => productService.getFlashSale(),
  });

  if (isLoading) {
    return (
      <section className="rounded-xl border border-red-100 bg-red-50/50 p-4 md:p-6">
        <SectionHeader title="Flash Sale">
          <Zap className="h-6 w-6 text-red-500" />
        </SectionHeader>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-red-100 bg-red-50/50 p-4 md:p-6">
        <SectionHeader title="Flash Sale">
          <Zap className="h-6 w-6 text-red-500" />
        </SectionHeader>
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <p>Failed to load flash sale</p>
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

  const endDate = products.find((p) => p.flashSaleEnds)?.flashSaleEnds;

  return (
    <section className="rounded-xl border border-red-100 bg-red-50/50 p-4 md:p-6">
      <SectionHeader title="Flash Sale">
        <Zap className="h-6 w-6 text-red-500" />
      </SectionHeader>
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm text-muted-foreground">Limited time offers ending soon</p>
        {endDate && <CountdownTimer targetDate={endDate} />}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <FlashSaleCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
