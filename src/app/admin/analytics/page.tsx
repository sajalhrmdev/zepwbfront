'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';

const revenueOverTime = [
  { month: 'Jan', revenue: 45000, orders: 120 },
  { month: 'Feb', revenue: 52000, orders: 145 },
  { month: 'Mar', revenue: 48000, orders: 132 },
  { month: 'Apr', revenue: 61000, orders: 168 },
  { month: 'May', revenue: 55000, orders: 155 },
  { month: 'Jun', revenue: 67000, orders: 180 },
  { month: 'Jul', revenue: 72000, orders: 210 },
  { month: 'Aug', revenue: 68000, orders: 195 },
  { month: 'Sep', revenue: 75000, orders: 220 },
  { month: 'Oct', revenue: 82000, orders: 240 },
  { month: 'Nov', revenue: 78000, orders: 225 },
  { month: 'Dec', revenue: 90000, orders: 260 },
];

const salesByCategory = [
  { name: 'Cases & Covers', value: 35 },
  { name: 'Audio', value: 25 },
  { name: 'Accessories', value: 20 },
  { name: 'Peripherals', value: 12 },
  { name: 'Chargers', value: 8 },
];

const categoryColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const topProductsByRevenue = [
  { name: 'iPhone 15 Case', revenue: 116650 },
  { name: 'Wireless Earbuds', revenue: 94500 },
  { name: 'Laptop Stand', revenue: 71000 },
  { name: 'Mechanical Keyboard', revenue: 73500 },
  { name: 'USB-C Hub', revenue: 46800 },
  { name: 'Phone Stand', revenue: 35200 },
  { name: 'Fast Charger', revenue: 28900 },
  { name: 'Smart Watch Band', revenue: 22400 },
  { name: 'Bluetooth Speaker', revenue: 19800 },
  { name: 'Mouse Pad', revenue: 12100 },
];

const ordersByStatus = [
  { name: 'Delivered', value: 45 },
  { name: 'In Transit', value: 20 },
  { name: 'Processing', value: 18 },
  { name: 'Pending', value: 12 },
  { name: 'Cancelled', value: 5 },
];

const statusColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const ordersOverTime = [
  { month: 'Jan', orders: 120, cancelled: 8 },
  { month: 'Feb', orders: 145, cancelled: 10 },
  { month: 'Mar', orders: 132, cancelled: 6 },
  { month: 'Apr', orders: 168, cancelled: 12 },
  { month: 'May', orders: 155, cancelled: 9 },
  { month: 'Jun', orders: 180, cancelled: 14 },
  { month: 'Jul', orders: 210, cancelled: 11 },
  { month: 'Aug', orders: 195, cancelled: 13 },
  { month: 'Sep', orders: 220, cancelled: 8 },
  { month: 'Oct', orders: 240, cancelled: 15 },
  { month: 'Nov', orders: 225, cancelled: 10 },
  { month: 'Dec', orders: 260, cancelled: 12 },
];

const customerAcquisition = [
  { name: 'New Customers', value: 65 },
  { name: 'Returning', value: 35 },
];

const COLORS = ['#3b82f6', '#10b981'];

export default function AdminAnalyticsPage() {
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');

  const totalRevenue = revenueOverTime.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueOverTime.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const growth = 12.5;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'revenue' || entry.name === 'Revenue' ? formatPrice(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights about your business</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="grid gap-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <IndianRupee className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(avgOrderValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  {growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growth}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        dataKey="value"
                      >
                        {salesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsByRevenue} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" className="text-xs" width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByStatus}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {ordersByStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ordersOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="orders" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Orders" />
                      <Area type="monotone" dataKey="cancelled" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Cancelled" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerAcquisition}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {customerAcquisition.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
