"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/quests", label: "Quests" },
  { href: "/feed", label: "The Quad" },
  { href: "/inventory", label: "Inventory" },
  { href: "/guilds", label: "Guilds" },
  { href: "/profile", label: "Profile" }
];

export function AppShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-white/70 bg-uri-navy px-6 py-7 text-white shadow-card">
          <div className="mb-10 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-uri-gold to-[#f2d27c] text-lg font-black text-uri-navy">
              CQ
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">University of Rhode Island</p>
              <h1 className="text-2xl font-semibold tracking-tight">CampusQuest</h1>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Realm Status</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/72">{subtitle}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white/18 text-white shadow-inner"
                      : "text-white/82 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
