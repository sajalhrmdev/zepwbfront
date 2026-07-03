"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, CheckCircle2, Timer, XCircle } from "lucide-react";

const stats = [
  { label: "Today's Deliveries", value: "12", icon: Bike, color: "text-blue-600 bg-blue-100" },
  { label: "Completed", value: "8", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
  { label: "In Progress", value: "3", icon: Timer, color: "text-orange-600 bg-orange-100" },
  { label: "Failed", value: "1", icon: XCircle, color: "text-red-600 bg-red-100" },
];

export default function DeliveryDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.color}`}><Icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader><CardTitle>Active Delivery</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bike className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No active deliveries right now</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
