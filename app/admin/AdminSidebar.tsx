"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, CreditCard, Building2, MessageSquare, Send, LogOut, Shield } from "lucide-react";

const nav = [
  { href: "/admin",               label: "Estadísticas",   icon: BarChart3 },
  { href: "/admin/usuarios",      label: "Usuarios",       icon: Users },
  { href: "/admin/suscripciones", label: "Suscripciones",  icon: CreditCard },
  { href: "/admin/comunidades",   label: "Comunidades",    icon: Building2 },
  { href: "/admin/campanas",      label: "Campañas",       icon: Send },
];

export default function AdminSidebar() {
  const path = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-[#0F1E3C] h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
        <Shield className="w-5 h-5 text-amber-400" />
        <div>
          <span className="font-bold text-white text-sm">VecindApp</span>
          <span className="block text-xs text-amber-400 font-medium">Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/admin" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-amber-400 text-[#0F1E3C]"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <MessageSquare className="w-5 h-5" /> Volver a la app
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
