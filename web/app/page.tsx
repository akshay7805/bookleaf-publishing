
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("bookleaf_access_token");
    const storedUser = sessionStorage.getItem("bookleaf_user");

    // No login session? Go to the login page.
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as {
        role?: string;
      };

      // Redirect according to the user's role.
      if (user.role === "author") {
        router.replace("/author");
      } else if (user.role === "admin") {
        router.replace("/admin");
      } else {
        sessionStorage.removeItem("bookleaf_access_token");
        sessionStorage.removeItem("bookleaf_user");
        router.replace("/login");
      }
    } catch {
      sessionStorage.removeItem("bookleaf_access_token");
      sessionStorage.removeItem("bookleaf_user");
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">
        Checking your session...
      </p>
    </main>
  );
}
