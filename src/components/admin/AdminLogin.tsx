
import { useState } from "react";
import { motion } from "motion/react";
import { Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { ParallaxLogo } from "../layout/ParallaxLogo";

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.token);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gold/10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[8px] label-caps text-neutral-300 hover:text-editorial-gold transition-colors mb-6">
            <ArrowLeft size={10} />
            Retour
          </Link>
          <div className="flex justify-center">
            <ParallaxLogo size="lg" className="scale-90" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block px-2">Utilisateur</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 py-4 pl-12 pr-6 rounded-2xl outline-none focus:border-gold transition-all"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block px-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 py-4 pl-12 pr-6 rounded-2xl outline-none focus:border-gold transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold uppercase tracking-widest">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-gold transition-all duration-500 shadow-lg shadow-neutral-900/20"
          >
            <span>{loading ? "Connexion..." : "Se connecter"}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>


      </motion.div>
    </div>
  );
}
