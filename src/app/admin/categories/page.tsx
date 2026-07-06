'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/image-upload';
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
import { generateSlug } from '@/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
  itemsCount: number;
  isActive: boolean;
  parentId?: string;
}

const demoCategories: CategoryItem[] = [
  { id: '1', name: 'Cases & Covers', slug: 'cases-covers', image: '', displayOrder: 1, itemsCount: 45, isActive: true },
  { id: '2', name: 'Audio', slug: 'audio', image: '', displayOrder: 2, itemsCount: 32, isActive: true },
  { id: '3', name: 'Chargers', slug: 'chargers', image: '', displayOrder: 3, itemsCount: 28, isActive: true },
  { id: '4', name: 'Cables', slug: 'cables', image: '', displayOrder: 4, itemsCount: 18, isActive: true },
  { id: '5', name: 'Accessories', slug: 'accessories', image: '', displayOrder: 5, itemsCount: 52, isActive: true },
  { id: '6', name: 'Peripherals', slug: 'peripherals', image: '', displayOrder: 6, itemsCount: 22, isActive: false },
  { id: '7', name: 'Wearables', slug: 'wearables', image: '', displayOrder: 7, itemsCount: 15, isActive: true },
  { id: '8', name: 'Screen Protection', slug: 'screen-protection', image: '', displayOrder: 8, itemsCount: 12, isActive: true },
];

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: string;
  parentId: string;
  isActive: boolean;
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: '1',
  parentId: '',
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(demoCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [search, setSearch] = useState('');

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: '',
      imageUrl: cat.image,
      displayOrder: cat.displayOrder.toString(),
      parentId: cat.parentId || '',
      isActive: cat.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: form.name, slug: generateSlug(form.name), image: form.imageUrl, displayOrder: parseInt(form.displayOrder), isActive: form.isActive }
            : c
        )
      );
      toast.success('Category updated successfully');
    } else {
      const newCat: CategoryItem = {
        id: Date.now().toString(),
        name: form.name,
        slug: generateSlug(form.name),
        image: form.imageUrl,
        displayOrder: parseInt(form.displayOrder),
        itemsCount: 0,
        isActive: form.isActive,
      };
      setCategories((prev) => [...prev, newCat]);
      toast.success('Category created successfully');
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    }
  };

  const toggleActive = (cat: CategoryItem) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
    );
    toast.success(`Category "${cat.name}" ${cat.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Input
            placeholder="Search categories..."
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
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell>
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={cat.displayOrder}
                          className="h-8 w-16 text-center"
                          onChange={(e) => {
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id ? { ...c, displayOrder: parseInt(e.target.value) || 0 } : c
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell><Badge variant="secondary">{cat.itemsCount}</Badge></TableCell>
                      <TableCell>
                        <Switch checked={cat.isActive} onCheckedChange={() => toggleActive(cat)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(cat)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteTarget(cat)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details.' : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Category description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Image</Label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Parent Category</Label>
                <Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v })}>
                  <SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (top level)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingCategory ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? Items in this category will not be deleted.
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
