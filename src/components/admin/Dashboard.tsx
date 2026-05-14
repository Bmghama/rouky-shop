import { useState, useEffect } from "react";
import { Stats, Product, Category } from "../../types.ts";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, ShoppingBag, BarChart3, Clock, 
  TrendingUp, Package, Activity, LogOut,
  Plus, Edit, Trash2, Search, Filter,
  AlertTriangle, Eye, MessageCircle, RefreshCw,
  MoreVertical, Check, X as XIcon, Save, ArrowLeft, Star, MapPin
} from "lucide-react";
import { formatPrice, cn } from "../../lib/utils.ts";
import ProductForm from "./ProductForm.tsx";

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

type Tab = 'stats' | 'products' | 'orders' | 'categories' | 'reviews' | 'activity' | 'assets' | 'newsletter';

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, catRes, reviewRes, orderRes, assetRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/products?status=all", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/categories"),
        fetch("/api/admin/reviews", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/orders", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/assets", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (statsRes.status === 401) {
        onLogout();
        return;
      }

      const statsData = await statsRes.json();
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const reviewData = await reviewRes.json();
      const orderData = await orderRes.json();
      const assetData = await assetRes.json();

      setStats(statsData);
      setProducts(prodData);
      setCategories(catData);
      setReviews(reviewData);
      setOrders(orderData);
      setAssets(assetData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewFeature = async (id: number, is_featured: number) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_featured })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewDelete = async (id: number) => {
    if (confirm("Supprimer cet avis ?")) {
      try {
        const res = await fetch(`/api/admin/reviews/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderDelete = async (id: number) => {
    if (confirm("Supprimer cette commande ?")) {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
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
          headers: { 
            "Authorization": `Bearer ${token}`,
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



  const handleCategoryDelete = async (id: number) => {
    if (confirm("Supprimer ce rayon ? Cela ne supprimera pas les produits associés.")) {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAssetUpdate = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/admin/assets/${id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category_name === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-editorial-text text-white md:h-screen sticky top-0 flex flex-col z-[70] shadow-2xl transition-all duration-500 overflow-hidden">
        <div className="p-10 border-b border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-editorial-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h2 className="text-3xl font-serif italic tracking-tight text-white relative z-10">Rouky Admin</h2>
          <div className="flex items-center gap-3 mt-4 relative z-10">
            <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></div>
            <p className="text-[9px] label-caps tracking-[0.3em] text-editorial-gold font-bold">Système Actif</p>
          </div>
        </div>

        <div className="px-10 py-6 border-b border-white/5">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center space-x-3 text-red-500 bg-red-500/5 hover:bg-red-500/20 py-4 transition-all font-bold label-caps !text-[10px] tracking-widest border border-red-500/10 hover:border-red-500/30"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto custom-scrollbar">
          <NavButton 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
            icon={<BarChart3 size={20} />} 
            label="Vue d'ensemble" 
          />
          <NavButton 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
            icon={<Package size={20} />} 
            label="Gestion Catalogue" 
          />
          <NavButton 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
            icon={<ShoppingBag size={20} />} 
            label="Commandes" 
          />
          <NavButton 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')} 
            icon={<Filter size={20} />} 
            label="Rayons / Catégories" 
          />
          <NavButton 
            active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')} 
            icon={<Star size={20} />} 
            label="Avis Clientes" 
          />
          <NavButton 
            active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')} 
            icon={<Clock size={20} />} 
            label="Journal de bord" 
          />
          <NavButton 
            active={activeTab === 'assets'} 
            onClick={() => setActiveTab('assets')} 
            icon={<Eye size={20} />} 
            label="Design & Apparence" 
          />
          <NavButton 
            active={activeTab === 'newsletter'} 
            onClick={() => setActiveTab('newsletter')} 
            icon={<MessageCircle size={20} />} 
            label="Club WhatsApp" 
          />
        </nav>

        <div className="p-10 border-t border-white/5 mt-auto">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-between group px-6 py-4 border border-white/10 hover:border-editorial-gold transition-all duration-300"
          >
            <span className="label-caps !text-[9px] tracking-widest text-white/50 group-hover:text-white">Retour boutique</span>
            <ArrowLeft size={14} className="text-white/30 group-hover:text-editorial-gold group-hover:-translate-x-1 transition-all" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-16 lg:p-20 overflow-y-auto bg-neutral-50/50">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <span className="w-12 h-[1px] bg-editorial-gold"></span>
               <span className="label-caps text-editorial-gold font-bold !text-[9px] tracking-[0.4em]">Administration Centrale</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 leading-tight">
              {activeTab === 'stats' ? "Performances" : activeTab === 'products' ? "Le Catalogue" : activeTab === 'assets' ? "Design & Apparence" : activeTab === 'newsletter' ? "Club WhatsApp" : "L'Historique"}
            </h1>
          </div>
          
          <div className="flex items-center gap-5 w-full lg:w-auto">
             <button 
               onClick={fetchData} 
               className="p-4 bg-white shadow-xl editorial-border text-neutral-400 hover:text-editorial-gold hover:scale-110 active:scale-95 transition-all"
               title="Actualiser les données"
             >
               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             
             {activeTab === 'products' && (
               <button 
                onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                className="flex-1 lg:flex-none bg-editorial-text text-white px-10 py-5 label-caps !text-[10px] tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:bg-neutral-800 transition-all hover:-translate-y-1 active:translate-y-0"
               >
                 <Plus size={18} />
                 <span>Nouveau Produit</span>
               </button>
             )}
          </div>
        </header>

        {activeTab === 'stats' && stats && (
          <StatsView 
            stats={stats} 
            orders={orders} 
            reviews={reviews} 
            assets={assets}
            setActiveTab={setActiveTab}
            token={token}
            onUpdate={handleAssetUpdate}
          />
        )}
        {activeTab === 'products' && (
          <ProductsView 
            products={filteredProducts} 
            categories={categories}
            searchTerm={searchTerm} 
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            setSearchTerm={setSearchTerm} 
            setStatusFilter={setStatusFilter}
            setCategoryFilter={setCategoryFilter}
            onEdit={(p: Product) => { setEditingProduct(p); setIsFormOpen(true); }} 
            onDelete={handleDelete} 
          />
        )}
        {activeTab === 'orders' && (
          <OrdersView 
            orders={orders}
            filter={orderFilter}
            setFilter={setOrderFilter}
            onStatusChange={handleOrderStatus}
            onDelete={handleOrderDelete}
          />
        )}
        {activeTab === 'categories' && (
          <CategoriesView 
            categories={categories}
            onAdd={handleCategoryAdd}
            onDelete={handleCategoryDelete}
          />
        )}
        {activeTab === 'reviews' && (
          <ReviewsView 
            reviews={reviews}
            filter={reviewFilter}
            setFilter={setReviewFilter}
            onStatusChange={handleReviewStatus}
            onFeatureChange={handleReviewFeature}
            onDelete={handleReviewDelete}
          />
        )}
        {activeTab === 'activity' && stats && <ActivityView activity={stats.recentActivity} />}
        {activeTab === 'assets' && (
          <AssetsView 
            assets={assets} 
            token={token} 
            onUpdate={handleAssetUpdate} 
          />
        )}
        {activeTab === 'newsletter' && <NewsletterView token={token} />}
      </main>

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
    </div>
  );
}

function NewsletterView({ token }: { token: string }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/newsletter', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSubscribers(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h3 className="text-4xl font-serif mb-4 italic">Club WhatsApp</h3>
          <p className="text-neutral-400 text-sm font-light">Liste des clientes inscrites pour recevoir les nouveautés.</p>
        </div>
        <div className="bg-editorial-gold/10 text-editorial-gold px-6 py-3 rounded-full label-caps !text-[10px]">
          {subscribers.length} Abonnées
        </div>
      </div>

      <div className="bg-white editorial-border shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="p-6 label-caps !text-[10px] text-neutral-400">Date d'inscription</th>
              <th className="p-6 label-caps !text-[10px] text-neutral-400">Numéro WhatsApp</th>
              <th className="p-6 label-caps !text-[10px] text-neutral-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-20 text-center animate-pulse text-neutral-300 font-serif italic">Chargement du club...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={3} className="p-20 text-center text-neutral-300 font-serif italic text-xl">Aucune inscription pour le moment.</td></tr>
            ) : subscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                <td className="p-6 text-xs text-neutral-500">
                  {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="p-6">
                  <a 
                    href={`https://wa.me/${sub.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    className="text-editorial-text font-mono font-bold hover:text-editorial-gold transition-colors flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                      <MessageCircle size={14} className="text-[#25D366]" />
                    </div>
                    {sub.whatsapp}
                  </a>
                </td>
                <td className="p-6">
                  <button className="text-neutral-300 hover:text-red-500 transition-colors label-caps !text-[9px]">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-5 px-8 py-5 transition-all duration-500 font-bold label-caps !text-[10px] tracking-[0.2em] relative overflow-hidden group",
        active 
          ? "text-editorial-gold bg-white/5 border-r-4 border-editorial-gold shadow-[inset_0_0_20px_rgba(197,162,103,0.05)]" 
          : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <span className={cn(
        "transition-transform duration-500 group-hover:scale-110",
        active ? "text-editorial-gold" : "text-white/20"
      )}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="activeGlow"
          className="absolute inset-0 bg-editorial-gold/5 blur-xl pointer-events-none"
        />
      )}
    </button>
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
      <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-900/[0.02] rounded-bl-full -mr-12 -mt-12 group-hover:bg-editorial-gold/5 transition-all duration-700"></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="p-4 bg-neutral-50 rounded-2xl group-hover:bg-white group-hover:shadow-lg transition-all duration-500">{icon}</div>
      </div>
      <div className="relative z-10">
        <p className="label-caps !text-[9px] tracking-[0.3em] font-bold text-neutral-400 mb-3">{title}</p>
        <p className="text-5xl font-serif text-neutral-900 group-hover:text-editorial-gold transition-colors duration-500">{value}</p>
      </div>
    </motion.div>
  );
}

function StatsView({ stats, orders, reviews, assets, setActiveTab, token, onUpdate }: any) {
  const latestOrders = orders.slice(0, 3);
  const pendingReviews = reviews.filter((r: any) => r.status === 'pending').slice(0, 3);
  const heroAsset = assets.find((a: any) => a.key === 'hero_main');

  const handleQuickUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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
               <button onClick={() => setActiveTab('orders')} className="label-caps !text-[9px] text-editorial-gold hover:underline">Voir tout</button>
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
                          "px-2 py-1 label-caps !text-[8px] border mt-2 inline-block",
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
               <button onClick={() => setActiveTab('reviews')} className="label-caps !text-[9px] text-editorial-gold hover:underline">Modérer</button>
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
                   <span className="label-caps !text-[9px] bg-neutral-100 px-3 py-1 font-bold">{p.views} VUES</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Design Preview */}
         <div className="bg-white p-10 editorial-border shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-serif italic">Aperçu du Design</h3>
               <button onClick={() => setActiveTab('assets')} className="label-caps !text-[9px] text-editorial-gold hover:underline">Modifier</button>
            </div>
            {heroAsset && (
              <div className="aspect-video relative editorial-border overflow-hidden group">
                 <img src={heroAsset.url} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" />
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="label-caps text-white border border-white/20 px-6 py-3 mb-4">Bannière Active</span>
                    <label className="bg-editorial-gold text-white px-6 py-3 label-caps !text-[9px] tracking-widest cursor-pointer hover:bg-white hover:text-editorial-text transition-all shadow-2xl">
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

function ProductsView({ products, categories, searchTerm, statusFilter, categoryFilter, setSearchTerm, setStatusFilter, setCategoryFilter, onEdit, onDelete }: any) {
  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-8 border-b border-neutral-50 flex flex-col md:flex-row justify-between gap-6">
         <div className="relative flex-1 max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
           <input 
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 editorial-border py-4 pl-12 pr-6 outline-none focus:border-editorial-gold text-[10px] label-caps"
           />
         </div>
         <div className="flex gap-4">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-neutral-50 editorial-border py-2 px-6 outline-none text-[10px] label-caps focus:border-editorial-gold"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 editorial-border py-2 px-6 outline-none text-[10px] label-caps focus:border-editorial-gold"
            >
              <option value="all">Tous les états</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
         </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr className="label-caps !text-[9px] text-neutral-500 text-left border-b border-neutral-100">
              <th className="px-8 py-6">Produit</th>
              <th className="px-8 py-6">Catégorie</th>
              <th className="px-8 py-6">Prix</th>
              <th className="px-8 py-6">Stock</th>
              <th className="px-8 py-6">État</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={p.image_url} className="w-12 h-12 object-cover editorial-border" />
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-neutral-900">{p.name}</span>
                      <span className="text-[10px] text-neutral-400 uppercase italic">{p.badge || "Standard"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6"><span className="label-caps !text-[9px] opacity-60 text-xs">{p.category_name}</span></td>
                <td className="px-8 py-6 font-mono text-sm font-bold">{formatPrice(p.price)}</td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "text-xs font-bold px-2 py-1",
                    p.stock <= 5 ? "bg-red-50 text-red-500" : "text-neutral-500"
                  )}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 label-caps !text-[8px] border",
                    p.status === 'active' ? "bg-green-50 text-green-700 border-green-100" : "bg-neutral-100 text-neutral-500 border-neutral-200"
                  )}>
                    {p.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(p)} className="p-2 text-neutral-400 hover:text-editorial-gold hover:bg-neutral-50 transition-all"><Edit size={16} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewsView({ reviews, filter, setFilter, onStatusChange, onFeatureChange, onDelete }: any) {
  const filtered = reviews.filter((r: any) => {
    if (filter === 'all') return true;
    if (filter === 'featured') return r.is_featured === 1;
    return r.status === filter;
  });

  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
        <h3 className="font-serif text-2xl">Modération des avis</h3>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white editorial-border py-2 px-6 outline-none text-[10px] label-caps focus:border-editorial-gold"
        >
          <option value="all">Tout voir</option>
          <option value="approved">Approuvés</option>
          <option value="pending">En attente</option>
          <option value="featured">Mis en avant</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="label-caps !text-[9px] text-neutral-500 text-left border-b border-neutral-100 bg-neutral-50/50">
              <th className="px-8 py-6">Cliente</th>
              <th className="px-8 py-6">Produit</th>
              <th className="px-8 py-6">Note</th>
              <th className="px-8 py-6">Commentaire</th>
              <th className="px-8 py-6">État</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((r: any) => (
              <tr key={r.id} className="hover:bg-neutral-50/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-serif font-bold text-neutral-900">{r.customer_name}</div>
                  <div className="text-[9px] text-neutral-400 font-mono italic">{new Date(r.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs font-medium text-neutral-600 uppercase tracking-tight">{r.product_name}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < r.rating ? "fill-editorial-gold text-editorial-gold" : "text-neutral-200"} />
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 max-w-xs">
                  <p className="text-xs text-neutral-500 italic line-clamp-2">"{r.comment}"</p>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 label-caps !text-[8px] border",
                    r.status === 'approved' ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                  )}>
                    {r.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onFeatureChange(r.id, r.is_featured === 1 ? 0 : 1)}
                      className={cn(
                        "p-2 transition-all",
                        r.is_featured === 1 ? "text-editorial-gold" : "text-neutral-300 hover:text-editorial-gold"
                      )}
                      title="Mettre en avant"
                    >
                      <Star size={16} fill={r.is_featured === 1 ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => onStatusChange(r.id, r.status === 'approved' ? 'pending' : 'approved')}
                      className="p-2 text-neutral-300 hover:text-blue-500 transition-all"
                      title={r.status === 'approved' ? "Masquer" : "Approuver"}
                    >
                      {r.status === 'approved' ? <XIcon size={16} /> : <Check size={16} />}
                    </button>
                    <button 
                      onClick={() => onDelete(r.id)}
                      className="p-2 text-neutral-300 hover:text-red-500 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersView({ orders, filter, setFilter, onStatusChange, onDelete }: any) {
  const filtered = orders.filter((o: any) => filter === 'all' || o.status === filter);

  return (
    <div className="bg-white editorial-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
        <h3 className="font-serif text-2xl">Gestion des commandes</h3>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white editorial-border py-2 px-6 outline-none text-[10px] label-caps focus:border-editorial-gold"
        >
          <option value="all">Toutes les commandes</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="shipped">Expédiées</option>
          <option value="delivered">Livrées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="label-caps !text-[9px] text-neutral-500 text-left border-b border-neutral-100 bg-neutral-50/50">
              <th className="px-8 py-6">Client / Quartier</th>
              <th className="px-8 py-6">Articles</th>
              <th className="px-8 py-6">Total</th>
              <th className="px-8 py-6">État</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((o: any) => (
              <tr key={o.id} className="hover:bg-neutral-50/30 transition-colors align-top">
                <td className="px-8 py-6">
                  <div className="font-serif font-bold text-neutral-900">{o.customer_name}</div>
                  <div className="text-[10px] label-caps text-editorial-gold flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {o.neighborhood}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 font-mono">{o.customer_phone}</div>
                  <div className="text-[9px] text-neutral-400 font-mono italic mt-2">{new Date(o.created_at).toLocaleString()}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-2">
                    {o.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs text-neutral-600 flex flex-col">
                        <span className="font-bold">{item.product_name} x{item.quantity}</span>
                        <span className="text-[10px] text-neutral-400 italic">
                          {item.color ? `C: ${item.color}` : ''} {item.size ? `T: ${item.size}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 font-mono text-sm font-bold">{formatPrice(o.total_price)}</td>
                <td className="px-8 py-6">
                  <select 
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    className={cn(
                      "px-2 py-1 label-caps !text-[8px] border outline-none",
                      o.status === 'pending' ? "bg-orange-50 text-orange-700 border-orange-100" :
                      o.status === 'confirmed' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      o.status === 'delivered' ? "bg-green-50 text-green-700 border-green-100" :
                      "bg-neutral-50 text-neutral-500 border-neutral-100"
                    )}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => onDelete(o.id)}
                    className="p-2 text-neutral-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          className="bg-editorial-text text-white px-6 py-2 label-caps !text-[9px] flex items-center gap-2"
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
                    <span className="font-bold label-caps !text-[10px] text-editorial-text">{log.action}</span>
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
  const handleUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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
               <span className="label-caps !text-[9px] text-editorial-gold font-bold tracking-widest">{asset.category}</span>
               <code className="text-[8px] text-neutral-300 font-mono uppercase">{asset.key}</code>
            </div>

            {/* Image Preview Container */}
            <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
              <img 
                src={asset.url} 
                alt={asset.label} 
                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 p-8">
                <label className="w-full bg-white text-editorial-text px-6 py-4 label-caps !text-[9px] tracking-widest cursor-pointer hover:bg-editorial-gold hover:text-white transition-all text-center shadow-2xl">
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
                  className="w-full bg-neutral-900/80 backdrop-blur-sm text-white px-6 py-4 label-caps !text-[9px] tracking-widest hover:bg-neutral-900 transition-all border border-white/10"
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
                       className="bg-editorial-gold/10 text-editorial-gold px-4 py-2 label-caps !text-[9px] hover:bg-editorial-gold hover:text-white transition-all rounded-sm font-bold"
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
