"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageOpen } from "lucide-react";
import { optimizeImageUrl } from "@/lib/cloudinary";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.findAll(),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No categories found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-4 sm:p-6 rounded-xl border bg-card hover:shadow-lg hover:border-green-200 dark:hover:border-green-800 transition-all"
          >
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted group-hover:scale-110 transition-transform">
              {cat.image ? (
                <Image src={optimizeImageUrl(cat.image, 192)} alt={cat.name} fill className="object-cover" sizes="(max-width: 640px) 80px, 96px" />
              ) : (
                <div className="h-full flex items-center justify-center text-3xl">{cat.icon}</div>
              )}
            </div>
            <span className="text-sm font-medium text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
