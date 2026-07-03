"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800",
  PICKED: "bg-purple-100 text-purple-800",
  IN_TRANSIT: "bg-orange-100 text-orange-800",
  OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-800",
  DELIVERED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

const mockDeliveries = [
  { id: "1", orderNo: "ORD-ABC123", customer: "John Doe", address: "123 Main St, Mumbai", status: "ASSIGNED", date: new Date().toISOString() },
  { id: "2", orderNo: "ORD-DEF456", customer: "Jane Smith", address: "456 Park Ave, Mumbai", status: "OUT_FOR_DELIVERY", date: new Date().toISOString() },
  { id: "3", orderNo: "ORD-GHI789", customer: "Bob Wilson", address: "789 Oak Rd, Mumbai", status: "DELIVERED", date: new Date(Date.now() - 86400000).toISOString() },
];

const tabs = ["All", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");

  const filtered = activeTab === "All" ? mockDeliveries : mockDeliveries.filter((d) => d.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Deliveries</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9 w-64" />
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {tab === "All" ? "All" : tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No deliveries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/delivery/deliveries/${delivery.id}`} className="font-semibold hover:text-brand-600">
                        {delivery.orderNo}
                      </Link>
                      <Badge className={statusColors[delivery.status]}>{delivery.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{delivery.customer}</p>
                    <p className="text-sm text-muted-foreground">{delivery.address}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(delivery.date)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/delivery/deliveries/${delivery.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    {delivery.status === "OUT_FOR_DELIVERY" && (
                      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">Mark Delivered</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Enter Delivery OTP</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center text-2xl tracking-widest" />
                            <Button className="w-full" disabled={otp.length < 4}>Verify & Complete</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
