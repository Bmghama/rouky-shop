
import { useState, useEffect } from "react";
import { Product, Category } from "../../types.ts";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Plus, Trash2, Eye, ShieldCheck, ArrowUp, ArrowDown } from "lucide-react";
import { formatPrice, cn } from "../../lib/utils.ts";

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: () => void;
  token: string;
}

export default function ProductForm({ product, categories, onClose, onSubmit, token }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      price: 0,
      old_price: 0,
      description: "",
      long_description: "",
      category_id: categories[0]?.id,
      sub_category: "",
      image_url: "",
      gallery_urls: "[]",
      colors: "[]",
      sizes: "[]",
      highlights: JSON.stringify([
        { label: "Matière", value: "" },
        { label: "Style", value: "" },
        { label: "Coupe", value: "" }
      ]),
      stock: 0,
      badge: "",
      status: "active"
    }
  );

  const [gallery, setGallery] = useState<string[]>(JSON.parse(formData.gallery_urls || "[]"));
  const [colors, setColors] = useState<string[]>(JSON.parse(formData.colors || "[]"));
  const [sizes, setSizes] = useState<string[]>(JSON.parse(formData.sizes || "[]"));
  const [highlights, setHighlights] = useState<{label: string, value: string}[]>(JSON.parse(formData.highlights || "[]"));
  const [loading, setLoading] = useState(false);

  const safeToken = typeof token === "string" && token && token !== "undefined" && token !== "null" ? token : "";
  const authHeaders: Record<string, string> = safeToken ? { Authorization: `Bearer ${safeToken}` } : {};

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const uploadData = new FormData();
      uploadData.append("image", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          headers: { ...authHeaders },
          body: uploadData
        });
        const data = await res.json();
        if (data.success) {
          setGallery(prev => [...prev, data.imageUrl]);
          // If no main image yet, set this one
          if (!formData.image_url) {
            setFormData(prev => ({ ...prev, image_url: data.imageUrl }));
          }
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    
    // Reset input
    e.target.value = '';
  };

  const setMainImage = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...gallery];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newList.length) {
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
      setGallery(newList);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      gallery_urls: JSON.stringify(gallery),
      colors: JSON.stringify(colors),
      sizes: JSON.stringify(sizes),
      highlights: JSON.stringify(highlights)
    };

    const method = product ? "PUT" : "POST";
    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSubmit();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (value && !list.includes(value)) {
      setList([...list, value]);
    }
  };

  const removeItem = (list: string[], setList: (l: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-100 flex justify-end"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white h-screen overflow-y-auto shadow-2xl p-10"
      >
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-neutral-100">
          <div>
            <h2 className="text-3xl font-serif text-neutral-900">{product ? "Modifier" : "Ajouter"} un produit</h2>
            <p className="text-neutral-500 text-sm mt-1">Configurez les détails du produit premium</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="label-caps text-[10px]! mb-2 block">Nom du produit</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold font-serif text-lg"
                placeholder="Ex: Robe de soirée"
              />
            </div>
            
            <div>
              <label className="label-caps text-[10px]! mb-2 block">Prix (FCFA)</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold font-mono"
              />
            </div>

            <div>
              <label className="label-caps text-[10px]! mb-2 block">Ancien Prix (FCFA)</label>
              <input
                type="number"
                value={formData.old_price || 0}
                onChange={(e) => setFormData({ ...formData, old_price: parseInt(e.target.value) })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold font-mono opacity-60"
              />
            </div>
          </div>

          {/* Categories & Inventory */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-caps text-[10px]! mb-2 block">Catégorie</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-caps text-[10px]! mb-2 block">Sous-catégorie</label>
              <input
                type="text"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold"
                placeholder="Ex: Cocktail"
              />
            </div>

            <div>
              <label className="label-caps text-[10px]! mb-2 block">Stock</label>
              <input
                required
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold font-mono"
              />
            </div>

            <div>
              <label className="label-caps text-[10px]! mb-2 block">Badge</label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold appearance-none"
              >
                <option value="">Aucun</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Promo">Promo</option>
                <option value="Best seller">Best seller</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div>
              <label className="label-caps text-[10px]! mb-2 block">Description Courte</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold italic"
            />
          </div>

          <div>
              <label className="label-caps text-[10px]! mb-2 block">Description Longue</label>
            <textarea
              rows={4}
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              className="w-full editorial-border px-4 py-3 outline-none focus:border-editorial-gold"
            />
          </div>

          {/* Images Management */}
          <div className="space-y-6 p-6 bg-neutral-50 editorial-border">
            <div className="flex justify-between items-end mb-4">
              <div>
                <label className="label-caps text-[10px]! block mb-1">Gestion des Médias</label>
                <p className="text-[10px] text-neutral-400">Importez plusieurs images. La première sera l'image principale par défaut.</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  id="multi-upload" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="multi-upload"
                  className="bg-neutral-900 text-white px-6 py-2 label-caps text-[9px]! cursor-pointer hover:bg-neutral-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <Plus size={14} />
                  Importer des photos
                </label>
              </div>
            </div>

            {/* Main Image Selection */}
            <div className="mb-8">
              <label className="label-caps text-[9px]! text-neutral-400 mb-2 block">Image Principale Actuelle</label>
              <div className="aspect-video w-full editorial-border bg-white overflow-hidden relative group">
                {formData.image_url ? (
                  <img src={formData.image_url} className="w-full h-full object-contain" alt="Main" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
                    <Upload size={32} className="mb-2" />
                    <span className="label-caps text-[10px]!">Aucune image principale</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white p-4 label-caps text-[10px]! text-neutral-900">
                    Sélectionnez une image de la galerie
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div>
              <label className="label-caps text-[9px]! text-neutral-400 mb-4 block">Galerie ({gallery.length} images)</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {gallery.map((url, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "relative group aspect-square bg-white border transition-all",
                      formData.image_url === url ? "border-editorial-gold ring-1 ring-editorial-gold" : "editorial-border"
                    )}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setMainImage(url)}
                        className="p-1 px-2 bg-editorial-gold text-white text-[8px] label-caps"
                      >
                        Principale
                      </button>
                      <div className="flex gap-1">
                        <button 
                          type="button"
                          onClick={() => moveItem(i, 'up')}
                          disabled={i === 0}
                          className="p-1 bg-white hover:bg-neutral-100 disabled:opacity-30"
                        >
                          <Plus size={10} className="rotate-45" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeItem(gallery, setGallery, i)}
                          className="p-1 bg-red-500 text-white"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>

                    {formData.image_url === url && (
                      <div className="absolute -top-2 -right-2 bg-editorial-gold text-white p-1 rounded-full shadow-lg">
                        <ShieldCheck size={10} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Manual URL Add */}
                <button 
                  type="button"
                  onClick={() => {
                    const url = prompt("Collez l'URL de l'image:");
                    if (url) addItem(gallery, setGallery, url);
                  }}
                  className="aspect-square border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 hover:border-editorial-gold hover:text-editorial-gold transition-all"
                >
                  <Plus size={18} />
                  <span className="text-[8px] label-caps mt-1">Lien URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Variations */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="label-caps text-[10px]! mb-2 block">Couleurs</label>
              <div className="flex gap-2 mb-2">
                <input id="color-input" type="text" className="flex-1 editorial-border px-3 py-1 outline-none text-sm" placeholder="Noir, Rouge..." />
                <button 
                  type="button" 
                  onClick={() => {
                    const el = document.getElementById('color-input') as HTMLInputElement;
                    addItem(colors, setColors, el.value);
                    el.value = '';
                  }}
                  className="bg-neutral-100 p-2"
                ><Plus size={14} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <span key={i} className="bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    {c} <X size={10} className="cursor-pointer" onClick={() => removeItem(colors, setColors, i)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="label-caps text-[10px]! mb-2 block">Tailles</label>
              <div className="flex gap-2 mb-2">
                <input id="size-input" type="text" className="flex-1 editorial-border px-3 py-1 outline-none text-sm" placeholder="S, M, L, XL..." />
                <button 
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('size-input') as HTMLInputElement;
                    addItem(sizes, setSizes, el.value);
                    el.value = '';
                  }}
                  className="bg-neutral-100 p-2"
                ><Plus size={14} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s, i) => (
                  <span key={i} className="bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    {s} <X size={10} className="cursor-pointer" onClick={() => removeItem(sizes, setSizes, i)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 p-6 bg-neutral-50 editorial-border">
             <label className="label-caps text-[10px]! block">Points Forts (3 max)</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Libellé (ex: Matière)" 
                      value={highlights[idx]?.label || ""}
                      onChange={(e) => {
                        const newH = [...highlights];
                        if (!newH[idx]) newH[idx] = { label: "", value: "" };
                        newH[idx].label = e.target.value;
                        setHighlights(newH);
                      }}
                      className="w-full text-[10px] label-caps editorial-border px-3 py-2 outline-none focus:border-editorial-gold"
                    />
                    <input 
                      type="text" 
                      placeholder="Valeur (ex: Premium)" 
                      value={highlights[idx]?.value || ""}
                      onChange={(e) => {
                        const newH = [...highlights];
                        if (!newH[idx]) newH[idx] = { label: "", value: "" };
                        newH[idx].value = e.target.value;
                        setHighlights(newH);
                      }}
                      className="w-full text-xs font-bold editorial-border px-3 py-2 outline-none focus:border-editorial-gold"
                    />
                  </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 p-6 bg-neutral-50 editorial-border">
            <div className="flex-1">
              <label className="label-caps text-[10px]! mb-2 block">État du produit</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, status: formData.status === 'active' ? 'inactive' : 'active'})}
                className={cn(
                  "w-full px-6 py-3 label-caps text-[9px]! transition-all border",
                  formData.status === 'active' ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                )}
              >
                {formData.status === 'active' ? '● Actif (Publié)' : '○ Inactif (Brouillon)'}
              </button>
            </div>
            
            <div className="flex-1">
              <label className="label-caps text-[10px]! mb-2 block">Aperçu rapide</label>
              <button 
                type="button"
                className="w-full px-6 py-3 label-caps text-[9px]! bg-white border border-neutral-200 hover:border-editorial-gold transition-all"
                onClick={() => {
                  alert("Aperçu visuel:\nNom: " + formData.name + "\nStock: " + formData.stock + "\nPrix: " + formatPrice(formData.price || 0));
                }}
              >
                <Eye size={14} className="inline mr-2" />
                Vérifier les données
              </button>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-6 flex justify-end gap-4 z-110 max-w-2xl ml-auto">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-3 label-caps text-[10px]! hover:bg-neutral-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-editorial-text text-white px-12 py-3 label-caps text-[10px]! shadow-xl hover:bg-neutral-800 transition-all flex items-center gap-3"
            >
              <Upload size={14} />
              {loading ? "Enregistrement..." : "Enregistrer le produit"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
