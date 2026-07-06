"use client";

import Link from "next/link";
import Image from "next/image";
import { optimizeImageUrl } from "@/lib/cloudinary";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:scale-[1.02] transition-all duration-200"
    >
      {category.icon && (
        <span className="text-4xl">{category.icon}</span>
      )}
      {category.image && !category.icon && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            src={optimizeImageUrl(category.image, 128)}
            alt={category.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
        {category.name}
      </span>
    </Link>
  );
}
