"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { User } from "lucide-react";

export default function DeliveryProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="h-8 w-8 text-brand-600" />
            </div>
            <div>
              <CardTitle>{user?.firstName} {user?.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">First Name</label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Last Name</label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div><label className="text-sm font-medium">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Email</label><Input value={user?.email || ""} disabled /></div>
          <Button className="w-full">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
