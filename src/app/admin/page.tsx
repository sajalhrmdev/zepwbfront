'use client';

import { useState } from 'react';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { orderService } from '@/services/order.service';

const revenueChartData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
  { name: 'Jul', revenue: 72000 },
  { name: 'Aug', revenue: 68000 },
  { name: 'Sep', revenue: 75000 },
  { name: 'Oct', revenue: 82000 },
  { name: 'Nov', revenue: 78000 },
  { name: 'Dec', revenue: 90000 },
];

const ordersChartData = [
  { name: 'Jan', orders: 120 },
  { name: 'Feb', orders: 145 },
  { name: 'Mar', orders: 132 },
  { name: 'Apr', orders: 168 },
  { name: 'May', orders: 155 },
  { name: 'Jun', orders: 180 },
  { name: 'Jul', orders: 210 },
  { name: 'Aug', orders: 195 },
  { name: 'Sep', orders: 220 },
  { name: 'Oct', orders: 240 },
  { name: 'Nov', orders: 225 },
  { name: 'Dec', orders: 260 },
];

const recentOrders = [
  { orderNo: 'ZEP-2024-001', customer: 'Rajesh Kumar', total: 1249, status: 'DELIVERED', date: '2024-12-15' },
  { orderNo: 'ZEP-2024-002', customer: 'Priya Sharma', total: 899, status: 'OUT_FOR_DELIVERY', date: '2024-12-14' },
  { orderNo: 'ZEP-2024-003', customer: 'Amit Patel', total: 2150, status: 'PACKED', date: '2024-12-14' },
  { orderNo: 'ZEP-2024-004', customer: 'Sneha Reddy', total: 549, status: 'CONFIRMED', date: '2024-12-13' },
  { orderNo: 'ZEP-2024-005', customer: 'Vikram Singh', total: 3299, status: 'PENDING', date: '2024-12-13' },
];

const topProducts = [
  { name: 'iPhone 15 Case', sold: 234, revenue: 116650 },
  { name: 'Wireless Earbuds', sold: 189, revenue: 94500 },
  { name: 'USB-C Hub', sold: 156, revenue: 46800 },
  { name: 'Laptop Stand', sold: 142, revenue: 71000 },
  { name: 'Mechanical Keyboard', sold: 98, revenue: 73500 },
];

const statCards = [
  {
    title: 'Total Revenue',
    value: 785000,
    icon: IndianRupee,
    change: 12.5,
    accent: 'text-green-600 bg-green-100',
  },
  {
    title: 'Total Orders',
    value: 2450,
    icon: ShoppingBag,
    change: 8.2,
    accent: 'text-blue-600 bg-blue-100',
  },
  {
    title: 'Total Customers',
    value: 1820,
    icon: Users,
    change: -3.1,
    accent: 'text-purple-600 bg-purple-100',
  },
  {
    title: 'Total Products',
    value: 456,
    icon: Package,
    change: 5.7,
    accent: 'text-orange-600 bg-orange-100',
  },
];

export default function AdminDashboard() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderService.adminFindAll({ limit: '5' }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.change >= 0;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.title === 'Total Revenue' ? formatPrice(stat.value as number) : stat.value.toLocaleString()}
                </div>
                <div className="mt-1 flex items-center text-xs">
                  {isUp ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={isUp ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="ml-1 text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : (
                <div className="divide-y">
                  {(ordersData?.data || recentOrders).slice(0, 5).map((order: any) => {
                    const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                    return (
                      <div key={order.orderNo || order.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">{order.orderNo || order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customer || order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sold} sold</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
