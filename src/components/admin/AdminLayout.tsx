import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut,
  BarChart3,
  Package,
  ShoppingBag,
  Filter,
  Star,
  Clock,
  Eye,
  MessageCircle,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils.ts";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function AdminLayout({
  children,
  activeTab,
  setActiveTab,
  onLogout,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    {
      id: "stats",
      label: "Vue d'ensemble",
      icon: <BarChart3 size={20} />,
    },
    {
      id: "products",
      label: "Gestion Catalogue",
      icon: <Package size={20} />,
    },
    {
      id: "orders",
      label: "Commandes",
      icon: <ShoppingBag size={20} />,
    },
    {
      id: "categories",
      label: "Rayons / Catégories",
      icon: <Filter size={20} />,
    },
    {
      id: "reviews",
      label: "Avis Clientes",
      icon: <Star size={20} />,
    },
    {
      id: "activity",
      label: "Journal de bord",
      icon: <Clock size={20} />,
    },
    {
      id: "assets",
      label: "Design & Apparence",
      icon: <Eye size={20} />,
    },
    {
      id: "newsletter",
      label: "Club WhatsApp",
      icon: <MessageCircle size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 bg-editorial-text text-white h-screen sticky top-0 flex-col z-[70] shadow-2xl">
        <SidebarContent
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-neutral-100 flex items-center justify-between p-4">
        <h2 className="text-xl font-serif italic text-editorial-text">Rouky Admin</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-neutral-100 transition-colors"
          title="Menu"
        >
          {sidebarOpen ? (
            <X size={24} className="text-editorial-text" />
          ) : (
            <Menu size={24} className="text-editorial-text" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 md:hidden z-40"
            />

            {/* Drawer Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed left-0 top-0 w-64 h-screen bg-editorial-text text-white flex flex-col z-50 shadow-2xl md:hidden"
            >
              <div className="p-6 border-b border-white/5">
                <h2 className="text-2xl font-serif italic tracking-tight text-white mb-2">
                  Rouky Admin
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></div>
                  <p className="text-[9px] label-caps tracking-[0.3em] text-editorial-gold font-bold">
                    Système Actif
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-white/5">
                <button
                  onClick={() => {
                    onLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 text-red-500 bg-red-500/5 hover:bg-red-500/20 py-3 transition-all font-bold label-caps !text-[10px] tracking-widest border border-red-500/10 hover:border-red-500/30"
                >
                  <LogOut size={14} />
                  <span>Déconnexion</span>
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {tabs.map((tab) => (
                  <NavButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    icon={tab.icon}
                    label={tab.label}
                  />
                ))}
              </nav>

              <div className="p-6 border-t border-white/5">
                <button
                  onClick={() => {
                    window.location.href = "/";
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between group px-4 py-3 border border-white/10 hover:border-editorial-gold transition-all text-sm"
                >
                  <span className="label-caps !text-[9px] tracking-widest text-white/50 group-hover:text-white">
                    Retour boutique
                  </span>
                  <ArrowLeft
                    size={12}
                    className="text-white/30 group-hover:text-editorial-gold group-hover:-translate-x-1 transition-all"
                  />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-16 lg:p-20">
        {children}
      </main>
    </div>
  );
}

function SidebarContent({
  tabs,
  activeTab,
  setActiveTab,
  onLogout,
}: {
  tabs: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-10 border-b border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-editorial-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h2 className="text-3xl font-serif italic tracking-tight text-white relative z-10">
          Rouky Admin
        </h2>
        <div className="flex items-center gap-3 mt-4 relative z-10">
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></div>
          <p className="text-[9px] label-caps tracking-[0.3em] text-editorial-gold font-bold">
            Système Actif
          </p>
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
        {tabs.map((tab) => (
          <NavButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </nav>

      <div className="p-10 border-t border-white/5 mt-auto">
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full flex items-center justify-between group px-6 py-4 border border-white/10 hover:border-editorial-gold transition-all duration-300"
        >
          <span className="label-caps !text-[9px] tracking-widest text-white/50 group-hover:text-white">
            Retour boutique
          </span>
          <ArrowLeft
            size={14}
            className="text-white/30 group-hover:text-editorial-gold group-hover:-translate-x-1 transition-all"
          />
        </button>
      </div>
    </>
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
      <span
        className={cn(
          "transition-transform duration-500 group-hover:scale-110",
          active ? "text-editorial-gold" : "text-white/20"
        )}
      >
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
