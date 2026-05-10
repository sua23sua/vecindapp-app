"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Send,
  ClipboardList,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { href: "/comunidades",  label: "Comunidades",   icon: Building2 },
  { href: "/enviar",       label: "Enviar aviso",  icon: Send },
  { href: "/seguimiento",  label: "Seguimiento",   icon: ClipboardList },
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0F2447] text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#1A56DB]" />
          <span className="font-bold text-lg">VecindApp</span>
        </div>
        <button onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-[#0F2447] flex flex-col h-full">
            <div className="flex items-center gap-2 px-6 h-14 border-b border-white/10">
              <MessageSquare className="w-5 h-5 text-[#1A56DB]" />
              <span className="font-bold text-white text-lg">VecindApp</span>
            </div>
            <NavLinks />
            <div className="px-3 pb-6">
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut className="w-5 h-5" /> Cerrar sesión
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0F2447] h-screen sticky top-0">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
          <MessageSquare className="w-5 h-5 text-[#1A56DB]" />
          <span className="font-bold text-white text-lg">VecindApp</span>
        </div>
        <NavLinks />
        <div className="px-3 pb-6">
          <div className="px-3 py-2 mb-3">
            <p className="text-xs text-white/40">Sesión activa</p>
            <p className="text-sm text-white font-medium">Admin · Gestoría Demo</p>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </Link>
        </div>
      </aside>
    </>
  );
}
