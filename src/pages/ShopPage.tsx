import ProductGrid from "../components/shop/ProductGrid.tsx";
import { useState } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-editorial-bg min-h-screen pt-32 pb-24"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[1px] bg-editorial-gold opacity-50"></div>
          <span className="label-caps text-editorial-gold tracking-[0.5em] !text-[11px]">
            {search ? `Résultats pour "${search}"` : "Collection Complète"}
          </span>
        </div>
        <h1 className="text-6xl md:text-9xl font-serif text-editorial-text tracking-tighter italic">
          {search ? "Recherche" : "La Boutique"}
        </h1>
      </div>

      <ProductGrid search={search} />
      
      {/* Newsletter Section */}
      <section className="mt-32 py-24 border-t border-neutral-100 bg-white">
        <NewsletterForm />
      </section>
    </motion.div>
  );
}

function NewsletterForm() {
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async () => {
    if (!whatsapp) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setWhatsapp("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 text-center space-y-10">
      <h2 className="text-4xl md:text-6xl font-serif italic">Restez informée</h2>
      <p className="text-neutral-500 font-light leading-relaxed">
        Inscrivez-vous pour recevoir nos nouvelles collections et offres exclusives directement par WhatsApp.
      </p>
      
      {status === "success" ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-green-50 text-green-700 editorial-border"
        >
          <p className="font-serif italic text-xl mb-2">Bienvenue dans le club !</p>
          <p className="text-xs label-caps !text-[10px]">Votre numéro a été enregistré avec succès.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Votre numéro WhatsApp (ex: +223...)" 
            className="flex-1 editorial-border px-6 py-4 outline-none focus:border-editorial-gold label-caps !text-[11px]"
            disabled={status === "loading"}
          />
          <button 
            onClick={handleSubscribe}
            disabled={status === "loading" || !whatsapp}
            className="bg-editorial-text text-white px-10 py-4 label-caps !text-[11px] shadow-xl hover:bg-neutral-800 transition-all disabled:opacity-50"
          >
            {status === "loading" ? "Envoi..." : "Rejoindre le club"}
          </button>
        </div>
      )}
      {status === "error" && <p className="text-red-500 text-[10px] label-caps">Une erreur est survenue. Veuillez réessayer.</p>}
    </div>
  );
}
