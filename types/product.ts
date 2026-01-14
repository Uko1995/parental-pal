// Product Types
export type ProductCategory =
  | "storybook"
  | "educational"
  | "activity-book"
  | "coloring-book";

export type ProductStatus = "active" | "inactive" | "draft" | "out-of-stock";

export type OrderType = "softcopy" | "paperback";

export interface ProductPricing {
  softcopy: {
    price: number;
    currency: string;
    available: boolean;
  };
  paperback: {
    price: number;
    currency: string;
    available: boolean;
    deliveryDays: number;
  };
}

export interface ProductStock {
  paperback: number;
  lowStockThreshold?: number;
}

export interface PDFFile {
  cloudinaryId: string;
  cloudinaryUrl: string;
  fileName: string;
  fileSize: number;
}

export interface ProductMetrics {
  totalSales: number;
  softcopySales: number;
  paperbackSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  viewCount: number;
}

// Order Types
export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface DeliveryInfo {
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  deliveryNotes?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
}

export interface PaymentInfo {
  reference: string;
  status: PaymentStatus;
  method: string;
  paidAt?: Date;
  amount: number;
  currency: string;
  gatewayResponse?: string;
  paystackResponse?: unknown;
}

export interface DownloadInfo {
  downloadToken: string;
  tokenExpiry: Date;
  downloadCount: number;
  maxDownloads: number;
  lastDownloadAt?: Date;
  downloadIPs?: string[];
}

export interface EmailTracking {
  confirmation: boolean;
  downloadLink?: boolean;
  shippingNotification?: boolean;
  deliveryConfirmation?: boolean;
}

// Client-side types (with string IDs)
export interface ClientProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  author: string;
  category: ProductCategory;
  ageRange: string;
  thumbnail: string;
  images: string[];
  pricing: ProductPricing;
  pdfFile?: PDFFile;
  pageCount?: number;
  isbn?: string;
  publishedDate?: string;
  language: string;
  features?: string[];
  stock: ProductStock;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  status: ProductStatus;
  featured: boolean;
  metrics?: ProductMetrics;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ClientOrder {
  _id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productTitle: string;
  productThumbnail: string;
  orderType: OrderType;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  currency: string;
  delivery?: DeliveryInfo;
  payment: PaymentInfo;
  status: OrderStatus;
  download?: DownloadInfo;
  emailsSent: EmailTracking;
  notes?: string;
  customerNotes?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

// Form data types
export interface ProductFormData {
  title: string;
  description: string;
  shortDescription: string;
  author: string;
  category: ProductCategory;
  ageRange: string;
  thumbnail: string;
  images: string[];
  softcopyPrice: number;
  softcopyAvailable: boolean;
  paperbackPrice: number;
  paperbackAvailable: boolean;
  paperbackDeliveryDays: number;
  paperbackStock: number;
  pdfCloudinaryId?: string;
  pdfCloudinaryUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  pageCount?: number;
  isbn?: string;
  language: string;
  features?: string;
  tags?: string;
  status: ProductStatus;
  featured: boolean;
}

export interface OrderFormData {
  productId: string;
  orderType: OrderType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  // Delivery info for paperback
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  deliveryNotes?: string;
  customerNotes?: string;
}

// API Response types
export interface ProductsResponse {
  success: boolean;
  data?: ClientProduct[];
  error?: string;
}

export interface ProductResponse {
  success: boolean;
  data?: ClientProduct;
  error?: string;
}

export interface OrdersResponse {
  success: boolean;
  data?: ClientOrder[];
  error?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: ClientOrder;
  error?: string;
}

export interface PaymentInitResponse {
  success: boolean;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}

export interface DownloadResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}
