
"use client";

import {  useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Login failed. Please check your credentials."
        );
      }

      // Save the token and basic user information for this tab.
      sessionStorage.setItem("bookleaf_access_token", data.access_token);
      sessionStorage.setItem("bookleaf_user", JSON.stringify(data.user));

      // Redirect according to the role returned by the backend.
      if (data.user.role === "admin") {
        router.replace("/admin");
      } else if (data.user.role === "author") {
        router.replace("/author");
      } else {
        sessionStorage.removeItem("bookleaf_access_token");
        sessionStorage.removeItem("bookleaf_user");
        throw new Error("Your account has an unsupported role.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-accent-sidebar bg-accent p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white">
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

          <h1 className="text-base font-bold tracking-tight text-white">
            BookLeaf Publishing
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-white"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-accent-sidebar px-4 py-3 text-white outline-none transition placeholder:text-accent-sidebar focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-white"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-accent-sidebar px-4 py-3 text-white outline-none placeholder:text-accent-sdebar transition focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-accent-sidebar hover:text-white hover:cursor-pointer disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure access to your BookLeaf account
        </p>
      </section>
    </main>
  );
}
