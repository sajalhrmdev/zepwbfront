"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart.store";

export default function CartButton() {
  const { items, total } = useCartStore();
  const [pulse, setPulse] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (cartCount > prevCount) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden">
      <Link
        href="/cart"
        className="relative flex items-center gap-2 bg-brand-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-brand-600 transition-colors"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          <AnimatePresence>
            {pulse && (
              <motion.span
                initial={{ scale: 1.5, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full bg-brand-400"
              />
            )}
          </AnimatePresence>
        </div>
        <span className="font-medium text-sm">&#8377;{total.toFixed(0)}</span>
        <span className="flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-bold bg-white text-brand-600 rounded-full">
          {cartCount}
        </span>
      </Link>
    </div>
  );
}
