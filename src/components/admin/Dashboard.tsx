import { useState, useEffect, useCallback } from "react";

import { Stats, Product, Category, Review } from "../../types.ts";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  MessageCircle,
  RefreshCw,
  Check,
  X as XIcon,
  Star,
  MapPin,
} from "lucide-react";
import { formatPrice, cn } from "../../lib/utils.ts";
import AdminLayout from "./AdminLayout.tsx";
import ProductForm from "./ProductForm.tsx";

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

type Tab =
  | "stats"
  | "products"
  | "orders"
  | "categories"
  | "reviews"
  | "activity"
  | "assets"
  | "newsletter";

interface AdminOrderItem {
  product_name: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface AdminOrder {
  id: number | string;
  customer_name: string;
  customer_phone: string;
  neighborhood: string;
  total_price: number;
  status: string;
  created_at: string;
  items: AdminOrderItem[];
}

interface AdminAsset {
  id: number | string;
  key: string;
  label: string;
  category: string;
  url: string;
  content?: string;
}

interface NewsletterSubscriber {
  id: number | string;
  created_at: string;
  whatsapp: string;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");

  const safeToken = token && token !== "undefined" && token !== "null" ? token : "";
  const authHeaders: Record<string, string> = safeToken ? { Authorization: `Bearer ${safeToken}` } : {};

  const fetchWithTimeout = useCallback(async (url: string, opts: RequestInit = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = window.setTimeout(() => controller.abort(), timeout);
    try {
      const existingHeaders = opts.headers && typeof opts.headers === "object" ? (opts.headers as Record<string, string>) : {};
      return await fetch(url, {
        credentials: "include",
        ...opts,
        headers: { ...(existingHeaders as Record<string, string>), ...authHeaders },
        signal: controller.signal,
      });
    } catch {
      return null;
    } finally {
      window.clearTimeout(id);
    }
  }, [authHeaders]);

  const fetchData = useCallback(async () => {
    const mockStats: Stats = {
      totalVisitors: 0,
      totalOrders: 0,
      totalWhatsAppClicks: 0,
      lowStockCount: 0,
      mostViewed: [],
      recentActivity: [],
      categoriesStats: [],
    };

    try {
      setError("");
      setLoading(true);

      const headers = authHeaders;
      const [statsRes, prodRes, catRes, reviewRes, orderRes, assetRes] = await Promise.all([
        fetchWithTimeout("/api/admin/stats", { headers }),
        fetchWithTimeout("/api/products?status=all", { headers }),
        fetchWithTimeout("/api/categories"),
        fetchWithTimeout("/api/admin/reviews", { headers }),
        fetchWithTimeout("/api/admin/orders", { headers }),
        fetchWithTimeout("/api/admin/assets", { headers }),
      ]);

      if (statsRes?.status === 401) {
        onLogout();
        return;
      }

      const safeJson = async <T,>(response: Response | null, fallback: T): Promise<T> => {
        if (!response || !response.ok) return fallback;
        try {
          return (await response.json()) as T;
        } catch {
          return fallback;
        }
      };

      const [statsData, prodData, catData, reviewData, orderData, assetData] = await Promise.all([
        safeJson<Stats>(statsRes, mockStats),
        safeJson<Product[]>(prodRes, []),
        safeJson<Category[]>(catRes, []),
        safeJson<Review[]>(reviewRes, []),
        safeJson<AdminOrder[]>(orderRes, []),
        safeJson<AdminAsset[]>(assetRes, []),
      ]);

      setStats(statsData);
      setProducts(prodData);
      setCategories(catData);
      setReviews(reviewData);
      setOrders(orderData);
      setAssets(assetData);
    } catch (err) {
      console.error(err);
      setError("Erreur réseau : impossible de charger les données admin.");
      setStats(mockStats);
      setProducts([]);
      setCategories([]);
      setReviews([]);
      setOrders([]);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithTimeout, onLogout, token]);

  const handleReviewStatus = async (id: number | string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          ...authHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewFeature = async (id: number | string, is_featured: number) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          ...authHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_featured })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewDelete = async (id: number | string) => {
    if (confirm("Supprimer cet avis ?")) {
      try {
        const res = await fetch(`/api/admin/reviews/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { ...authHeaders }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    void fetchData();
  }, [fetchData]);


  const handleDelete = async (id: number | string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { ...authHeaders }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOrderStatus = async (id: number | string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          ...authHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderDelete = async (id: number | string) => {
    if (confirm("Supprimer cette commande ?")) {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { ...authHeaders }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCategoryAdd = async () => {
    const name = prompt("Nom du nouveau rayon :");
    if (name) {
      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          credentials: "include",
          headers: { 
            ...authHeaders,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name })
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };



  const handleCategoryDelete = async (id: number | string) => {
    if (confirm("Supprimer ce rayon ? Cela ne supprimera pas les produits associés.")) {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { ...authHeaders }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAssetUpdate = async (id: number | string, data: Partial<AdminAsset>) => {
    try {
      const res = await fetch(`/api/admin/assets/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          ...authHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(normalizedSearch) ||
      p.category_name.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || p.category_name === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={(tab) => setActiveTab(tab as Tab)}
      onLogout={onLogout}
    >
      <div className="w-full min-h-screen pt-4 md:pt-16 px-3 md:px-12 lg:px-16 pb-8 bg-zinc-950 text-white overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-12 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-px bg-amber-600"></span>
                <span className="text-[8px] md:text-[9px] text-amber-400 font-bold tracking-[0.3em]">ADMIN</span>
              </div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-serif italic font-bold text-white leading-tight break-word">
                {activeTab === "stats"
                  ? "Performances"
                  : activeTab === "products"
                  ? "Catalogue"
                  : activeTab === "orders"
                  ? "Commandes"
                  : activeTab === "categories"
                  ? "Rayons"
                  : activeTab === "reviews"
                  ? "Avis"
                  : activeTab === "activity"
                  ? "Journal"
                  : activeTab === "assets"
                  ? "Design"
                  : "Club WhatsApp"}
              </h1>
            </div>

            {/* Actions - Mobile friendly */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={fetchData}
                className="p-2.5 md:p-3 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-amber-400" : "text-zinc-400"} />
              </button>

              {activeTab === "products" && (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsFormOpen(true);
                  }}
                  className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white px-3 md:px-6 py-2 md:py-3 text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-1 md:gap-2 transition-all rounded"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Nouveau</span>
                </button>
              )}
            </div>
          </header>

          {/* Loading State - Better Spinner */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 md:py-24">
              <div className="relative w-12 h-12 md:w-16 md:h-16">
                <RefreshCw size={48} className="text-amber-400 animate-spin" />
              </div>
              <p className="text-zinc-400 text-xs md:text-sm mt-4 font-sans">Chargement des données...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-10 bg-zinc-800 border border-red-500/30 rounded p-6">
              <h3 className="text-lg md:text-xl font-serif italic text-red-400 mb-2">Chargement impossible</h3>
              <p className="text-zinc-400 text-xs md:text-sm mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-[9px] tracking-widest transition-all"
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {activeTab === "stats" && stats ? (
                <StatsView
                  stats={stats}
                  orders={orders}
                  reviews={reviews}
                  assets={assets}
                  setActiveTab={setActiveTab}
                  token={token}
                  onUpdate={handleAssetUpdate}
                />
              ) : activeTab === "stats" ? (
                <div className="mt-10 bg-zinc-800 border border-zinc-700 rounded p-6">
                  <p className="text-zinc-400 text-sm italic">Aucune performance disponible pour le moment.</p>
                </div>
              ) : null}
              
              {activeTab === "products" && (
                <ProductsView
                  products={filteredProducts}
                  categories={categories}
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
                  categoryFilter={categoryFilter}
                  setSearchTerm={setSearchTerm}
                  setStatusFilter={setStatusFilter}
                  setCategoryFilter={setCategoryFilter}
                  onEdit={(p: Product) => {
                    setEditingProduct(p);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              )}
              
              {activeTab === "orders" && (
                <OrdersView
                  orders={orders}
                  filter={orderFilter}
                  setFilter={setOrderFilter}
                  onStatusChange={handleOrderStatus}
                  onDelete={handleOrderDelete}
                />
              )}
              
              {activeTab === "categories" && (
                <CategoriesView
                  categories={categories}
                  onAdd={handleCategoryAdd}
                  onDelete={handleCategoryDelete}
                />
              )}
              
              {activeTab === "reviews" && (
                <ReviewsView
                  reviews={reviews}
                  filter={reviewFilter}
                  setFilter={setReviewFilter}
                  onStatusChange={handleReviewStatus}
                  onFeatureChange={handleReviewFeature}
                  onDelete={handleReviewDelete}
                />
              )}
              
              {activeTab === "activity" && stats && (
                <ActivityView activity={stats.recentActivity} />
              )}
              
              {activeTab === "assets" && (
                <AssetsView
                  assets={assets}
                  token={token}
                  onUpdate={handleAssetUpdate}
                />
              )}
              
              {activeTab === "newsletter" && (
                <NewsletterView token={token} />
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            token={token}
            onClose={() => setIsFormOpen(false)}
            onSubmit={fetchData}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function NewsletterView({ token }: { token: string }) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const safeToken = token && token !== "undefined" && token !== "null" ? token : "";
  const authHeaders: Record<string, string> = safeToken ? { Authorization: `Bearer ${safeToken}` } : {};

  useEffect(() => {
    let mounted = true;

    const loadSubscribers = async () => {
      try {
        const response = await fetch("/api/admin/newsletter", {
          credentials: "include",
          headers: { ...authHeaders },
        });
        const data = (await response.json()) as NewsletterSubscriber[];
        if (mounted) {
          setSubscribers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setSubscribers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadSubscribers();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h3 className="text-3xl md:text-4xl font-serif italic">Club WhatsApp</h3>
          <p className="text-neutral-400 text-sm font-light max-w-2xl">
            Liste des clientes inscrites pour recevoir les nouveautés.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 bg-editorial-gold/10 text-editorial-gold px-4 py-3 rounded-full label-caps text-[10px]!">
          {subscribers.length} abonnées
        </div>
      </div>

      {loading ? (
        <div className="bg-white editorial-border shadow-2xl p-8 md:p-12 text-center animate-pulse text-neutral-300 font-serif italic">
          Chargement du club...
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white editorial-border shadow-2xl p-8 md:p-12 text-center text-neutral-300 font-serif italic text-xl">
          Aucune inscription pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {subscribers.map((sub) => {
            const prettyDate = new Date(sub.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <article
                key={sub.id}
                className="bg-white editorial-border shadow-[0_12px_40px_-20px_rgba(0,0,0,0.35)] p-5 md:p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label-caps text-[9px]! text-neutral-400">Date d'inscription</p>
                    <p className="text-sm text-neutral-700 mt-2">{prettyDate}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <MessageCircle size={16} className="text-[#25D366]" />
                  </div>
                </div>

                <div>
                  <p className="label-caps text-[9px]! text-neutral-400 mb-2">Numéro WhatsApp</p>
                  <a
                    href={`https://wa.me/${sub.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-editorial-text break-all hover:text-editorial-gold transition-colors"
                  >
                    {sub.whatsapp}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color = "bg-white border-neutral-100" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={cn("p-10 editorial-border shadow-2xl relative overflow-hidden group", color)}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-900/2 rounded-bl-full -mr-12 -mt-12 group-hover:bg-editorial-gold/5 transition-all duration-700"></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="p-4 bg-neutral-50 rounded-2xl group-hover:bg-white group-hover:shadow-lg transition-all duration-500">{icon}</div>
      </div>
      <div className="relative z-10">
        <p className="label-caps text-[9px]! tracking-[0.3em] font-bold text-neutral-400 mb-3">{title}</p>
        <p className="text-5xl font-serif text-neutral-900 group-hover:text-editorial-gold transition-colors duration-500">{value}</p>
      </div>
    </motion.div>
  );
}

function StatsView({ stats, orders, reviews, assets, setActiveTab, token, onUpdate }: any) {
  const safeToken = token && token !== "undefined" && token !== "null" ? token : "";
  const authHeaders: Record<string, string> = safeToken ? { Authorization: `Bearer ${safeToken}` } : {};
  const latestOrders = orders.slice(0, 3);
  const pendingReviews = reviews.filter((r: any) => r.status === 'pending').slice(0, 3);
  const heroAsset = assets.find((a: any) => a.key === 'hero_main');

  const handleQuickUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        onUpdate(id, { url: data.imageUrl });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* 4 Cards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Visiteurs" value={stats.totalVisitors} icon={<Users className="text-blue-500" />} />
        <StatCard title="Commandes" value={stats.totalOrders} icon={<ShoppingBag className="text-green-500" />} />
        <StatCard title="Clics WhatsApp" value={stats.totalWhatsAppClicks} icon={<MessageCircle className="text-[#25D366]" />} />
        <StatCard title="Alerte Stock" value={stats.lowStockCount} icon={<AlertTriangle className={stats.lowStockCount > 0 ? "text-red-500" : "text-neutral-300"} />} color={stats.lowStockCount > 0 ? "bg-red-50 border-red-100" : ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Commandes Récentes */}
         <div className="lg:col-span-2 bg-white p-10 editorial-border shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-serif italic">Commandes Récentes</h3>
               <button onClick={() => setActiveTab('orders')} className="label-caps text-[9px]! text-editorial-gold hover:underline">Voir tout</button>
            </div>
            <div className="space-y-6">
               {latestOrders.length > 0 ? latestOrders.map((o: any) => (
                 <div key={o.id} className="flex items-center justify-between p-6 bg-neutral-50/50 hover:bg-neutral-50 transition-colors editorial-border border-transparent hover:border-neutral-100">
                    <div>
                       <p className="font-serif font-bold text-lg">{o.customer_name}</p>
                       <p className="text-[10px] label-caps opacity-50 mt-1">{o.neighborhood} • {new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-bold text-editorial-gold">{formatPrice(o.total_price)}</p>
                       <span className={cn(
                        "px-2 py-1 label-caps text-[8px]! border mt-2 inline-block",
                          o.status === 'pending' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-green-50 text-green-600 border-green-100"
                       )}>{o.status}</span>
                    </div>
                 </div>
               )) : <p className="text-center py-10 text-neutral-400 italic">Aucune commande pour le moment</p>}
            </div>
         </div>

         {/* Avis Clients */}
         <div className="bg-white p-10 editorial-border shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-serif italic">Avis Clients</h3>
               <button onClick={() => setActiveTab('reviews')} className="label-caps text-[9px]! text-editorial-gold hover:underline">Modérer</button>
            </div>
            <div className="space-y-6">
               {reviews.slice(0, 3).map((r: any) => (
                 <div key={r.id} className="border-b border-neutral-50 pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-bold text-xs">{r.customer_name}</p>
                       <div className="flex text-editorial-gold"><Star size={10} fill="currentColor" /></div>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 italic">&ldquo;{r.comment}&rdquo;</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Popular Products */}
         <div className="bg-white p-10 editorial-border shadow-sm">
            <h3 className="text-2xl font-serif mb-10 flex items-center gap-4 italic">
              <TrendingUp size={20} className="text-editorial-gold" />
              <span>Produits Populaires</span>
            </h3>
            <div className="space-y-6">
               {stats.mostViewed.map((p: any, i: number) => (
                 <div key={i} className="flex items-center justify-between group p-3 hover:bg-neutral-50 transition-all">
                   <span className="font-medium text-neutral-600 font-serif text-lg">{p.name}</span>
                   <span className="label-caps text-[9px]! bg-neutral-100 px-3 py-1 font-bold">{p.views} VUES</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Design Preview */}
         <div className="bg-white p-10 editorial-border shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-serif italic">Aperçu du Design</h3>
               <button onClick={() => setActiveTab('assets')} className="label-caps text-[9px]! text-editorial-gold hover:underline">Modifier</button>
            </div>
            {heroAsset && (
              <div className="aspect-video relative editorial-border overflow-hidden group">
                 <img src={heroAsset.url} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" />
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="label-caps text-white border border-white/20 px-6 py-3 mb-4">Bannière Active</span>
                    <label className="bg-editorial-gold text-white px-6 py-3 label-caps text-[9px]! tracking-widest cursor-pointer hover:bg-white hover:text-editorial-text transition-all shadow-2xl">
                      Remplacer maintenant
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleQuickUpload(heroAsset.id, file);
                        }}
                      />
                    </label>
                 </div>
                 <div className="absolute top-4 right-4 bg-editorial-text/80 text-white px-3 py-1 text-[8px] label-caps backdrop-blur-sm">
                    {heroAsset.key}
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function ProductsView({
  products,
  categories,
  searchTerm,
  statusFilter,
  categoryFilter,
  setSearchTerm,
  setStatusFilter,
  setCategoryFilter,
  onEdit,
  onDelete,
}: {
  products: Product[];
  categories: Category[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  setSearchTerm: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setCategoryFilter: (value: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number | string) => void;
}) {
  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-6 md:p-8 border-b border-neutral-50 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 editorial-border py-4 pl-12 pr-6 outline-none focus:border-editorial-gold text-[10px] label-caps"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:flex md:gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-50 editorial-border py-3 px-4 outline-none text-[10px] label-caps focus:border-editorial-gold min-h-11"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 editorial-border py-3 px-4 outline-none text-[10px] label-caps focus:border-editorial-gold min-h-11"
          >
            <option value="all">Tous les états</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {products.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 italic bg-neutral-50 editorial-border">Aucun produit trouvé.</div>
        ) : (
          products.map((p) => (
            <article
              key={p.id}
              className="bg-neutral-50/60 editorial-border p-4 md:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img src={p.image_url} alt={p.name} className="w-16 h-16 md:w-20 md:h-20 object-cover editorial-border shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-900 text-lg leading-tight wrap-break-word">{p.name}</h4>
                      <p className="text-[10px] text-neutral-400 uppercase italic mt-1 wrap-break-word">{p.badge || "Standard"}</p>
                    </div>
                    <span className={cn(
                      "shrink-0 px-3 py-1 label-caps text-[8px]! border",
                      p.status === "active"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-neutral-100 text-neutral-500 border-neutral-200"
                    )}>
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="label-caps text-[9px]! text-neutral-400">Catégorie</p>
                      <p className="text-neutral-700 wrap-break-word">{p.category_name}</p>
                    </div>
                    <div>
                      <p className="label-caps text-[9px]! text-neutral-400">Prix</p>
                      <p className="font-mono font-bold text-neutral-900">{formatPrice(p.price)}</p>
                    </div>
                    <div>
                      <p className="label-caps text-[9px]! text-neutral-400">Stock</p>
                      <p className={cn("font-bold", p.stock <= 5 ? "text-red-500" : "text-neutral-600")}>{p.stock}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 self-end md:self-auto">
                <button
                  onClick={() => onEdit(p)}
                  className="min-w-11 min-h-11 p-2 text-neutral-400 hover:text-editorial-gold hover:bg-white transition-all editorial-border"
                  aria-label={`Modifier ${p.name}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="min-w-11 min-h-11 p-2 text-neutral-400 hover:text-red-500 hover:bg-white transition-all editorial-border"
                  aria-label={`Supprimer ${p.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function ReviewsView({
  reviews,
  filter,
  setFilter,
  onStatusChange,
  onFeatureChange,
  onDelete,
}: {
  reviews: Review[];
  filter: string;
  setFilter: (value: string) => void;
  onStatusChange: (id: number | string, status: string) => void;
  onFeatureChange: (id: number | string, isFeatured: number) => void;
  onDelete: (id: number | string) => void;
}) {
  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "featured") return r.is_featured === 1;
    return r.status === filter;
  });

  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-6 md:p-8 border-b border-neutral-50 flex flex-col gap-4 md:flex-row md:justify-between md:items-center bg-neutral-50/30">
        <h3 className="font-serif text-2xl">Modération des avis</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white editorial-border py-3 px-4 outline-none text-[10px] label-caps focus:border-editorial-gold min-h-11"
        >
          <option value="all">Tout voir</option>
          <option value="approved">Approuvés</option>
          <option value="pending">En attente</option>
          <option value="featured">Mis en avant</option>
        </select>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 italic bg-neutral-50 editorial-border">Aucun avis correspondant.</div>
        ) : (
          filtered.map((r) => (
            <article
              key={r.id}
              className="bg-neutral-50/60 editorial-border p-4 md:p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-neutral-900 text-lg">{r.customer_name}</h4>
                  <p className="text-[10px] text-neutral-400 font-mono italic mt-1">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-xs font-medium text-neutral-600 uppercase tracking-tight mt-2 wrap-break-word">
                    {r.product_name}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 px-3 py-1 label-caps text-[8px]! border",
                    r.status === "approved"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-orange-50 text-orange-700 border-orange-100"
                  )}
                >
                  {r.status}
                </span>
              </div>

              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < r.rating ? "fill-editorial-gold text-editorial-gold" : "text-neutral-200"}
                  />
                ))}
              </div>

              <p className="text-sm text-neutral-600 italic leading-relaxed wrap-break-word">
                “{r.comment}”
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onFeatureChange(r.id, r.is_featured === 1 ? 0 : 1)}
                  className={cn(
                    "min-w-11 min-h-11 p-2 editorial-border transition-all",
                    r.is_featured === 1 ? "text-editorial-gold" : "text-neutral-300 hover:text-editorial-gold"
                  )}
                  title="Mettre en avant"
                >
                  <Star size={16} fill={r.is_featured === 1 ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => onStatusChange(r.id, r.status === "approved" ? "pending" : "approved")}
                  className="min-w-11 min-h-11 p-2 editorial-border text-neutral-300 hover:text-blue-500 transition-all"
                  title={r.status === "approved" ? "Masquer" : "Approuver"}
                >
                  {r.status === "approved" ? <XIcon size={16} /> : <Check size={16} />}
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="min-w-11 min-h-11 p-2 editorial-border text-neutral-300 hover:text-red-500 transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function OrdersView({
  orders,
  filter,
  setFilter,
  onStatusChange,
  onDelete,
}: {
  orders: AdminOrder[];
  filter: string;
  setFilter: (value: string) => void;
  onStatusChange: (id: number | string, status: string) => void;
  onDelete: (id: number | string) => void;
}) {
  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-6 md:p-8 border-b border-neutral-50 flex flex-col gap-4 md:flex-row md:justify-between md:items-center bg-neutral-50/30">
        <h3 className="font-serif text-2xl">Gestion des commandes</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white editorial-border py-3 px-4 outline-none text-[10px] label-caps focus:border-editorial-gold min-h-11"
        >
          <option value="all">Toutes les commandes</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="shipped">Expédiées</option>
          <option value="delivered">Livrées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 italic bg-neutral-50 editorial-border">Aucune commande trouvée.</div>
        ) : (
          filtered.map((o) => (
            <article
              key={o.id}
              className="bg-neutral-50/60 editorial-border p-4 md:p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-neutral-900 text-lg">{o.customer_name}</h4>
                  <p className="text-[10px] label-caps text-editorial-gold flex items-center gap-1 mt-1 wrap-break-word">
                    <MapPin size={10} /> {o.neighborhood}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 font-mono break-all">{o.customer_phone}</p>
                  <p className="text-[9px] text-neutral-400 font-mono italic mt-2">
                    {new Date(o.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-bold text-neutral-900">{formatPrice(o.total_price)}</p>
                  <select
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    className={cn(
                      "mt-2 py-2 px-3 label-caps text-[8px]! border outline-none min-h-11",
                      o.status === "pending"
                        ? "bg-orange-50 text-orange-700 border-orange-100"
                        : o.status === "confirmed"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : o.status === "delivered"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-neutral-50 text-neutral-500 border-neutral-100"
                    )}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {o.items.map((item, idx) => (
                  <div key={`${o.id}-${idx}`} className="bg-white editorial-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-sm text-neutral-700 wrap-break-word">
                        {item.product_name} x{item.quantity}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 italic mt-1 wrap-break-word">
                      {item.color ? `C: ${item.color}` : ""} {item.size ? `T: ${item.size}` : ""}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => onDelete(o.id)}
                  className="min-w-11 min-h-11 p-2 editorial-border text-neutral-300 hover:text-red-500 transition-all"
                  aria-label={`Supprimer la commande ${o.customer_name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function CategoriesView({ categories, onAdd, onDelete }: any) {
  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
        <h3 className="font-serif text-2xl">Gestion des rayons</h3>
        <button 
          onClick={onAdd}
          className="bg-editorial-text text-white px-6 py-2 label-caps text-[9px]! flex items-center gap-2"
        >
          <Plus size={14} /> Ajouter un rayon
        </button>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c: any) => (
          <div key={c.id} className="p-6 bg-neutral-50 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-neutral-100">
            <span className="font-serif text-xl italic">{c.name}</span>
            <button 
              onClick={() => onDelete(c.id)}
              className="p-2 text-neutral-200 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityView({ activity }: any) {
  return (
    <div className="bg-white editorial-border shadow-sm p-10 animate-in fade-in duration-500">
      <h3 className="text-2xl font-serif mb-10">Historique des opérations</h3>
      <div className="space-y-4">
         {activity.map((log: any) => (
           <div key={log.id} className="flex gap-6 p-6 border-b border-neutral-50 items-start hover:bg-neutral-50 transition-colors">
              <div className="p-3 bg-neutral-100 rounded-xl mt-1"><Activity size={16} className="text-neutral-400" /></div>
              <div className="flex-1 space-y-1">
                 <div className="flex justify-between items-center">
                    <span className="font-bold label-caps text-[10px]! text-editorial-text">{log.action}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                 </div>
                 <p className="text-sm text-neutral-500">{log.details}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}


function AssetsView({ assets, token, onUpdate }: any) {
  const safeToken = token && token !== "undefined" && token !== "null" ? token : "";
  const authHeaders: Record<string, string> = safeToken ? { Authorization: `Bearer ${safeToken}` } : {};
  const handleUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        onUpdate(id, { url: data.imageUrl });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="mb-12">
        <h3 className="text-4xl font-serif mb-4 italic">Design & Apparence</h3>
        <p className="text-neutral-400 text-sm font-light max-w-2xl">Personnalisez les visuels et les messages clés de votre boutique pour maintenir une image de marque premium et cohérente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {assets.map((asset: any) => (
          <div key={asset.id} className="bg-white editorial-border shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] group overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
            {/* Header Badge */}
            <div className="px-6 py-4 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
               <span className="label-caps text-[9px]! text-editorial-gold font-bold tracking-widest">{asset.category}</span>
               <code className="text-[8px] text-neutral-300 font-mono uppercase">{asset.key}</code>
            </div>

            {/* Image Preview Container */}
            <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
              <img 
                src={asset.url} 
                alt={asset.label} 
                className="w-full h-full object-cover transition-transform duration-1500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 p-8">
                <label className="w-full bg-white text-editorial-text px-6 py-4 label-caps text-[9px]! tracking-widest cursor-pointer hover:bg-editorial-gold hover:text-white transition-all text-center shadow-2xl">
                  Télécharger nouvelle photo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(asset.id, file);
                    }}
                  />
                </label>
                
                <button 
                  onClick={() => {
                    const url = prompt("Entrez l'URL de l'image :", asset.url);
                    if (url && url !== asset.url) onUpdate(asset.id, { url });
                  }}
                  className="w-full bg-neutral-900/80 backdrop-blur-sm text-white px-6 py-4 label-caps text-[9px]! tracking-widest hover:bg-neutral-900 transition-all border border-white/10"
                >
                  Utiliser un lien URL
                </button>
              </div>
            </div>
            
            {/* Asset Info & Content Editor */}
            <div className="p-8 flex-1 flex flex-col">
               <div className="mb-6">
                  <h4 className="font-serif text-xl mb-1">{asset.label}</h4>
                  <p className="text-[10px] text-neutral-400 label-caps tracking-widest">Élément de structure actif</p>
               </div>

               <div className="mt-auto pt-6 border-t border-neutral-50">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] label-caps text-neutral-500 font-bold tracking-widest italic">Textes Associés</span>
                     <button 
                       onClick={() => {
                         if (asset.key === 'hero_main') {
                           let current = { label: "Favori de la saison", title: "Pure Élégance", subtitle: "Look de soirée" };
                           try { if(asset.content) current = JSON.parse(asset.content); } catch(e) {}
                           
                           const label = prompt("Étiquette (ex: Favori de la saison) :", current.label);
                           const title = prompt("Titre principal (ex: Pure Élégance) :", current.title);
                           const subtitle = prompt("Sous-titre (ex: Look de soirée) :", current.subtitle);
                           
                           if (label !== null && title !== null && subtitle !== null) {
                             onUpdate(asset.id, { content: JSON.stringify({ label, title, subtitle }) });
                           }
                         } else {
                           const content = prompt("Modifier le texte associé :", asset.content || "");
                           if (content !== null) onUpdate(asset.id, { content });
                         }
                       }}
                       className="bg-editorial-gold/10 text-editorial-gold px-4 py-2 label-caps text-[9px]! hover:bg-editorial-gold hover:text-white transition-all rounded-sm font-bold"
                     >
                       Personnaliser
                     </button>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-sm">
                    {asset.key === 'hero_main' ? (
                      <div className="space-y-2">
                        {(() => {
                          try {
                            const d = JSON.parse(asset.content || '{}');
                            return (
                              <>
                                <p className="text-[10px] flex justify-between"><span className="text-neutral-400">Label:</span> <span className="font-medium text-editorial-text italic">{d.label || "..."}</span></p>
                                <p className="text-[10px] flex justify-between"><span className="text-neutral-400">Titre:</span> <span className="font-medium text-editorial-text italic">{d.title || "..."}</span></p>
                                <p className="text-[10px] flex justify-between"><span className="text-neutral-400">Sous-titre:</span> <span className="font-medium text-editorial-text italic">{d.subtitle || "..."}</span></p>
                              </>
                            );
                          } catch {
                            return <p className="text-xs text-neutral-400 italic">Configuration par défaut</p>;
                          }
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500 italic leading-relaxed">
                        {asset.content || "Aucun message personnalisé configuré."}
                      </p>
                    )}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
