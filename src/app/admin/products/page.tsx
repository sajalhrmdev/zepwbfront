'use client';

import { useState } from 'react';
import {
  Search, Plus, Edit, Trash2, ImageIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { adminProductService, type CreateProductData } from '@/services/admin-product.service';
import { categoryService } from '@/services/category.service';
import api from '@/services/api';
import type { Product, Brand } from '@/types';
import { ImageUpload } from '@/components/image-upload';

const ITEMS_PER_PAGE = 10;

const units = ['KG', 'G', 'L', 'ML', 'PCS', 'PACK', 'BOX', 'DOZEN', 'BUNDLE', 'PAIR', 'SET'] as const;

interface ProductFormData {
  name: string; description: string; sku: string;
  categoryId: string; brandId: string;
  mrp: string; sellingPrice: string; tax: string;
  unit: string; stock: string; minStock: string;
  isFeatured: boolean; isBestSeller: boolean;
  imageUrls: string[];
}

const emptyForm: ProductFormData = {
  name: '', description: '', sku: '', categoryId: '', brandId: '',
  mrp: '', sellingPrice: '', tax: '0', unit: 'PCS', stock: '0', minStock: '10',
  isFeatured: false, isBestSeller: false, imageUrls: [''],
};

function productToForm(p: Product): ProductFormData {
  return {
    name: p.name,
    description: p.description || '',
    sku: p.sku || p.slug,
    categoryId: p.category.id,
    brandId: p.brand?.id || '',
    mrp: Number(p.mrp).toString(),
    sellingPrice: Number(p.sellingPrice).toString(),
    tax: p.tax ? Number(p.tax).toString() : '0',
    unit: p.unit,
    stock: p.stock.toString(),
    minStock: '10',
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    imageUrls: p.images.length > 0 ? p.images.map(i => i.url) : [''],
  };
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll(),
  });
  const categories = catRes || [];

  const { data: brandRes } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/brands');
      return res.data.data as Brand[];
    },
  });
  const brands = brandRes || [];

  const { data: prodRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminProductService.findAll({ limit: '100' }),
  });

  const products = (prodRes?.data || []) as Product[];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.slug.includes(q);
    const matchesCategory = categoryFilter === 'ALL' || p.category.id === categoryFilter || p.category.name === categoryFilter;
    const matchesStock = stockFilter === 'ALL' || (stockFilter === 'IN_STOCK' && p.stock > 0) || (stockFilter === 'OUT_OF_STOCK' && p.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => adminProductService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      setFormOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductData> }) => adminProductService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
      setFormOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminProductService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete product'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminProductService.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to toggle status'),
  });

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormOpen(true);
  };

  const handleSave = () => {
    const payload: CreateProductData = {
      name: form.name,
      description: form.description || undefined,
      sku: form.sku || form.name.toLowerCase().replace(/\s+/g, '-'),
      categoryId: form.categoryId,
      brandId: form.brandId || undefined,
      mrp: parseFloat(form.mrp),
      sellingPrice: parseFloat(form.sellingPrice),
      tax: parseFloat(form.tax) || 0,
      unit: form.unit,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 0,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      images: form.imageUrls.filter(Boolean).map((url, i) => ({
        url,
        isPrimary: i === 0,
        alt: form.name,
      })),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Stock" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stock</SelectItem>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
              <p>Failed to load products</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              {product.images[0]?.url ? (
                                <img src={product.images[0].url} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                          <TableCell className="text-sm">{product.sku || product.slug}</TableCell>
                          <TableCell><Badge variant="secondary">{product.category.name}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{formatPrice(product.sellingPrice)}</span>
                              {Number(product.mrp) > Number(product.sellingPrice) && (
                                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={product.stock === 0 ? 'text-red-500 font-medium' : ''}>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={product.isActive ?? true}
                              onCheckedChange={(v) => toggleMutation.mutate({ id: product.id, isActive: v })}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteTarget(product)}>
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({filtered.length} total)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Product Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated if empty" />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Brand</Label>
                <Select value={form.brandId} onValueChange={(v) => setForm({ ...form, brandId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>MRP (₹)</Label>
                <Input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Selling Price (₹)</Label>
                <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Tax (%)</Label>
                <Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Min Stock Alert</Label>
                <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="isFeatured" checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v === true })} />
                <Label htmlFor="isFeatured">Is Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isBestSeller" checked={form.isBestSeller} onCheckedChange={(v) => setForm({ ...form, isBestSeller: v === true })} />
                <Label htmlFor="isBestSeller">Best Seller</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Images</Label>
              {form.imageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <ImageUpload
                      value={url}
                      onChange={(newUrl) => {
                        const urls = [...form.imageUrls];
                        urls[idx] = newUrl;
                        setForm({ ...form, imageUrls: urls });
                      }}
                    />
                  </div>
                  {form.imageUrls.length > 1 && (
                    <Button variant="ghost" size="icon" className="mt-1 text-red-500 shrink-0" onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((_, i) => i !== idx) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm({ ...form, imageUrls: [...form.imageUrls, ''] })}>
                <Plus className="mr-2 h-4 w-4" /> Add Image
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending || !form.name || !form.categoryId}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
