'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Save,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { formatDate } from '@/lib/utils';

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  type: 'ABOUT' | 'TERMS' | 'PRIVACY' | 'RETURN' | 'FAQ' | 'CUSTOM';
  content: string;
  status: 'PUBLISHED' | 'DRAFT';
  lastUpdated: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  type: 'HOME' | 'OFFER';
  displayOrder: number;
  isActive: boolean;
}

const demoPages: CMSPage[] = [
  { id: '1', title: 'About Us', slug: 'about', type: 'ABOUT', content: '<h1>About Zep</h1><p>Zep is your one-stop shop for premium mobile accessories and electronics.</p>', status: 'PUBLISHED', lastUpdated: '2024-12-10T10:00:00Z' },
  { id: '2', title: 'Terms & Conditions', slug: 'terms', type: 'TERMS', content: '<h1>Terms & Conditions</h1><p>Please read these terms carefully before using our services.</p>', status: 'PUBLISHED', lastUpdated: '2024-11-15T08:30:00Z' },
  { id: '3', title: 'Privacy Policy', slug: 'privacy', type: 'PRIVACY', content: '<h1>Privacy Policy</h1><p>We value your privacy and are committed to protecting your personal data.</p>', status: 'PUBLISHED', lastUpdated: '2024-11-15T08:30:00Z' },
  { id: '4', title: 'Return Policy', slug: 'return-policy', type: 'RETURN', content: '<h1>Return Policy</h1><p>You can return most items within 7 days of delivery.</p>', status: 'PUBLISHED', lastUpdated: '2024-12-01T09:00:00Z' },
  { id: '5', title: 'FAQ', slug: 'faq', type: 'FAQ', content: '<h1>Frequently Asked Questions</h1><h2>How do I place an order?</h2><p>Browse our catalog and add items to your cart.</p>', status: 'DRAFT', lastUpdated: '2024-12-05T14:00:00Z' },
];

const demoBanners: Banner[] = [
  { id: 'b1', title: 'Summer Sale 2024', subtitle: 'Up to 50% off on accessories', imageUrl: '', linkUrl: '/shop', type: 'HOME', displayOrder: 1, isActive: true },
  { id: 'b2', title: 'New Arrivals', subtitle: 'Check out the latest products', imageUrl: '', linkUrl: '/shop/new', type: 'HOME', displayOrder: 2, isActive: true },
  { id: 'b3', title: 'Free Shipping', subtitle: 'On orders above ₹999', imageUrl: '', linkUrl: '/shop', type: 'OFFER', displayOrder: 3, isActive: false },
];

interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  type: 'HOME' | 'OFFER';
  displayOrder: string;
  isActive: boolean;
}

const emptyBannerForm: BannerFormData = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  type: 'HOME',
  displayOrder: '1',
  isActive: true,
};

const pageTypeLabels: Record<string, string> = {
  ABOUT: 'About',
  TERMS: 'Terms',
  PRIVACY: 'Privacy',
  RETURN: 'Return',
  FAQ: 'FAQ',
  CUSTOM: 'Custom',
};

export default function AdminCMSPage() {
  const [pages, setPages] = useState<CMSPage[]>(demoPages);
  const [banners, setBanners] = useState<Banner[]>(demoBanners);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [pageContent, setPageContent] = useState('');
  const [pageEditorOpen, setPageEditorOpen] = useState(false);
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormData>(emptyBannerForm);
  const [deleteBannerTarget, setDeleteBannerTarget] = useState<Banner | null>(null);

  const openPageEditor = (page: CMSPage) => {
    setEditingPage(page);
    setPageContent(page.content);
    setPageEditorOpen(true);
  };

  const savePage = () => {
    if (editingPage) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPage.id
            ? { ...p, content: pageContent, status: 'PUBLISHED' as const, lastUpdated: new Date().toISOString() }
            : p
        )
      );
      toast.success(`Page "${editingPage.title}" saved successfully`);
      setPageEditorOpen(false);
    }
  };

  const openBannerForm = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        type: banner.type,
        displayOrder: banner.displayOrder.toString(),
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setBannerForm(emptyBannerForm);
    }
    setBannerFormOpen(true);
  };

  const saveBanner = () => {
    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? { ...b, title: bannerForm.title, subtitle: bannerForm.subtitle, imageUrl: bannerForm.imageUrl, linkUrl: bannerForm.linkUrl, type: bannerForm.type, displayOrder: parseInt(bannerForm.displayOrder), isActive: bannerForm.isActive }
            : b
        )
      );
      toast.success('Banner updated successfully');
    } else {
      const newBanner: Banner = {
        id: Date.now().toString(),
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        imageUrl: bannerForm.imageUrl,
        linkUrl: bannerForm.linkUrl,
        type: bannerForm.type,
        displayOrder: parseInt(bannerForm.displayOrder),
        isActive: bannerForm.isActive,
      };
      setBanners((prev) => [...prev, newBanner]);
      toast.success('Banner created successfully');
    }
    setBannerFormOpen(false);
  };

  const deleteBanner = () => {
    if (deleteBannerTarget) {
      setBanners((prev) => prev.filter((b) => b.id !== deleteBannerTarget.id));
      toast.success('Banner deleted');
      setDeleteBannerTarget(null);
    }
  };

  const toggleBannerActive = (banner: Banner) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
    );
    toast.success(`Banner "${banner.title}" ${banner.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CMS Management</h1>
        <p className="text-muted-foreground">Manage pages and banners</p>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CMS Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">/{page.slug}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pageTypeLabels[page.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'outline'}>
                            {page.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(page.lastUpdated)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPageEditor(page)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openBannerForm()}>
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Display Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No banners found
                        </TableCell>
                      </TableRow>
                    ) : (
                      banners.map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell>
                            <div className="flex h-12 w-20 items-center justify-center rounded-md bg-muted overflow-hidden">
                              {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{banner.title}</p>
                            <p className="text-xs text-muted-foreground">{banner.subtitle}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{banner.type === 'HOME' ? 'Home' : 'Offer'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={banner.displayOrder}
                              className="h-8 w-16 text-center"
                              onChange={(e) => {
                                setBanners((prev) =>
                                  prev.map((b) =>
                                    b.id === banner.id ? { ...b, displayOrder: parseInt(e.target.value) || 0 } : b
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch checked={banner.isActive} onCheckedChange={() => toggleBannerActive(banner)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openBannerForm(banner)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteBannerTarget(banner)}>
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
        </TabsContent>
      </Tabs>

      <Dialog open={pageEditorOpen} onOpenChange={setPageEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit: {editingPage?.title}</DialogTitle>
            <DialogDescription>
              Edit the HTML content for this page. Use standard HTML tags.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Slug: /{editingPage?.slug}
            </div>
            <textarea
              className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
              placeholder="Enter HTML content..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPageEditorOpen(false)}>Cancel</Button>
            <Button onClick={savePage}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bannerFormOpen} onOpenChange={setBannerFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
            <DialogDescription>
              {editingBanner ? 'Update the banner details.' : 'Create a new banner.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="Banner title"
              />
            </div>
            <div className="grid gap-2">
              <Label>Subtitle</Label>
              <Input
                value={bannerForm.subtitle}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                placeholder="Banner subtitle"
              />
            </div>
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <Input
                value={bannerForm.imageUrl}
                onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label>Link URL</Label>
              <Input
                value={bannerForm.linkUrl}
                onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                placeholder="/shop or https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={bannerForm.type}
                  onValueChange={(v: 'HOME' | 'OFFER') => setBannerForm({ ...bannerForm, type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME">Home Banner</SelectItem>
                    <SelectItem value="OFFER">Offer Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={bannerForm.displayOrder}
                  onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="banner-active"
                checked={bannerForm.isActive}
                onCheckedChange={(v) => setBannerForm({ ...bannerForm, isActive: v })}
              />
              <Label htmlFor="banner-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerFormOpen(false)}>Cancel</Button>
            <Button onClick={saveBanner}>{editingBanner ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBannerTarget} onOpenChange={(open) => !open && setDeleteBannerTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the banner &quot;{deleteBannerTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBanner} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
