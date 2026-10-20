
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type AuthorOverview = {
  author: {
    id: number;
    full_name: string;
    email: string;
  };
  statistics: {
    total_books: number;
    total_copies_sold: number;
    total_royalty_earned: number;
    royalty_paid: number;
    royalty_pending: number;
  };
};

export type AuthorBook = {
  id: number;
  title: string;
  isbn: string | null;
  genre: string | null;
  publication_date: string | null;
  status: string | null;
  mrp: number | null;
  copies_sold: number | null;
  total_royalty_earned: number | null;
  royalty_paid: number | null;
  royalty_pending: number | null;
};

async function authorGet<T>(path: string): Promise<T> {
  // This helper is called from client-side pages.
  const token = window.sessionStorage.getItem("bookleaf_access_token");

  if (!token) {
    throw new Error("Your login session is missing. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("Your account does not have author access.");
    }

    throw new Error(
      result?.detail ?? `Request failed with status ${response.status}.`
    );
  }

  return result as T;
}

export function getAuthorOverview() {
  return authorGet<AuthorOverview>("/api/author/overview");
}

export function getAuthorBooks() {
  return authorGet<AuthorBook[]>("/api/author/books");
}
