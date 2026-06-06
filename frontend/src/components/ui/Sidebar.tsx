"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/src/store/authSlice";
import { RootState, AppDispatch } from "@/src/store/store";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserCircle,
  LogOut,
  Zap,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/customers", label: "Customers", icon: Users, adminOnly: false },
  { href: "/interactions", label: "Interactions", icon: MessageSquare, adminOnly: false },
  { href: "/users", label: "User Management", icon: Shield, adminOnly: true },
  { href: "/profile", label: "Profile", icon: UserCircle, adminOnly: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    window.location.href = "/auth/login";
  };

  const nav = (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">CS Platform</span>
            <span className="block text-[10px] text-slate-500 font-medium -mt-0.5">Customer Success</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>
        <div className="space-y-0.5">
          {navItems.filter((item) => !item.adminOnly || user?.role === "superadmin").map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                  ${active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 pb-4 mt-auto">
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 rounded-xl text-white shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
