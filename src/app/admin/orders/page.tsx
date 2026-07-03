'use client';

import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  XCircle,
  Edit,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP } from '@/lib/constants';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types';

const ITEMS_PER_PAGE = 5;

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const [statusDialog, setStatusDialog] = useState<{ open: boolean; order: Order | null; newStatus: string }>({ open: false, order: null, newStatus: '' });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; order: Order | null; reason: string }>({ open: false, order: null, reason: '' });

  const { data: fetchedOrders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderService.adminFindAll({ limit: '100' }),
  });

  const orders = (fetchedOrders?.data || []) as Order[];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderService.adminUpdateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setStatusDialog({ open: false, order: null, newStatus: '' });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => orderService.adminCancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setCancelDialog({ open: false, order: null, reason: '' });
      toast.success('Order cancelled');
    },
    onError: () => toast.error('Failed to cancel order'),
  });

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.address.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesDateFrom = !dateFrom || new Date(o.createdAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(o.createdAt) <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openStatusDialog = (order: Order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    const nextStatus = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : order.status;
    setStatusDialog({ open: true, order, newStatus: nextStatus });
  };

  const openCancelDialog = (order: Order) => {
    setCancelDialog({ open: true, order, reason: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {Object.entries(ORDER_STATUS_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Order No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((order) => {
                    const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                    const payInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || { label: order.paymentStatus, color: 'bg-gray-100 text-gray-800' };
                    const isExpanded = expandedRow === order.id;
                    const isUpdating = updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id;
                    const isCancelling = cancelMutation.isPending && cancelMutation.variables?.id === order.id;
                    return (
                      <React.Fragment key={order.id}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : order.id)}
                        >
                          <TableCell>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium">{order.orderNo}</TableCell>
                          <TableCell>{order.address.fullName}</TableCell>
                          <TableCell>{order.items.length}</TableCell>
                          <TableCell>{formatPrice(order.total)}</TableCell>
                          <TableCell><Badge className={statusInfo.color}>{statusInfo.label}</Badge></TableCell>
                          <TableCell><Badge className={payInfo.color}>{payInfo.label}</Badge></TableCell>
                          <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUpdating || isCancelling}>
                                  {isUpdating || isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewOrder(order)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
                                  <DropdownMenuItem onClick={() => openStatusDialog(order)}>
                                    <Edit className="mr-2 h-4 w-4" /> Update Status
                                  </DropdownMenuItem>
                                )}
                                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                  <DropdownMenuItem onClick={() => openCancelDialog(order)}>
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${order.id}-items`}>
                            <TableCell colSpan={9} className="bg-muted/30 p-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium mb-2">Order Items</p>
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>{formatPrice(item.total)}</span>
                                  </div>
                                ))}
                                <div className="border-t pt-2 mt-2 flex justify-between text-sm font-medium">
                                  <span>Total</span>
                                  <span>{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({filtered.length} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {viewOrder?.orderNo}</DialogTitle>
            <DialogDescription>Order details and customer information</DialogDescription>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={ORDER_STATUS_MAP[viewOrder.status]?.color}>
                    {ORDER_STATUS_MAP[viewOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment</p>
                  <Badge className={PAYMENT_STATUS_MAP[viewOrder.paymentStatus]?.color}>
                    {PAYMENT_STATUS_MAP[viewOrder.paymentStatus]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm">{viewOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm">{formatDate(viewOrder.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Customer</p>
                <p className="text-sm">{viewOrder.address.fullName} - {viewOrder.address.phone}</p>
                <p className="text-sm text-muted-foreground">{viewOrder.address.line1}, {viewOrder.address.city}, {viewOrder.address.state} - {viewOrder.address.pincode}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Items</p>
                {viewOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2">
                  <span>Total</span>
                  <span>{formatPrice(viewOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialog.open} onOpenChange={(open) => !open && setStatusDialog({ open: false, order: null, newStatus: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>Change the status of order {statusDialog.order?.orderNo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Badge className={ORDER_STATUS_MAP[statusDialog.order?.status || '']?.color || 'bg-gray-100'}>
                {ORDER_STATUS_MAP[statusDialog.order?.status || '']?.label || statusDialog.order?.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newStatus">New Status</Label>
              <Select
                value={statusDialog.newStatus}
                onValueChange={(v) => setStatusDialog({ ...statusDialog, newStatus: v })}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.map((s) => (
                    <SelectItem key={s} value={s}>{ORDER_STATUS_MAP[s]?.label || s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog({ open: false, order: null, newStatus: '' })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (statusDialog.order) {
                  updateStatusMutation.mutate({ id: statusDialog.order.id, status: statusDialog.newStatus });
                }
              }}
              disabled={!statusDialog.newStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
              ) : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, order: null, reason: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>Are you sure you want to cancel order {cancelDialog.order?.orderNo}?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation</Label>
              <Input
                id="reason"
                placeholder="Enter reason..."
                value={cancelDialog.reason}
                onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, order: null, reason: '' })}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (cancelDialog.order) {
                  cancelMutation.mutate({ id: cancelDialog.order.id, reason: cancelDialog.reason || 'Cancelled by admin' });
                }
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelling...</>
              ) : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
