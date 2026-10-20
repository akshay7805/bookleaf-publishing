"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  LibraryBig,
  Ticket,
  ChartNoAxesColumn,
  UserRound,
  BookOpen,
} from "lucide-react";
const navItems = [
  { name: "Overview", href: "/author", icon: LayoutDashboard },
  { name: "My Books", href: "/author/books", icon: LibraryBig },
  { name: "Tickets", href: "/author/tickets", icon: Ticket },
  { name: "Reports", href: "/author/reports", icon: ChartNoAxesColumn },
  { name: "Profile", href: "/author/profile", icon: UserRound },
];
export default function AuthorSidebar(){
  const pathname = usePathname();
  return(
    
    <aside className="sticky top-0 h-screen w-64 shrink-0 flex flex-col overflow-y-auto border-r border-accent bg-transparent p-4 text-white">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 border-b border-accent px-3 pb-5 pt-2">
        <div className="flex h-9 w-9 items-center justify-center bg-accent">
          <Image
           src="/bookleaf.png"
           alt="BookLeaf logo"
           width={200}
           height={80}
           style={{ width: "auto", height: "auto" }}
          //  width={36}
          //  height={36}
          //  className="rounded-md h-auto object-contain"
          //  priority
          />
        </div>

        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            BookLeaf
          </h1>
          <p className="text-xs text-muted-foreground">
            Author Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Workspace
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/author"
              ? pathname === "/author"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-white"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={1.8}
                className="shrink-0"
              />

              <span>{item.name}</span>

             
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-accent px-3 pt-4">
        <p className="text-xs text-muted-foreground">
          BookLeaf Publishing
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Author Workspace
        </p>
      </div>
    </aside>
   
  )
}
