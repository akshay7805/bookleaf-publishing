"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeAlert,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Tag,
  UserRound,
  UserRoundCheck,
  X,
} from "lucide-react";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type Priority = "Critical" | "High" | "Medium" | "Low";
type ReplyMode = "reply" | "internal";

type Ticket = {
  id: string;
  subject: string;
  author: string;
  email: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  date: string;
  description: string;
  assignedTo: string;
};

type TicketMessage = {
  id: string;
  ticketId: string;
  body: string;
  kind: ReplyMode;
  sender: string;
  createdAt: string;
};

const initialTickets: Ticket[] = [
  {
    id: "BL-1042",
    subject: "Royalty payment delayed",
    author: "Rahul Sharma",
    email: "rahul@example.com",
    category: "Royalty & Payments",
    priority: "High",
    status: "Open",
    date: "2026-10-19",
    description:
      "I published my book four months ago but have not received my royalty payment. Could you please check the payment status?",
    assignedTo: "Unassigned",
  },
  {
    id: "BL-1043",
    subject: "Incorrect ISBN on Amazon",
    author: "Priya Verma",
    email: "priya@example.com",
    category: "ISBN & Metadata Issues",
    priority: "Critical",
    status: "Open",
    date: "2026-10-19",
    description:
      "The ISBN displayed on Amazon does not match the ISBN printed on my physical book. Please investigate this issue.",
    assignedTo: "Support Administrator",
  },
  {
    id: "BL-1044",
    subject: "Book printing quality issue",
    author: "Amit Kumar",
    email: "amit@example.com",
    category: "Printing & Quality",
    priority: "Medium",
    status: "In Progress",
    date: "2026-10-18",
    description:
      "Several pages of my author copies have blurry images and misaligned printing.",
    assignedTo: "Operations Team",
  },
  {
    id: "BL-1045",
    subject: "Book unavailable on Amazon",
    author: "Neha Singh",
    email: "neha@example.com",
    category: "Distribution & Availability",
    priority: "High",
    status: "Open",
    date: "2026-10-17",
    description:
      "My published book is showing as currently unavailable on Amazon India.",
    assignedTo: "Unassigned",
  },
  {
    id: "BL-1046",
    subject: "Production status update",
    author: "Karan Mehta",
    email: "karan@example.com",
    category: "Book Status & Production Updates",
    priority: "Low",
    status: "Resolved",
    date: "2026-10-16",
    description:
      "Could you please tell me the current status of my book production?",
    assignedTo: "Operations Team",
  },
];

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-gray-100 text-gray-600 ring-gray-200",
};

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-700 ring-red-200",
  High: "bg-orange-50 text-orange-700 ring-orange-200",
  Medium: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  Low: "bg-gray-100 text-gray-600 ring-gray-200",
};

const controlClass =
  "w-full rounded-lg border border-dark-accent bg-accent-sidebar px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar";

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedId, setSelectedId] = useState("BL-1043");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [chatOpen, setChatOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<ReplyMode>("reply");
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [notice, setNotice] = useState("");

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        const term = search.trim().toLowerCase();
        const matchesSearch =
          ticket.id.toLowerCase().includes(term) ||
          ticket.subject.toLowerCase().includes(term) ||
          ticket.author.toLowerCase().includes(term) ||
          ticket.email.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === "All" || ticket.status === statusFilter;
        const matchesPriority =
          priorityFilter === "All" || ticket.priority === priorityFilter;
        const matchesCategory =
          categoryFilter === "All" || ticket.category === categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesCategory
        );
      })
      .sort((a, b) => {
        if (sortOrder === "Oldest") return a.date.localeCompare(b.date);
        if (sortOrder === "Highest Priority") {
          const rank: Record<Priority, number> = {
            Critical: 0,
            High: 1,
            Medium: 2,
            Low: 3,
          };
          return rank[a.priority] - rank[b.priority] || b.date.localeCompare(a.date);
        }
        return b.date.localeCompare(a.date);
      });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter, sortOrder]);

  useEffect(() => {
    if (!chatOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setChatOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chatOpen]);

  function openTicket(ticketId: string) {
    setSelectedId(ticketId);
    setReplyMode("reply");
    setReply("");
    setNotice("");
    setChatOpen(true);
  }

  function updateTicket<K extends keyof Ticket>(
    ticketId: string,
    field: K,
    value: Ticket[K]
  ) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    );
    setNotice("Ticket information updated in this demo. API persistence is not connected yet.");
  }

  function handleSendReply() {
    if (!selectedTicket || !reply.trim()) {
      setNotice("Write a message before sending.");
      return;
    }

    const newMessage: TicketMessage = {
      id: `${selectedTicket.id}-${Date.now()}`,
      ticketId: selectedTicket.id,
      body: reply.trim(),
      kind: replyMode,
      sender: "Support Administrator",
      createdAt: new Date().toLocaleString(),
    };

    setMessages((current) => [...current, newMessage]);
    setReply("");
    setNotice(
      replyMode === "reply"
        ? "Reply added to this local preview. Connect the ticket-message API to deliver it to the author."
        : "Internal note added to this local preview. Connect the ticket-message API to save it securely."
    );
  }

  function handleAiDraft() {
    if (!selectedTicket) return;

    setReplyMode("reply");
    setReply(
      `Hi ${selectedTicket.author.split(" ")[0]},\n\nThank you for contacting BookLeaf Support about “${selectedTicket.subject}”. We appreciate you bringing this to our attention. Our support team will review the details and follow up with an update.\n\nRegards,\nBookLeaf Support`
    );
    setNotice("A sample AI-style draft was inserted. Live AI and knowledge-base integration are not connected yet.");
  }

  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;
  const progressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved" || ticket.status === "Closed"
  ).length;
  const urgentCount = tickets.filter(
    (ticket) =>
      (ticket.priority === "Critical" || ticket.priority === "High") &&
      ticket.status !== "Resolved" &&
      ticket.status !== "Closed"
  ).length;

  const features = [
    {
      label: "Open",
      value: openCount,
      icon: Inbox,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Awaiting initial action",
    },
    {
      label: "Critical / High",
      value: urgentCount,
      icon: BadgeAlert,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Unresolved priority tickets",
    },
    {
      label: "In Progress",
      value: progressCount,
      icon: Clock3,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "Currently being handled",
    },
    {
      label: "Resolved / Closed",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "Completed tickets",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-accent-sidebar bg-background backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
                <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M8 7h8M8 11h8" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                BookLeaf
                <span className="ml-2 font-medium text-accent-sidebar">Support</span>
              </h1>
              <p className="text-xs text-gray-400">Admin Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Support Administrator</p>
              <p className="text-xs text-gray-500">Operations Team</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5EEF3] text-sm font-bold text-[#174B66]">
              SA
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Page heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Support Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-accent-sidebar">
              Manage author queries, prioritize urgent issues, and prepare consistent responses with AI assistance.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm text-white shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-accent-sidebar" />
            <span>Ticket management workspace</span>
          </div>
        </div>

        {/* Ticket statistics */}
        <section
          aria-label="Ticket statistics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-accent bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <span className={`rounded-lg p-2 ${item.bgColor}`}>
                      <Icon size={18} className={item.color} />
                    </span>
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Ticket queue stays in the background when the overlay is open */}
        <section className="overflow-hidden rounded-xl border border-accent bg-sidebar shadow-sm">
          <div className="border-b border-accent p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Ticket Queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review, categorize, and prioritize author support requests.
                </p>
              </div>
              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ID, subject, or author..."
                  aria-label="Search tickets"
                  className="w-full rounded-xl border border-accent bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar/30"
                />
              </div>
            </div>

            {/* Working filters */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
                className="rounded-lg border border-accent bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent-sidebar"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                aria-label="Filter by priority"
                className="rounded-lg border border-accent bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent-sidebar"
              >
                <option value="All">All priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
                className="rounded-lg border border-accent bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent-sidebar"
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                aria-label="Sort tickets"
                className="rounded-lg border border-accent bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent-sidebar"
              >
                <option value="Newest">Newest first</option>
                <option value="Oldest">Oldest first</option>
                <option value="Highest Priority">Highest priority</option>
              </select>
            </div>
          </div>

          {/* Ticket table */}
          <div className="max-h-140 overflow-auto">
            <table className="w-full min-w-262 text-left">
              <thead className="sticky top-0 z-10 bg-background text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-accent">
                  <th className="px-5 py-4 font-semibold">Ticket ID</th>
                  <th className="px-5 py-4 font-semibold">Subject</th>
                  <th className="px-5 py-4 font-semibold">Author</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Priority</th>
                  <th className="px-5 py-4 font-semibold">Created At</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No tickets found. Try changing your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => openTicket(ticket.id)}
                      className="cursor-pointer border-b border-accent transition hover:bg-accent/40"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="text-sm font-semibold text-white">{ticket.id}</span>
                      </td>
                      <td className="max-w-64 px-5 py-4">
                        <p className="wrap-break-words text-sm font-medium text-foreground">{ticket.subject}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">{ticket.author}</td>
                      <td className="max-w-52 px-5 py-4 text-sm text-muted-foreground">{ticket.category}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">{ticket.date}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[ticket.status]}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTicket(ticket.id);
                          }}
                          aria-label={`Open ticket conversation for ${ticket.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-accent px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
                        >
                          <MessageSquare size={15} />
                          Reply
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-accent px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
            <p className="text-xs text-muted-foreground">
              Select a ticket to review its details and respond.
            </p>
          </div>
        </section>

        <footer className="mt-8 border-t border-gray-200 py-5 text-center text-xs text-gray-400">
          BookLeaf Publishing · Author Support & Communication Portal
        </footer>
      </div>

      {/* Ticket conversation overlay: separate from the dashboard and blurred by the backdrop */}
      {chatOpen && selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4 lg:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setChatOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-dialog-title"
            className="flex max-h-[96vh] w-full max-w-280 flex-col overflow-hidden rounded-2xl border border-accent-sidebar bg-black text-white shadow-2xl sm:max-h-[93vh]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Overlay heading */}
            <header className="flex items-start justify-between gap-4 border-b border-accent-sidebar px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {selectedTicket.id}
                  </span>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[selectedTicket.status]}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h2 id="ticket-dialog-title" className="wrap-break-words text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {selectedTicket.subject}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                  <CalendarDays size={15} /> Created {selectedTicket.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close ticket details"
                className="rounded-lg p-2 text-white transition  hover:text-accent-sidebar"
              >
                <X size={22} />
              </button>
            </header>

            {/* Main conversation and independent right-side ticket information panel */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-black">
              <div className="grid grid-cols-1 items-start gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-5 lg:p-6">
                {/* LEFT: conversation first, then simple reply composer */}
                <div className="min-w-0 space-y-4">
                  <section className="overflow-hidden rounded-xl border border-accent-sidebar bg-accent shadow-sm">
                    <div className="flex items-center justify-between border-b border-accent-sidebar px-4 py-3 sm:px-5">
                      <div>
                        <h3 className="font-semibold text-white text-sm">Conversation</h3>
                        <p className="mt-0.5 text-xs text-slate-400">Author messages and support replies</p>
                      </div>
                      <MessageSquare size={19} className="text-white" />
                    </div>

                    <div className="space-y-5 p-4 sm:p-5">
                      {/* Original author query */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
                          {selectedTicket.author
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold text-white">{selectedTicket.author}</p>
                            <span className="text-xs text-slate-400">Original query · {selectedTicket.date}</span>
                          </div>
                          <div className="rounded-xl rounded-tl-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                            {selectedTicket.description}
                          </div>
                        </div>
                      </div>

                      {messages
                        .filter((message) => message.ticketId === selectedTicket.id)
                        .map((message) => (
                          <div key={message.id} className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-accent border-accent-sidebar">
                              {message.kind === "internal" ? <FileText size={17} /> : <UserRoundCheck size={17} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="text-xs font-semibold text-white">{message.sender}</p>
                                <span className="text-xs text-slate-400">{message.createdAt}</span>
                                {message.kind === "internal" && (
                                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                    Internal note · admin only
                                  </span>
                                )}
                              </div>
                              <div className={`whitespace-pre-wrap rounded-xl p-4 text-sm leading-6 ${message.kind === "internal" ? "border bg-white text-black" : "border border-blue-100 bg-blue-50 text-slate-700"}`}>
                                {message.body}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* Reply composer: no rich-text formatting toolbar */}
                  <section className={`overflow-hidden rounded-xl border bg-black shadow-sm  border-accent-sidebar`}>
                    <div className="flex flex-wrap items-center justify-between gap-3  px-4 py-3 sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyMode("reply")}
                          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${replyMode === "reply" ?"bg-white text-black":"bg-accent text-white hover:bg-accent-sidebar hover:text-white cursor-pointer"}`}
                        >
                          <MessageSquare size={16} /> Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyMode("internal")}
                          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${replyMode === "internal" ?  "bg-white text-black ":"bg-accent text-white hover:bg-accent-sidebar hover:text-white cursor-pointer"}`}
                        >
                          <FileText size={16} /> Internal Note
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleAiDraft}
                        className="inline-flex items-center gap-2 rounded-lg border border-accent-sidebar bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-sidebar"
                      >
                        <Sparkles size={16} className="text-white" /> AI Assistant
                      </button>
                    </div>

                    {replyMode === "internal" && (
                      <div className="border-b border-accent-sidebar bg-accent-sidebar px-4 py-2 text-xs font-medium text-white sm:px-5">
                        Internal notes are intended for support staff only.
                      </div>
                    )}

                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder={replyMode === "reply" ? "Write your reply to the author..." : "Write a private internal note..."}
                      rows={5}
                      aria-label={replyMode === "reply" ? "Reply message" : "Internal note"}
                      className=" w-[calc(100%-2rem)] resize-y bg-accent border border-accent-sidebar rounded-md px-4 py-4 m-4 text-sm leading-5 text-white outline-none placeholder:text-slate-400 sm:px-5"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5">
                      <p className="text-xs text-slate-500">
                        {replyMode === "reply" ? "This message is intended for the author." : "This note will be marked private in the conversation."}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReply("")}
                          className="rounded-lg border border-accent-sidebar px-3.5 py-2 text-sm font-medium text-white transition hover:cursor-pointer hover:bg-accent-sidebar"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleSendReply}
                          disabled={!reply.trim()}
                          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40 bg-white hover:bg-accent hover:text-white hover:cursor-pointer`}
                        >
                          <Send size={15} />
                          {replyMode === "reply" ? "Send Reply" : "Add Internal Note"}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT: distinct ticket-information sidebar, not part of the composer */}
                <aside className="space-y-4 lg:sticky lg:top-0">
                  <section className="rounded-xl border border-accent-sidebar bg-accent p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Tag size={18} className="text-white" />
                      <h3 className="font-semibold text-white">Ticket Information</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="ticket-category" className="mb-1.5 block text-sm font-medium text-white">Category</label>
                        <select
                          id="ticket-category"
                          value={selectedTicket.category}
                          onChange={(event) => updateTicket(selectedTicket.id, "category", event.target.value)}
                          className={controlClass}
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="ticket-priority" className="mb-1.5 block text-sm font-medium text-white">Priority</label>
                        <select
                          id="ticket-priority"
                          value={selectedTicket.priority}
                          onChange={(event) => updateTicket(selectedTicket.id, "priority", event.target.value as Priority)}
                          className={controlClass}
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="ticket-status" className="mb-1.5 block text-sm font-medium text-white">Ticket status</label>
                        <select
                          id="ticket-status"
                          value={selectedTicket.status}
                          onChange={(event) => updateTicket(selectedTicket.id, "status", event.target.value as TicketStatus)}
                          className={controlClass}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="ticket-assignee" className="mb-1.5 block text-sm font-medium text-white">Assign ticket</label>
                        <select
                          id="ticket-assignee"
                          value={selectedTicket.assignedTo}
                          onChange={(event) => updateTicket(selectedTicket.id, "assignedTo", event.target.value)}
                          className={controlClass}
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Support Administrator">Support Administrator</option>
                          <option value="Operations Team">Operations Team</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-accent-sidebar bg-accent p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <UserRound size={18} className="text-white" />
                      <h3 className="font-semibold text-white">Author Information</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-800">
                        {selectedTicket.author
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{selectedTicket.author}</p>
                        <p className="break-all text-sm text-slate-400">{selectedTicket.email}</p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-accent-sidebar bg-accent p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <UserRoundCheck size={18} className="text-white" />
                      <h3 className="font-semibold text-white">Assignment</h3>
                    </div>
                    <p className="text-xs text-slate-400">Currently assigned to</p>
                    <p className="mt-1 text-sm font-semibold text-white">{selectedTicket.assignedTo}</p>
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-400">Ticket ID</p>
                      <p className="mt-1 text-sm font-semibold text-white">{selectedTicket.id}</p>
                    </div>
                  </section>
                </aside>
              </div>
            </div>

            {notice && (
              <div className="flex items-start justify-between gap-3 border-t border-accent-sidebar bg-black px-4 py-3 text-sm text-white sm:px-6">
                <p>{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
