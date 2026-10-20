
"use client";

import { useMemo, useState , useEffect} from "react";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  CalendarDays,
  Hash,
  IndianRupee,
  ChevronRight,
  X,
  BookMarked,
  ArrowUpDown,
  Library,
} from "lucide-react";
import { getAuthorBooks, type AuthorBook } from "@/lib/author-api"; 


type BookStatus =
  | "Published"
  | "In Production"
  | "Pending Approval"
  | "Unknown";

type Book = {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string | null;
  status: BookStatus;
  mrp: number;
  copiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  coverUrl?: string;
};


const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (value: string | null | undefined): BookStatus => {
  const normalized = (value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");

  if (normalized === "published") return "Published";
  if (normalized === "in production" || normalized === "production") {
    return "In Production";
  }
  if (normalized === "pending approval" || normalized === "awaiting approval") {
    return "Pending Approval";
  }

    return "Unknown";
};


const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const dateFormat = (value: string | null) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyle: Record<BookStatus, string> = {
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "In Production": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Pending Approval": "bg-blue-50 text-blue-700 ring-blue-600/20",
  Unknown: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
   useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getAuthorBooks();

        if (!cancelled) {
          const normalizedBooks: Book[] = response.map((book: AuthorBook) => ({
            id: String(book.id),
            title: book.title ?? "Untitled book",
            isbn: book.isbn ?? "",
            genre: book.genre ?? "",
            publicationDate: book.publication_date ?? null,
            status: normalizeStatus(book.status),
            mrp: toNumber(book.mrp),
            copiesSold: toNumber(book.copies_sold),
            totalRoyaltyEarned: toNumber(book.total_royalty_earned),
            royaltyPaid: toNumber(book.royalty_paid),
            royaltyPending: toNumber(book.royalty_pending),
          }));
          setBooks(normalizedBooks);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load your books."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadBooks();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);
  const genres = useMemo(
    () => [...new Set(books.map((book) => book.genre).filter(Boolean))].sort(),
    []
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books
      .filter((book) => {
        const matchesSearch =
          book.title.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || book.status === statusFilter;

        const matchesGenre =
          genreFilter === "All" || book.genre === genreFilter;

        return matchesSearch && matchesStatus && matchesGenre;
      })
      .sort((a, b) => {
        if (sortOrder === "title") {
          return a.title.localeCompare(b.title);
        }

        if (sortOrder === "sales") {
          return b.copiesSold - a.copiesSold;
        }

        return (
          new Date(b.publicationDate ?? 0).getTime() -
          new Date(a.publicationDate ?? 0).getTime()
        );
      });
  }, [search, statusFilter, genreFilter, sortOrder]);

  // The catalogue includes all books belonging to the author.
  // Only published books contribute to the Copies Sold summary.
  const totalBooks = books.length;

  const copiesSold = books
    .filter((book) => book.status === "Published")
    .reduce((total, book) => total + book.copiesSold, 0);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setGenreFilter("All");
  };
 const features = [
  {
    title: "Total Books",
    description: "Books in your catalogue.",
    value: totalBooks,
    // action: "Explore books",
    icon: BookMarked,
  },
  {
    title: "Copies Sold",
    description: "Sales across published books.",
    value: copiesSold,
    // action: "View sales",
    icon: ShoppingCart,
  },
];

  return (
    <main className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page heading */}
        <header>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
              <BookOpen size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                My Books
              </h1>
              <p className="mt-1 text-sm text-accent-sidebar">
                Your publishing portfolio
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-4 text-accent-sidebar">
            Manage your published titles, track sales and understand your
            royalty earnings.
          </p>
        </header>

        {/* Only two summary cards */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
     {features.map((feature) => {
      const Icon = feature.icon;

     return (
      <div
         key={feature.title}
          className="group rounded-2xl border border-accent bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
        >
         <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
           <Icon size={23} strokeWidth={1.8} />
         </div>

         <h3 className="text-lg font-semibold">
           {feature.title}
         </h3>

         <p className="mt-2 text-2xl font-bold tracking-tight">
           {feature.value.toLocaleString("en-IN")}
         </p>
         <p className="mt-1 text-sm leading-5 text-muted-foreground">
           {feature.description}
         </p>

         
        </div>
      );
     })}
     </div>
        {/* Catalogue */}
        <section className="overflow-hidden rounded-2xl border border-accent bg-background shadow-sm">
          <div className="border-b border-accent p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Your titles
                </h2>
                <p className="mt-1 text-sm text-accent-sidebar">
                  View your books and their publishing details.
                </p>
              </div>

              <span className="w-fit rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1 ? "book" : "books"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative md:col-span-2 lg:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title or ISBN..."
                  aria-label="Search books by title or ISBN"
                  className="w-full rounded-xl border border-accent-sidebar bg-accent py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
                />
              </div>

              <div className="relative">
                <SlidersHorizontal
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by publication status"
                  className="w-full appearance-none rounded-xl border border-accent-sidebar bg-accent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent-sidebar"
                >
                  <option value="All">All statuses</option>
                  <option value="Published">Published</option>
                  <option value="In Production">In Production</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Unknown">Unknown status</option>
                </select>
              </div>

              <select
                value={genreFilter}
                onChange={(event) => setGenreFilter(event.target.value)}
                aria-label="Filter by genre"
                className="w-full rounded-xl border border-accent-sidebar bg-accent px-3 py-2.5 text-sm outline-none focus:bg-dark-accent"
              >
                {/* <option value="Upcoming">Upcoming</option> */}
                <option value="All">All genres</option>
                {/* <option value="Upcoming">Upcoming</option> */}
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>      
          </div>
        {isLoading && (
            <div
              className="m-4 rounded-xl border border-accent-sidebar p-6 text-sm text-accent-sidebar"
              role="status"
            >
              Loading your books...
            </div>
          )}
          {!isLoading && errorMessage && (
            <div
              className="m-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200"
              role="alert"
            >
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-3 rounded-lg bg-red-900 px-3 py-2 text-xs font-medium text-white hover:bg-red-800"
              >
                Try again
              </button>
            </div>
          )}

          {/* Book cards */}
          {!errorMessage && filteredBooks.length > 0 ? (
            <div className="max-h-150 overflow-y-auto [scrollbar-color:#525252_#1a1a1a] divide-y divide-accent-sidebar border border-accent-sidebar m-4 p-4 rounded-2xl">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedBook(book)}
                  className="group w-full p-2 bg-card text-left transition-all duration-200 hover:border-primary/40 hover:bg-accent hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent-sidebar bg-accent">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={`Cover of ${book.title}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen
                          size={32}
                          className="text-white"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white transition">
                            {book.title}
                          </h3>

                          <p className="mt-1 break-all text-xs text-white">
                            ISBN: {book.isbn || "Not available"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle[book.status]}`}
                            >
                              {book.status}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                              {book.genre || "Genre not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                          <div>
                            <p className="text-xs text-accent-sidebar">MRP</p>
                            <p className="mt-1 font-semibold text-white">
                              {money(book.mrp)}
                            </p>
                          </div>

                          <ChevronRight
                            size={20}
                            className="text-slate-400 cursor-pointer transition group-hover:translate-x-1 group-hover:text-white"
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-accent-sidebar pt-4 sm:grid-cols-3">
                        <InfoItem
                          icon={<CalendarDays size={16} />}
                          label="Publication date"
                          value={dateFormat(book.publicationDate)}
                        />

                        <InfoItem
                          icon={<ShoppingCart size={16} />}
                          label="Copies sold"
                          value={book.copiesSold.toLocaleString("en-IN")}
                        />

                        <InfoItem
                          icon={<IndianRupee size={16} />}
                          label="Royalty earned"
                          value={money(book.totalRoyaltyEarned)}
                        />
                      </div>

                      <p className="mt-4 text-sm font-medium text-white cursor-pointer">
                        View complete details
                        <span className="ml-1" aria-hidden="true">
                          →
                        </span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-white">
                {books.length === 0 ? (
                  <Library size={30} />
                ) : (
                  <Search size={30} />
                )}
              </div>

              <h3 className="mt-5 text-base font-semibold text-white">
                {books.length === 0
                  ? "Your book catalogue is not connected yet"
                  : "No books found"}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-4 text-accent-sidebar">
                {books.length === 0
                  ? "Connect this page to the BookLeaf dataset or your authenticated books API to display your titles."
                  : "Try a different search term or clear your filters to see your books."}
              </p>

              {books.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        <footer className="pb-2 text-center text-xs font-bold text-white">
          BookLeaf Author Portal · Created by Akshay
        </footer>
      </div>

      {/* Complete book details modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBook(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSelectedBook(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-details-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-dark-accent shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-accent-sidebar p-4 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-sidebar">
                  Book details
                </p>
                <h2
                  id="book-details-title"
                  className="mt-2 text-base font-semibold text-white"
                >
                  {selectedBook.title}
                </h2>
                <p className="mt-1 break-all text-xs text-slate-500">
                  ISBN: {selectedBook.isbn || "Not available"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                aria-label="Close book details"
                className="rounded-lg p-2 text-slate-500 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto [scrollbar-color:#525252_#1a1a1a] p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle[selectedBook.status]}`}
                >
                  {selectedBook.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {selectedBook.genre || "Genre not specified"}
                </span>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Publication information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Book title"
                    value={selectedBook.title}
                  />
                  <DetailItem
                    label="ISBN"
                    value={selectedBook.isbn || "Not available"}
                  />
                  <DetailItem
                    label="Genre"
                    value={selectedBook.genre || "Not specified"}
                  />
                  <DetailItem
                    label="Publication date"
                    value={dateFormat(selectedBook.publicationDate)}
                  />
                  <DetailItem
                    label="Publication status"
                    value={selectedBook.status}
                  />
                  <DetailItem
                    label="Maximum retail price (MRP)"
                    value={money(selectedBook.mrp)}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Sales and royalties
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Total copies sold"
                    value={selectedBook.copiesSold.toLocaleString("en-IN")}
                  />
                  <DetailItem
                    label="Total royalty earned"
                    value={money(selectedBook.totalRoyaltyEarned)}
                  />
                  <DetailItem
                    label="Royalty paid"
                    value={money(selectedBook.royaltyPaid)}
                  />
                  <DetailItem
                    label="Royalty pending"
                    value={money(selectedBook.royaltyPending)}
                  />
                </div>
              </div>
            </div>  
          
         </section>
       </div>
      )}
    </main>
  );
}


function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-accent-sidebar">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 wrap-break-words text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-accent bg-accent-sidebar p-4">
      <p className="text-xs font-medium text-white">{label}</p>
      <p className="mt-2 wrap-break-words text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}