"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sun, LayoutDashboard, Package, Calculator, Users, FileText, Settings, Truck, BarChart3, Cpu } from "lucide-react";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/packages", label: "Solar Packages", icon: Package },
  { href: "/calculator", label: "Cost Calculator", icon: Calculator },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/inverters", label: "Inverters Detail", icon: Cpu },
];

const managementLinks = [
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/installations", label: "Installations", icon: Truck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const adminPrefixes = ["/dashboard", "/packages", "/calculator", "/customers", "/quotations", "/installations", "/analytics", "/settings", "/inverters"];
  const isAdminRoute = adminPrefixes.some((p) => path === p || path.startsWith(`${p}/`));
  if (!isAdminRoute) return <>{children}</>;
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-xl font-bold text-orange-600"><Sun size={20} /> solar-pro</div>
          <p className="hidden pl-5 text-lg font-semibold text-gray-900 sm:block">Solar Panel Management</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-md bg-orange-600 px-3 py-1.5 text-sm text-white">Logout</button>
      </header>

      <div className="md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r bg-white p-4">
        <nav className="space-y-2">
          <p className="px-3 text-xs font-semibold tracking-wider text-gray-500">MAIN</p>
          {mainLinks.map((l) => {
            const Icon = l.icon;
            return <Link key={l.href} href={l.href} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${path === l.href ? "bg-orange-100 text-orange-700" : "hover:bg-orange-50"}`}><Icon size={16} />{l.label}</Link>;
          })}
          <p className="px-3 pt-3 text-xs font-semibold tracking-wider text-gray-500">MANAGEMENT</p>
          {managementLinks.map((l) => {
            const Icon = l.icon;
            return <Link key={l.href} href={l.href} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${path === l.href ? "bg-orange-100 text-orange-700" : "hover:bg-orange-50"}`}><Icon size={16} />{l.label}</Link>;
          })}
        </nav>
      </aside>
      <main>
        <div className="p-4">{children}</div>
      </main>
      </div>
    </div>
  );
}
