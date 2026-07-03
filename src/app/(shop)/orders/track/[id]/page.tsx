"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, Truck, MapPin, Package, ArrowLeft, Phone, User, KeyRound, Loader2 } from "lucide-react";
import { orderService } from "@/services/order.service";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PACKED", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"];

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const isCancelled = currentStatus === "CANCELLED" || currentStatus === "RETURNED";

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  isPast || isCancelled
                    ? "border-green-500 bg-green-500 text-white"
                    : isCurrent
                    ? "border-primary bg-primary text-primary-foreground animate-pulse"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                }`}
              >
                {isPast || isCancelled ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className={`h-2 w-2 rounded-full ${isCurrent ? "bg-current" : "bg-muted-foreground/50"}`} />
                )}
              </div>
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    isPast || (isCancelled && index < currentIndex)
                      ? "bg-green-500"
                      : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 ${isFuture ? "opacity-40" : ""}`}>
              <p className="text-sm font-medium">{ORDER_STATUS_MAP[step]?.label || step}</p>
              {isCurrent && !isCancelled && (
                <p className="text-xs text-muted-foreground">Current</p>
              )}
            </div>
          </div>
        );
      })}
      {(currentStatus === "CANCELLED" || currentStatus === "RETURNED") && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-red-500 text-white">
              <span className="text-xs font-bold">!</span>
            </div>
          </div>
          <div className="pb-6">
            <p className="text-sm font-medium text-red-500">{ORDER_STATUS_MAP[currentStatus]?.label || currentStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TrackSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-track", id],
    queryFn: () => orderService.findById(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TrackSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-sm text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const deliveryPartner = (order as any).deliveryPartner as { name?: string; phone?: string } | undefined;
  const otp = (order as any).otp as string | undefined;
  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="text-sm text-muted-foreground">Order #{order.orderNo}</p>
        </div>
        <div className="ml-auto">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Delivery Status</h2>
              <StatusStepper currentStatus={order.status} />
            </CardContent>
          </Card>

          {deliveryPartner && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Delivery Partner</h2>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{deliveryPartner.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${deliveryPartner.phone}`} className="text-sm text-primary hover:underline">
                        {deliveryPartner.phone || "N/A"}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {otp && (order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Delivery OTP</h2>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <KeyRound className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Share this OTP with the delivery partner</p>
                    <p className="text-3xl font-bold tracking-[0.25em] text-amber-600">{otp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Order Items ({order.items.length})</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.sellingPrice)} each</p>
                      <p className="text-sm font-semibold mt-1">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-3">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {order.address.label && (
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mb-1">
                      {order.address.label}
                    </span>
                  )}
                  <p className="font-medium text-sm">{order.address.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.address.phone}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.address.line1}
                    {order.address.line2 ? `, ${order.address.line2}` : ""}
                    {order.address.landmark ? `, ${order.address.landmark}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Order Details</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order No</span>
                  <span className="font-medium">#{order.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Placed on</span>
                  <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                </div>
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivered on</span>
                    <span className="font-medium">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Price Breakdown</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="font-medium">{formatPrice(order.deliveryCharge || 0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/orders/${order.id}`}>
              <Package className="h-4 w-4 mr-2" />
              View Order Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
