'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Percent,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { formatPrice, formatDate } from '@/lib/utils';

interface CouponItem {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usedCount: number;
  totalLimit: number;
  perUserLimit: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  description: string;
}

const demoCoupons: CouponItem[] = [
  { id: '1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrder: 499, maxDiscount: 100, usedCount: 145, totalLimit: 500, perUserLimit: 1, startDate: '2024-01-01', expiryDate: '2024-12-31', isActive: true, description: 'Welcome discount for new customers' },
  { id: '2', code: 'SAVE50', type: 'FIXED', value: 50, minOrder: 299, maxDiscount: 50, usedCount: 89, totalLimit: 200, perUserLimit: 1, startDate: '2024-01-01', expiryDate: '2024-12-31', isActive: true, description: 'Flat 50 off on orders above 299' },
  { id: '3', code: 'FREESHIP', type: 'FIXED', value: 49, minOrder: 999, maxDiscount: 49, usedCount: 234, totalLimit: 1000, perUserLimit: 3, startDate: '2024-01-01', expiryDate: '2024-12-31', isActive: true, description: 'Free shipping on orders above 999' },
  { id: '4', code: 'SUMMER25', type: 'PERCENTAGE', value: 25, minOrder: 1499, maxDiscount: 500, usedCount: 56, totalLimit: 300, perUserLimit: 2, startDate: '2024-03-01', expiryDate: '2024-06-30', isActive: false, description: 'Summer special 25% off' },
  { id: '5', code: 'BIG500', type: 'FIXED', value: 500, minOrder: 2999, maxDiscount: 500, usedCount: 12, totalLimit: 100, perUserLimit: 1, startDate: '2024-01-01', expiryDate: '2024-12-31', isActive: true, description: 'Big savings: 500 off on large orders' },
  { id: '6', code: 'WEEKEND20', type: 'PERCENTAGE', value: 20, minOrder: 799, maxDiscount: 300, usedCount: 34, totalLimit: 150, perUserLimit: 1, startDate: '2024-06-01', expiryDate: '2024-09-30', isActive: true, description: 'Weekend special 20% off' },
];

interface CouponFormData {
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: string;
  minOrder: string;
  maxDiscount: string;
  totalLimit: string;
  perUserLimit: string;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

const emptyForm: CouponFormData = {
  code: '',
  description: '',
  type: 'PERCENTAGE',
  value: '',
  minOrder: '0',
  maxDiscount: '',
  totalLimit: '',
  perUserLimit: '1',
  startDate: '',
  expiryDate: '',
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(demoCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponItem | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [search, setSearch] = useState('');

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrder: coupon.minOrder.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      totalLimit: coupon.totalLimit.toString(),
      perUserLimit: coupon.perUserLimit.toString(),
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: form.code,
                description: form.description,
                type: form.type,
                value: parseInt(form.value) || 0,
                minOrder: parseInt(form.minOrder) || 0,
                maxDiscount: parseInt(form.maxDiscount) || 0,
                totalLimit: parseInt(form.totalLimit) || 0,
                perUserLimit: parseInt(form.perUserLimit) || 1,
                startDate: form.startDate,
                expiryDate: form.expiryDate,
                isActive: form.isActive,
              }
            : c
        )
      );
      toast.success('Coupon updated successfully');
    } else {
      const newCoupon: CouponItem = {
        id: Date.now().toString(),
        code: form.code,
        description: form.description,
        type: form.type,
        value: parseInt(form.value) || 0,
        minOrder: parseInt(form.minOrder) || 0,
        maxDiscount: parseInt(form.maxDiscount) || 0,
        usedCount: 0,
        totalLimit: parseInt(form.totalLimit) || 0,
        perUserLimit: parseInt(form.perUserLimit) || 1,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        isActive: form.isActive,
      };
      setCoupons((prev) => [...prev, newCoupon]);
      toast.success('Coupon created successfully');
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`Coupon "${deleteTarget.code}" deleted`);
      setDeleteTarget(null);
    }
  };

  const toggleActive = (coupon: CouponItem) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
    );
    toast.success(`Coupon "${coupon.code}" ${coupon.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Input
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Max Discount</TableHead>
                  <TableHead>Used / Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No coupons found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {coupon.type === 'PERCENTAGE' ? (
                            <><Percent className="mr-1 h-3 w-3" /> Percentage</>
                          ) : (
                            <><IndianRupee className="mr-1 h-3 w-3" /> Fixed</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                      </TableCell>
                      <TableCell>{formatPrice(coupon.minOrder)}</TableCell>
                      <TableCell>
                        {coupon.maxDiscount > 0 ? formatPrice(coupon.maxDiscount) : '-'}
                      </TableCell>
                      <TableCell>
                        {coupon.usedCount} / {coupon.totalLimit}
                      </TableCell>
                      <TableCell>
                        <Switch checked={coupon.isActive} onCheckedChange={() => toggleActive(coupon)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(coupon)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteTarget(coupon)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Update the coupon details.' : 'Create a new discount coupon.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Coupon Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                className="font-mono uppercase"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Discount Type</Label>
              <RadioGroup
                value={form.type}
                onValueChange={(v: 'PERCENTAGE' | 'FIXED') => setForm({ ...form, type: v })}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PERCENTAGE" id="type-percentage" />
                  <Label htmlFor="type-percentage">Percentage (%)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="FIXED" id="type-fixed" />
                  <Label htmlFor="type-fixed">Fixed (₹)</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'PERCENTAGE' ? '10' : '100'}
                />
              </div>
              <div className="grid gap-2">
                <Label>Min Order Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Max Discount (₹)</Label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="0 = no limit"
                />
              </div>
              <div className="grid gap-2">
                <Label>Total Usage Limit</Label>
                <Input
                  type="number"
                  value={form.totalLimit}
                  onChange={(e) => setForm({ ...form, totalLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Per User Limit</Label>
                <Input
                  type="number"
                  value={form.perUserLimit}
                  onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="coupon-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                  <Label htmlFor="coupon-active">{form.isActive ? 'Active' : 'Inactive'}</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingCoupon ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon &quot;{deleteTarget?.code}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
