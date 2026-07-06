"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Building2,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { addressService } from "@/services/address.service";
import { cartService } from "@/services/cart.service";
import { useCartStore, useCartComputed } from "@/store/cart.store";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { toast } from "sonner";
import type { Address } from "@/types";

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", icon: Banknote, description: "Pay when you receive" },
  { id: "UPI", label: "UPI", icon: Smartphone, description: "Google Pay, PhonePe, Paytm" },
  { id: "CARD", label: "Credit / Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
  { id: "NET_BANKING", label: "Net Banking", icon: Building2, description: "All major banks" },
  { id: "WALLET", label: "Wallet", icon: Wallet, description: "Zep Wallet balance" },
];

const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning", time: "7:00 AM - 11:00 AM" },
  { id: "afternoon", label: "Afternoon", time: "11:00 AM - 3:00 PM" },
  { id: "evening", label: "Evening", time: "3:00 PM - 7:00 PM" },
  { id: "night", label: "Night", time: "7:00 PM - 10:00 PM" },
];

interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyAddressForm: AddressFormData = {
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        selected
          ? "border-green-500 bg-green-50 dark:bg-green-900/10 ring-1 ring-green-500"
          : "border-input hover:border-green-500"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {selected && <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />}
          <div>
            {address.label && (
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mb-1">
                {address.label}
              </span>
            )}
            <p className="font-medium text-sm">{address.fullName}</p>
            <p className="text-sm text-muted-foreground">{address.phone}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              {address.landmark ? `, ${address.landmark}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, clearCart } = useCartStore();
  const { subtotal, deliveryCharge, platformFee, packingCharge, total } = useCartComputed();
  const { appliedCoupon } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("COD");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddressForm);
  const [step, setStep] = useState(1);

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.findAll(),
    enabled: isAuthenticated,
  });

  const { mutate: createAddress, isPending: addressCreating } = useMutation({
    mutationFn: (data: Partial<Address>) => addressService.create(data),
    onSuccess: (newAddress) => {
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
      toast.success("Address added!");
    },
    onError: () => toast.error("Failed to add address"),
  });

  const { mutate: createOrder, isPending: orderCreating } = useMutation({
    mutationFn: () =>
      orderService.create({
        addressId: selectedAddressId!,
        paymentMethod: selectedPayment,
        couponCode: appliedCoupon || undefined,
        deliverySlot: selectedSlot || undefined,
      }),
    onSuccess: (order) => {
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${order.id}`);
    },
    onError: () => toast.error("Failed to place order. Please try again."),
  });

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  if (items.length === 0) {
    router.push("/products");
    return null;
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    createAddress(addressForm);
  };

  const canPlaceOrder = selectedAddressId && selectedPayment;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

      <div className="flex items-center gap-2 mb-8">
        {[
          { num: 1, label: "Address" },
          { num: 2, label: "Delivery" },
          { num: 3, label: "Payment" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                step >= s.num ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {s.num < 3 && <Separator className="w-8 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold text-lg">Delivery Address</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressForm(true)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </div>

            {addressesLoading ? (
              <div className="text-sm text-muted-foreground py-4">Loading addresses...</div>
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selected={selectedAddressId === addr.id}
                    onSelect={() => setSelectedAddressId(addr.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No saved addresses</p>
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                  Add Address
                </Button>
              </div>
            )}

            {selectedAddressId && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            )}
          </div>

          {step >= 2 && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold text-lg mb-4">Delivery Slot</h2>
              <p className="text-sm text-muted-foreground mb-4">Choose a preferred delivery time (optional)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DELIVERY_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      selectedSlot === slot.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/10 ring-1 ring-green-500"
                        : "border-input hover:border-green-500"
                    }`}
                  >
                    <p className="font-medium text-sm">{slot.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{slot.time}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>Back</Button>
                <Button size="sm" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedPayment === method.id
                          ? "border-green-500 bg-green-50 dark:bg-green-900/10 ring-1 ring-green-500"
                          : "border-input hover:border-green-500"
                      }`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Icon className="h-6 w-6 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>Back</Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => setCouponOpen(!couponOpen)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-medium text-sm">Have a coupon?</span>
              {couponOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {couponOpen && (
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter coupon code" className="flex-1" />
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-2.5 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="text-muted-foreground truncate max-w-[180px]">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
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
            </div>

            <Separator />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              size="lg"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              disabled={!canPlaceOrder || orderCreating}
              onClick={() => createOrder()}
            >
              {orderCreating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Fill in the details for your delivery address.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="Home, Office, etc."
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="711101"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                placeholder="Flat / House No., Building"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                placeholder="Street, Area"
                value={addressForm.line2}
                onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                placeholder="Near..."
                value={addressForm.landmark}
                onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Howrah"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addressCreating}>
                {addressCreating ? "Saving..." : "Save Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
