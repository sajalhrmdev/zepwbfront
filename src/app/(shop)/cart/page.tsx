"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ShoppingBag, Minus, Plus, Trash2, Tag, ArrowLeft } from "lucide-react";
import { optimizeImageUrl } from "@/lib/cloudinary";
import { cartService } from "@/services/cart.service";
import { useCartStore, useCartComputed } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import EmptyState from "@/components/empty-state";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, appliedCoupon, setCoupon, removeCoupon } = useCartStore();
  const { subtotal, totalDiscount, deliveryCharge, platformFee, packingCharge, total, itemCount } = useCartComputed();
  const [couponCode, setCouponCode] = useState("");

  const { mutate: applyCouponMutate, isPending: couponApplying } = useMutation({
    mutationFn: () => cartService.applyCoupon(couponCode),
    onSuccess: (cart) => {
      if (cart.coupon) {
        setCoupon(cart.coupon.code, cart.coupon.discount);
        toast.success(`Coupon "${cart.coupon.code}" applied!`);
      }
      setCouponCode("");
    },
    onError: () => toast.error("Invalid or expired coupon"),
  });

  const { mutate: removeCouponMutate } = useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: () => {
      removeCoupon();
      toast.success("Coupon removed");
    },
    onError: () => toast.error("Failed to remove coupon"),
  });

  const { mutate: removeItemMutate } = useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onError: () => toast.error("Failed to remove item"),
  });

  const debouncedUpdate = useCallback(
    (() => {
      let timeout: ReturnType<typeof setTimeout>;
      return (itemId: string, qty: number) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          cartService.updateItem(itemId, qty).catch(() => toast.error("Failed to update quantity"));
        }, 500);
      };
    })(),
    []
  );

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet. Start shopping now!"
          actionLabel="Start Shopping"
          onAction={() => router.push("/products")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
        </div>
        <Link href="/products" className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 rounded-xl border bg-card"
            >
              <Link href={`/products/${item.productId}`} className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                {item.image ? (
                  <Image src={optimizeImageUrl(item.image, 192)} alt={item.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No img</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`} className="font-medium text-sm hover:text-green-600 transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{item.unit}</p>
                <p className="text-sm font-semibold mt-1">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex items-center justify-center h-8 w-8 rounded-full border hover:bg-accent transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex items-center justify-center h-8 w-8 rounded-full border hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => {
                        if (window.confirm("Remove this item from cart?")) {
                          removeItem(item.productId);
                        }
                      }}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className={`font-medium ${deliveryCharge === 0 ? "text-green-600" : ""}`}>
                  {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Packing Charge</span>
                <span className="font-medium">{formatPrice(packingCharge)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon: {appliedCoupon}</span>
                  <span className="font-medium">-{formatPrice(0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300">{appliedCoupon}</span>
                  </div>
                  <button
                    onClick={() => removeCouponMutate()}
                    className="text-red-500 hover:text-red-600 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => applyCouponMutate()}
                    disabled={!couponCode || couponApplying}
                  >
                    {couponApplying ? "..." : "Apply"}
                  </Button>
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
