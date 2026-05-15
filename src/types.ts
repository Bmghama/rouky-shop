
export interface Product {
  id: string | number;
  name: string;
  description: string;
  long_description?: string;
  price: number;
  old_price?: number;
  category_id: string | number;
  category_name: string;
  sub_category?: string;
  image_url: string;
  gallery_urls?: string; // JSON
  colors?: string; // JSON
  sizes?: string; // JSON
  stock: number;
  badge?: string;
  highlights?: string; // JSON
  status: 'active' | 'inactive';
  views: number;
  whatsapp_clicks: number;
  created_at: string;
  avg_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string | number;
  product_id: string | number;
  product_name?: string;
  customer_name: string;
  rating: number;
  comment: string;
  image_url?: string;
  status: 'approved' | 'pending' | 'rejected';
  is_featured: number;
  created_at: string;
}

export interface Category {
  id: string | number;
  name: string;
}

export interface Stats {
  totalVisitors: number;
  totalOrders: number;
  totalWhatsAppClicks: number;
  lowStockCount: number;
  mostViewed: { name: string; views: number }[];
  recentActivity: { id: number; action: string; details: string; timestamp: string }[];
  categoriesStats: { name: string; count: number }[];
}
