import { create } from "zustand";
import { Cart, Coupon } from "@/types";
import { cartService } from "@/services/cart.service";

export interface CartItemDisplay {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  mrp: number;
  price: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  total: number;
}

interface CartComputed {
  subtotal: number;
  totalDiscount: number;
  deliveryCharge: number;
  platformFee: number;
  packingCharge: number;
  total: number;
  itemCount: number;
}

interface CartState {
  cart: Cart | null;
  items: CartItemDisplay[];
  itemCount: number;
  subtotal: number;
  totalDiscount: number;
  deliveryCharge: number;
  platformFee: number;
  packingCharge: number;
  total: number;
  appliedCoupon: string | null;
  loading: boolean;
  setCart: (cart: Cart) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  setCoupon: (code: string, discount: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const processCartItems = (cart: Cart | null): { items: CartItemDisplay[]; itemCount: number } => {
  if (!cart) return { items: [], itemCount: 0 };

  const items = cart.items.map((item) => {
    const price = Number(item.product.sellingPrice);
    const mrp = Number(item.product.mrp);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      image: item.product.images?.[0]?.url ?? undefined,
      mrp,
      price,
      sellingPrice: price,
      quantity: item.quantity,
      unit: item.product.unit,
      total: price * item.quantity,
    };
  });

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, itemCount };
};

const computeTotals = (items: CartItemDisplay[], couponDiscount = 0): Omit<CartComputed, 'itemCount'> => {
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const totalDiscount = items.reduce((sum, i) => sum + (i.mrp - i.price) * i.quantity, 0) + couponDiscount;
  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const platformFee = 5;
  const packingCharge = 20;
  const total = Math.max(0, subtotal - couponDiscount + deliveryCharge + platformFee + packingCharge);
  return { subtotal, totalDiscount, deliveryCharge, platformFee, packingCharge, total };
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  totalDiscount: 0,
  deliveryCharge: 0,
  platformFee: 5,
  packingCharge: 20,
  total: 0,
  appliedCoupon: null,
  loading: false,

  setCart: (cart) => {
    const { items, itemCount } = processCartItems(cart);
    const discount = cart.coupon ? Number((cart.coupon as any).value || 0) : 0;
    const totals = computeTotals(items, discount);
    set({ cart, items, itemCount, ...totals, appliedCoupon: cart.coupon?.code ?? null });
  },

  fetchCart: async () => {
    try {
      set({ loading: true });
      const cart = await cartService.getCart();
      const { items, itemCount } = processCartItems(cart);
      const discount = cart.coupon ? Number((cart.coupon as any).value || 0) : 0;
      const totals = computeTotals(items, discount);
      set({ cart, items, itemCount, ...totals, appliedCoupon: cart.coupon?.code ?? null, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity, variantId) => {
    try {
      set({ loading: true });
      const cart = await cartService.addItem(productId, quantity, variantId);
      const { items, itemCount } = processCartItems(cart);
      const discount = cart.coupon ? Number((cart.coupon as any).value || 0) : 0;
      const totals = computeTotals(items, discount);
      set({ cart, items, itemCount, ...totals, appliedCoupon: cart.coupon?.code ?? null, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  removeItem: async (productId) => {
    try {
      const item = get().items.find(i => i.productId === productId);
      if (item) await cartService.removeItem(item.id);
      await get().fetchCart();
    } catch {}
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const item = get().items.find(i => i.productId === productId);
      if (!item) return;
      if (quantity <= 0) return get().removeItem(productId);
      const cart = await cartService.updateItem(item.id, quantity);
      const { items, itemCount } = processCartItems(cart);
      const discount = cart.coupon ? Number((cart.coupon as any).value || 0) : 0;
      const totals = computeTotals(items, discount);
      set({ cart, items, itemCount, ...totals, appliedCoupon: cart.coupon?.code ?? null });
    } catch {}
  },

  setCoupon: (code, _discount) => {
    set({ appliedCoupon: code });
  },

  clearCart: () => set({
    cart: null, items: [], itemCount: 0, subtotal: 0, totalDiscount: 0,
    deliveryCharge: 0, platformFee: 5, packingCharge: 20, total: 0, appliedCoupon: null
  }),

  applyCoupon: async (code) => {
    try {
      const cart = await cartService.applyCoupon(code);
      const { items, itemCount } = processCartItems(cart);
      const discount = cart.coupon ? Number((cart.coupon as any).value || 0) : 0;
      const totals = computeTotals(items, discount);
      set({ cart, items, itemCount, ...totals, appliedCoupon: cart.coupon?.code ?? null });
    } catch {
      set({ appliedCoupon: null });
    }
  },

  removeCoupon: async () => {
    try {
      await cartService.removeCoupon();
      await get().fetchCart();
      set({ appliedCoupon: null });
    } catch {
      set({ appliedCoupon: null });
    }
  },
}));

export const useCartComputed = (): CartComputed => {
  const { subtotal, totalDiscount, deliveryCharge, platformFee, packingCharge, total, itemCount } = useCartStore();
  return { subtotal, totalDiscount, deliveryCharge, platformFee, packingCharge, total, itemCount };
};
