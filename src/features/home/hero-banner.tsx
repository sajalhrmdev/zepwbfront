"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    title: "Fresh Groceries Delivered in Minutes",
    subtitle: "Shop from the best local stores near you",
    cta: "Shop Now",
    href: "/products",
    gradient: "from-green-600 via-green-500 to-emerald-400",
  },
  {
    title: "Summer Special - 20% Off",
    subtitle: "On all fresh fruits & vegetables",
    cta: "Explore Offers",
    href: "/products?discount=true",
    gradient: "from-orange-600 via-orange-500 to-amber-400",
  },
  {
    title: "Farm Fresh, Direct to Your Door",
    subtitle: "Support local farmers with every purchase",
    cta: "Order Now",
    href: "/products?category=fresh-produce",
    gradient: "from-purple-600 via-purple-500 to-violet-400",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function HeroBanner() {
  const [[current, direction], setSlide] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const goTo = useCallback(
    (index: number) => {
      setSlide(([prev]) => {
        const dir = index > prev ? 1 : -1;
        return [index, dir];
      });
    },
    []
  );

  const next = useCallback(() => {
    setSlide(([prev]) => {
      const nextIndex = (prev + 1) % slides.length;
      return [nextIndex, 1];
    });
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(300px, 50vw, 400px)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r ${slides[current].gradient} text-white`}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-4 text-3xl font-bold drop-shadow-sm md:text-4xl lg:text-5xl"
            >
              {slides[current].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-8 text-base opacity-90 md:text-lg"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <Link
                href={slides[current].href}
                className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-105"
              >
                {slides[current].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? "w-8 bg-white" : "w-2.5 bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
