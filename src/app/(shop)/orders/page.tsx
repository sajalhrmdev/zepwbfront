"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { optimizeImageUrl } from "@/lib/cloudinary";
import { Package, ChevronLeft, ChevronRight, Eye, Truck, XCircle, RotateCcw } from "lucide-react";
import { orderService } from "@/services/order.service";
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/empty-state";
import type { Order } from "@/types";

const TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

function OrderCard({ order }: { order: Order }) {
  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800" };
  const paymentInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || { label: order.paymentStatus, color: "bg-gray-100 text-gray-800" };
  const visibleItems = order.items.slice(0, 3);
  const remainingCount = order.items.length - 3;

  return (
    <Link href={`/orders/${order.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card hover:shadow-md transition-shadow"
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order #{order.orderNo}</p>
              <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentInfo.color}`}>
                {paymentInfo.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {visibleItems.map((item) => (
                <div key={item.id} className="relative h-12 w-12 rounded-lg border-2 border-background overflow-hidden bg-muted">
                  {item.image ? (
                    <Image src={optimizeImageUrl(item.image, 96)} alt={item.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="flex items-center justify-center h-12 w-12 rounded-lg border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                  +{remainingCount}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
            <div>
              <span className="text-lg font-bold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/${order.id}`}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View Details
                </Link>
              </Button>
              {order.status === "OUT_FOR_DELIVERY" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/track/${order.id}`}>
                    <Truck className="h-3.5 w-3.5 mr-1" />
                    Track Order
                  </Link>
                </Button>
              )}
              {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Cancel Order
                </Button>
              )}
              {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Order Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-6">
          <div className="flex justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-12 w-12 rounded-lg" />
            ))}
          </div>
          <div className="flex justify-between pt-3 border-t">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "10" };
  if (activeTab) params.status = activeTab;

  const { data, isLoading } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.findAll(params),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setPage(1); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <OrdersSkeleton />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Looks like you haven't placed any orders yet. Start shopping now!"
          actionLabel="Start Shopping"
          onAction={() => router.push("/products")}
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                disabled={!data.meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === data.meta.totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                    <Button
                      variant={p === page ? "default" : "outline"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button
                variant="outline"
                size="icon"
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
