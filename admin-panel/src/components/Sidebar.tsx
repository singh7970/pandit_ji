"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarCheck, IndianRupee,
  BookOpen, Bell, Settings, LogOut, Flame,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pandits", icon: Users, label: "Pandits" },
  { href: "/bookings", icon: CalendarCheck, label: "Bookings" },
  { href: "/payments", icon: IndianRupee, label: "Payments" },
  { href: "/pujas", icon: BookOpen, label: "Puja Catalogue" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-orange-50">
        <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-heading font-bold text-gray-900 text-lg leading-none">PanditJi</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-saffron-500 text-white shadow-md shadow-orange-100"
                  : "text-gray-500 hover:bg-orange-50 hover:text-saffron-600"
              )}
            >
              <Icon className="w-4.5 h-4.5" size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all">
          <Settings size={18} /> Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-all">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
