export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STORE_MANAGER: 'STORE_MANAGER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName?: string;
  name?: string;
  gender?: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName?: string;
  referralCode?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  tax?: number;
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug?: string; logo?: string };
  unit: string;
  unitValue?: string;
  stock: number;
  averageRating: number;
  totalReviews: number;
  isActive?: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEnds?: string;
  variants?: ProductVariant[];
  tags: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  size?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  coupon?: Coupon;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'PERCENTAGE' | 'FIXED';
}

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNo: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  items: OrderItem[];
  address: Address;
  createdAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface Wallet {
  id: string;
  balance: number;
  rewardPoints: number;
}

export interface WalletTransaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginatedResponse<T>['meta'];
  error?: string;
}
