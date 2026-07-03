"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, MapPin, Phone, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusSteps = ["ASSIGNED", "PICKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
const mockDelivery = {
  id: "1",
  orderNo: "ORD-ABC123",
  status: "OUT_FOR_DELIVERY",
  customer: "John Doe",
  phone: "+91 9876543210",
  address: "123, Main Street, Apartment 4B, Mumbai - 400001",
  items: [
    { name: "Fresh Tomatoes", qty: 2, price: 30 },
    { name: "Full Cream Milk", qty: 1, price: 64 },
    { name: "Banana", qty: 1, price: 49 },
  ],
  total: 173,
  date: new Date().toISOString(),
};

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [signature, setSignature] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const currentStepIndex = statusSteps.indexOf(mockDelivery.status);

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mockDelivery.orderNo}</h1>
        <Badge className="bg-orange-100 text-orange-800">{mockDelivery.status.replace(/_/g, " ")}</Badge>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle>Delivery Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, i) => {
              const completed = i <= currentStepIndex;
              const current = i === currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-3">
                  {completed ? <CheckCircle2 className={`h-5 w-5 ${current ? "text-brand-600 animate-pulse" : "text-green-600"}`} /> : <Circle className="h-5 w-5 text-gray-300" />}
                  <span className={completed ? "font-medium" : "text-muted-foreground"}>{step.replace(/_/g, " ")}</span>
                  {current && <span className="text-xs text-brand-600 font-medium">Current</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{mockDelivery.customer}</div>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{mockDelivery.phone}</div>
          <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />{mockDelivery.address}</div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
        <CardContent>
          {mockDelivery.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2">
              <span>{item.name} x{item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-bold"><span>Total</span><span>₹{mockDelivery.total}</span></div>
        </CardContent>
      </Card>

      {/* Delivery Actions */}
      <Card>
        <CardHeader><CardTitle>Delivery Action</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {mockDelivery.status === "OUT_FOR_DELIVERY" && (
            <>
              <div>
                <label className="text-sm font-medium">Delivery OTP</label>
                <Input placeholder="Enter OTP from customer" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center text-2xl tracking-widest mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Signature (Optional)</label>
                <Input placeholder="Customer name as signature" value={signature} onChange={(e) => setSignature(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Proof of Delivery Image URL (Optional)</label>
                <Input placeholder="https://..." value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} className="mt-1" />
              </div>
              <Button className="w-full" disabled={otp.length < 4}>Mark as Delivered</Button>
            </>
          )}
          {mockDelivery.status === "ASSIGNED" && <Button className="w-full">Mark as Picked Up</Button>}
          {mockDelivery.status === "PICKED" && <Button className="w-full">Mark as Out for Delivery</Button>}
          {mockDelivery.status === "DELIVERED" && <p className="text-center text-green-600 font-medium">✓ Delivered on {formatDate(mockDelivery.date)}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
