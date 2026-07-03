"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSheet({ open, onClose }: CartSheetProps) {
  const { items, removeItem, updateQuantity, subtotal, deliveryCharge, total } =
    useCartStore();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />

          <motion.div
            initial={{ translateX: "100%" }}
            animate={{ translateX: 0 }}
            exit={{ translateX: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-950 z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-500" />
                <span className="font-semibold text-lg">Your Cart</span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Add items to get started with your delivery
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-brand-500 text-white rounded-full font-medium hover:bg-brand-600 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-800">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.unit || "1 pc"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="flex items-center justify-center h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="flex items-center justify-center h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              &#8377;{item.price * item.quantity}
                            </p>
                            {item.mrp && item.mrp > item.price && (
                              <p className="text-[10px] text-gray-400 line-through">
                                &#8377;{item.mrp * item.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="self-start text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">
                        &#8377;{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery Charge</span>
                      <span className="font-medium">
                        {deliveryCharge === 0 ? (
                          <span className="text-brand-500">FREE</span>
                        ) : (
                          `\u20B9${deliveryCharge.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-1.5 border-t border-gray-200 dark:border-gray-800">
                      <span>Total</span>
                      <span>&#8377;{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/cart"
                      onClick={onClose}
                      className="flex-1 text-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      View Cart
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className="flex-1 text-center px-4 py-2.5 bg-brand-500 text-white rounded-full text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
