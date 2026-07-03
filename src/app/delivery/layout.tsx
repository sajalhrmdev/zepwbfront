"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { LayoutDashboard, Package, User, LogOut, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/delivery", label: "Dashboard", icon: LayoutDashboard },
  { href: "/delivery/deliveries", label: "My Deliveries", icon: Package },
  { href: "/delivery/profile", label: "Profile", icon: User },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.push("/auth/login");
    else if (user?.role !== "DELIVERY_PARTNER") router.push("/");
  }, [loading, isAuthenticated, user, router]);

  if (loading) return null;
  if (!isAuthenticated || user?.role !== "DELIVERY_PARTNER") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-16">
          <Link href="/delivery" className="flex items-center gap-2">
            <Bike className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-lg">Zep Delivery</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</span>
            <button onClick={async () => { await logout(); router.push("/auth/login"); }} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100")}>
                  <Icon className="h-5 w-5" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
