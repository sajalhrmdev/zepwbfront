"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Truck, XCircle, RotateCcw, MapPin, Download, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { orderService } from "@/services/order.service";
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP } from "@/lib/constants";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Order } from "@/types";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
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
              <p className="text-sm font-medium">
                {ORDER_STATUS_MAP[step]?.label || step}
              </p>
              {isCurrent && !isCancelled && (
                <p className="text-xs text-muted-foreground">Current</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.findById(id),
  });

  const { mutate: cancelOrder, isPending: cancelling } = useMutation({
    mutationFn: (reason: string) => orderService.cancelOrder(id, reason),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      router.refresh();
    },
    onError: () => toast.error("Failed to cancel order"),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OrderDetailSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-sm text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800" };
  const paymentInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || { label: order.paymentStatus, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNo}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDateTime(order.createdAt)}</p>
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
              <h2 className="font-semibold text-lg mb-4">Order Status</h2>
              <StatusTimeline currentStatus={order.status} />
            </CardContent>
          </Card>

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
              <h2 className="font-semibold text-lg mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{order.paymentMethod || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${paymentInfo.color}`}>
                    {paymentInfo.label}
                  </span>
                </div>
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
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {order.status === "OUT_FOR_DELIVERY" && (
              <Button asChild>
                <Link href={`/orders/track/${order.id}`}>
                  <Truck className="h-4 w-4 mr-2" />
                  Track Order
                </Link>
              </Button>
            )}
            {(order.status === "PENDING" || order.status === "CONFIRMED") && (
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = window.prompt("Reason for cancellation (optional):");
                  if (reason !== null) cancelOrder(reason || "Cancelled by customer");
                }}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancel Order
              </Button>
            )}
            {order.status === "DELIVERED" && (
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Return
              </Button>
            )}
            {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Order Again
              </Button>
            )}
            <Button variant="outline" className="gap-2" onClick={() => orderService.downloadInvoice(order.id)}>
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
