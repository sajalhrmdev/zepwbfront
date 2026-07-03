"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Plus, Pencil, Trash2, Star, Loader2, LogOut } from "lucide-react";
import { userService } from "@/services/user.service";
import { addressService } from "@/services/address.service";
import { useAuth } from "@/contexts/auth-context";
import { getInitials, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Address } from "@/types";

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, router]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.findAll(),
    enabled: isAuthenticated,
  });

  const displayUser = profile || user;

  const personalForm = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      gender: "",
    },
  });

  useEffect(() => {
    if (displayUser) {
      personalForm.reset({
        firstName: displayUser.firstName || "",
        lastName: displayUser.lastName || "",
        phone: displayUser.phone || "",
        gender: displayUser.gender || "",
      });
    }
  }, [displayUser, personalForm]);

  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: (data: { firstName: string; lastName?: string; phone: string; gender?: string }) =>
      userService.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordForm = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      passwordForm.reset();
    },
    onError: () => toast.error("Failed to change password"),
  });

  const onPasswordSubmit = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  };

  const { mutate: deleteAddress } = useMutation({
    mutationFn: (id: string) => addressService.delete(id),
    onSuccess: () => {
      toast.success("Address deleted");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to delete address"),
  });

  const { mutate: setDefaultAddress } = useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => {
      toast.success("Default address updated");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to set default address"),
  });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const addressForm = useForm({
    defaultValues: {
      label: "", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", isDefault: false,
    },
  });

  const openAddAddress = () => {
    setEditingAddress(null);
    addressForm.reset({
      label: "", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", isDefault: false,
    });
    setAddressModalOpen(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset({
      label: address.label || "",
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      landmark: address.landmark || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setAddressModalOpen(true);
  };

  const { mutate: createAddress, isPending: creatingAddress } = useMutation({
    mutationFn: (data: Partial<Address>) => addressService.create(data),
    onSuccess: () => {
      toast.success("Address added");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setAddressModalOpen(false);
    },
    onError: () => toast.error("Failed to add address"),
  });

  const { mutate: updateAddress, isPending: updatingAddress } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) => addressService.update(id, data),
    onSuccess: () => {
      toast.success("Address updated");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setAddressModalOpen(false);
    },
    onError: () => toast.error("Failed to update address"),
  });

  const onAddressSubmit = (data: Partial<Address>) => {
    if (editingAddress) {
      updateAddress({ id: editingAddress.id, data });
    } else {
      createAddress(data);
    }
  };

  const isSavingAddress = creatingAddress || updatingAddress;

  if (!isAuthenticated) return null;

  if (profileLoading) return <ProfileSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {displayUser?.avatar ? (
              <AvatarImage src={displayUser.avatar} alt={displayUser.firstName} />
            ) : null}
            <AvatarFallback className="text-lg">{displayUser ? getInitials(`${displayUser.firstName} ${displayUser.lastName || ""}`) : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{displayUser?.firstName} {displayUser?.lastName}</h1>
            <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={personalForm.handleSubmit((data) => updateProfile(data))}
                className="space-y-4 max-w-md"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...personalForm.register("firstName", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...personalForm.register("lastName")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={displayUser?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...personalForm.register("phone", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={personalForm.watch("gender")}
                    onValueChange={(v) => personalForm.setValue("gender", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={updatingProfile}>
                  {updatingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register("newPassword", { required: true, minLength: 6 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword", { required: true })} />
                </div>
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              <Button size="sm" onClick={openAddAddress}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>

            {addressesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : !addresses || addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No addresses saved</h3>
                <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout</p>
                <Button onClick={openAddAddress}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {address.label && (
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{address.label}</Badge>
                            )}
                            {address.isDefault && (
                              <Badge className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">Default</Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm">{address.fullName}</p>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.line1}{address.line2 ? `, ${address.line2}` : ""}
                            {address.landmark ? `, ${address.landmark}` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {!address.isDefault && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDefaultAddress(address.id)} title="Set as default">
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAddress(address)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (window.confirm("Delete this address?")) deleteAddress(address.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addr-label">Label</Label>
              <Select value={addressForm.watch("label")} onValueChange={(v) => addressForm.setValue("label", v)}>
                <SelectTrigger id="addr-label">
                  <SelectValue placeholder="Select label (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-fullName">Full Name</Label>
                <Input id="addr-fullName" {...addressForm.register("fullName", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-phone">Phone</Label>
                <Input id="addr-phone" {...addressForm.register("phone", { required: true })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-line1">Address Line 1</Label>
              <Input id="addr-line1" {...addressForm.register("line1", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-line2">Address Line 2</Label>
                <Input id="addr-line2" {...addressForm.register("line2")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-landmark">Landmark</Label>
                <Input id="addr-landmark" {...addressForm.register("landmark")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-city">City</Label>
                <Input id="addr-city" {...addressForm.register("city", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-state">State</Label>
                <Input id="addr-state" {...addressForm.register("state", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-pincode">Pincode</Label>
                <Input id="addr-pincode" {...addressForm.register("pincode", { required: true })} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={isSavingAddress}>
                {isSavingAddress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setAddressModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
