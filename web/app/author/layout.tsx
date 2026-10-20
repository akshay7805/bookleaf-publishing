import type { ReactNode } from "react";
import AuthorSidebar from "../components/authorSidebar";

export default function AuthorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <AuthorSidebar />
      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}