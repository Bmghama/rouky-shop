
import { useState, useEffect } from "react";
import { Product, Category } from "../../types.ts";
import ProductCard from "./ProductCard.tsx";
import { motion } from "motion/react";
import { Filter, ChevronDown, LayoutGrid, List } from "lucide-react";
import { cn } from "../../lib/utils.ts";

interface ProductGridProps {
  category?: string;
  limit?: number;
  sort?: string;
  hideFilters?: boolean;
  search?: string | null;
}

export default function ProductGrid({ category, limit, sort: initialSort = "recent", hideFilters = false, search }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [sort, setSort] = useState(initialSort);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sort, limit, search]);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let url = `/api/products?status=active&sort=${sort}`;
    if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    let data = await res.json();
    if (limit) data = data.slice(0, limit);
    setProducts(data);
    setLoading(false);
  };

  return (
    <div className={cn("max-w-7xl mx-auto", !hideFilters && "px-6 md:px-12 py-24")}>
      {/* Filters & Header */}
      {!hideFilters && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-[1px] bg-editorial-gold opacity-50"></div>
                 <div className="flex items-center space-x-3 text-neutral-400 label-caps !text-[9px] tracking-[0.3em] font-bold">
                   <span>Accueil</span>
                   <span className="opacity-30">/</span>
                   <span className="text-editorial-gold">Boutique</span>
                 </div>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif text-editorial-text tracking-tighter">Nos Collections</h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-3 bg-white px-6 py-3 editorial-border shadow-sm cursor-pointer hover:bg-neutral-50 transition-colors">
                <Filter size={14} className="text-editorial-gold" />
                <span className="label-caps !text-[9px]">Filtrer</span>
              </div>

              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white px-6 py-3 editorial-border shadow-sm label-caps !text-[9px] outline-none focus:border-editorial-gold cursor-pointer appearance-none"
              >
                <option value="recent">Plus Récents</option>
                <option value="price_asc">Prix Croissant</option>
                <option value="price_desc">Prix Décroissant</option>
                <option value="views">Les Plus Vus</option>
              </select>
            </div>
          </div>

          {/* Categories Toolbar */}
          <div className="flex overflow-x-auto space-x-6 mb-16 pb-4 scrollbar-hide border-b border-editorial-text/5 -mx-6 px-6 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`pb-4 label-caps !text-[11px] whitespace-nowrap transition-all duration-300 border-b-2 font-bold ${
                !selectedCategory ? "border-editorial-gold text-editorial-gold translate-y-[1px]" : "border-transparent text-neutral-400 hover:text-editorial-text"
              }`}
            >
              Tous les articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`pb-4 label-caps !text-[11px] whitespace-nowrap transition-all duration-300 border-b-2 font-bold ${
                  selectedCategory === cat.name ? "border-editorial-gold text-editorial-gold translate-y-[1px]" : "border-transparent text-neutral-400 hover:text-editorial-text"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Grid */}
      {loading ? (
        <div className={cn(
          "grid gap-6 md:gap-8",
          hideFilters ? "grid-flow-col auto-cols-[85%] md:auto-cols-auto md:grid-cols-4 overflow-x-auto md:overflow-visible pb-12 -mx-6 px-6 md:mx-0 md:px-0" : "grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
        )}>
          {[...Array(limit || 8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 h-[450px] md:h-[400px]"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className={cn(
            "grid gap-6 md:gap-8",
            hideFilters ? "grid-flow-col auto-cols-[85%] md:auto-cols-auto md:grid-cols-4 overflow-x-auto md:overflow-visible pb-12 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory" : "grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {products.map((product) => (
            <div key={product.id} className={cn(hideFilters && "snap-center")}>
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-neutral-400 font-serif text-2xl">Aucun produit trouvé dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
}
