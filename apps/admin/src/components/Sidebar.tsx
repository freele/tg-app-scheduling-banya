"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@bania/supabase/client";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Resources", href: "/dashboard/resources" },
  { name: "Events", href: "/dashboard/events" },
  { name: "Bookings", href: "/dashboard/bookings" },
  { name: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Bania Admin</h1>
      </div>

      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium text-gray-900 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
