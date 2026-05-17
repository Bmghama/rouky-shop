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
    { id: "stats", label: "Vue d'ensemble", icon: <BarChart3 size={20} /> },
    { id: "products", label: "Gestion Catalogue", icon: <Package size={20} /> },
    { id: "orders", label: "Commandes", icon: <ShoppingBag size={20} /> },
    { id: "categories", label: "Rayons / Catégories", icon: <Filter size={20} /> },
    { id: "reviews", label: "Avis Clientes", icon: <Star size={20} /> },
    { id: "activity", label: "Journal de bord", icon: <Clock size={20} /> },
    { id: "assets", label: "Design & Apparence", icon: <Eye size={20} /> },
    { id: "newsletter", label: "Club WhatsApp", icon: <MessageCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-zinc-950">
      {/* Mobile Header - 44px min touch targets */}
      <header className="sticky top-0 z-50 md:hidden flex justify-between items-center px-3 h-16 bg-zinc-900 text-white border-b border-zinc-700 shadow-lg">
        <h1 className="text-xs font-serif italic font-bold truncate flex-1 pr-2">Rouky Admin</h1>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="min-w-11 min-h-11 p-2.5 hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
          title="Menu"
          aria-label="Ouvrir le menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 w-80 h-screen bg-zinc-900 text-white flex-col z-40 border-r border-zinc-700 overflow-y-auto">
        <SidebarContent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed left-0 top-16 w-72 h-[calc(100vh-64px)] bg-zinc-900 text-white flex flex-col z-50 shadow-2xl overflow-y-auto"
            >
              <div className="px-4 py-3 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-[9px] tracking-[0.2em] text-amber-400 font-bold">SYSTÈME ACTIF</p>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-zinc-700">
                <button
                  onClick={() => { onLogout(); setSidebarOpen(false); }}
                  className="w-full flex items-center justify-center space-x-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 py-2.5 transition-all font-bold text-[10px] tracking-widest border border-red-500/30"
                >
                  <LogOut size={12} />
                  <span>Déconnexion</span>
                </button>
              </div>
              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {tabs.map((tab) => (
                  <NavButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    icon={tab.icon}
                    label={tab.label}
                    mobile
                  />
                ))}
              </nav>
              <div className="p-3 border-t border-zinc-700">
                <button
                  onClick={() => { window.location.href = "/"; setSidebarOpen(false); }}
                  className="w-full flex items-center justify-between group px-3 py-2.5 border border-zinc-700 hover:border-amber-600 transition-all text-[9px]"
                >
                  <span className="tracking-widest text-zinc-400 group-hover:text-white">Retour boutique</span>
                  <ArrowLeft size={10} className="text-zinc-600 group-hover:text-amber-600" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full bg-zinc-950 overflow-y-auto md:ml-80">
        {children}
      </main>
    </div>
  );
}

function SidebarContent({ tabs, activeTab, setActiveTab, onLogout }: any) {
  return (
    <>
      <div className="p-8 border-b border-zinc-700">
        <h2 className="text-2xl font-serif italic font-bold text-white">Rouky</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <p className="text-[9px] tracking-[0.2em] text-amber-400 font-bold">ADMIN PANEL</p>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-zinc-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 py-3 transition-all font-bold text-[10px] tracking-widest border border-red-500/30 hover:border-red-500/50"
        >
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {tabs.map((tab: any) => (
          <NavButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </nav>
      <div className="p-6 border-t border-zinc-700">
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full flex items-center justify-between group px-4 py-3 border border-zinc-700 hover:border-amber-600 transition-all"
        >
          <span className="text-[9px] tracking-widest text-zinc-400 group-hover:text-white">Retour boutique</span>
          <ArrowLeft size={12} className="text-zinc-600 group-hover:text-amber-600 group-hover:-translate-x-1 transition-all" />
        </button>
      </div>
    </>
  );
}

function NavButton({ active, icon, label, onClick, mobile = false }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-3 py-3 md:px-4 md:py-3 transition-all duration-300 font-bold text-[10px] tracking-[0.15em] relative overflow-hidden group",
        mobile ? "space-x-2" : "space-x-3",
        active
          ? "text-amber-400 bg-zinc-800/50 border-r-4 border-amber-600"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
      )}
    >
      <span className={cn("flex-shrink-0", active ? "text-amber-400" : "text-zinc-600")}>
        {icon}
      </span>
      <span className="truncate text-left flex-1">{label}</span>
    </button>
  );
}
