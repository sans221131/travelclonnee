"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Edit3,
  FileText,
  CheckCircle2,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "View all trip requests",
  },
  {
    name: "Add Activity",
    href: "/admin/add-activity",
    icon: PlusCircle,
    description: "Create new activities",
  },
  {
    name: "Update Activity",
    href: "/admin/update-activity",
    icon: Edit3,
    description: "Edit existing activities",
  },
  {
    name: "Create Invoice",
    href: "/admin/create-invoice",
    icon: FileText,
    description: "Generate new invoices",
  },
  {
    name: "Check Invoice",
    href: "/admin/check-invoice",
    icon: CheckCircle2,
    description: "View invoice status",
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">LW</span>
              </div>
              <span className="text-white font-semibold text-lg hidden sm:block">
                Admin Portal
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                  title={item.description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="flex-shrink-0">
            <Link
              href="/admin"
              className="text-zinc-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
