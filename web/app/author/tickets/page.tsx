
"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Clock3,
  CheckCircle2,
  CircleAlert,
  Paperclip,
  Send,
  X,
  ArrowLeft,
  BookOpen,
  Headphones,
  Inbox,
} from "lucide-react";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

type Reply = {
  id: number;
  sender: "Author" | "BookLeaf Support";
  message: string;
  time: string;
};

type Ticket = {
  id: string;
  subject: string;
  book: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  replies: Reply[];
};

const initialTickets: Ticket[] = [
  {
    id: "BL-1001",
    subject: "Royalty payment update",
    book: "The Silent Journey",
    description:
      "I would like to know the current status of my royalty payment and when I can expect the next payout.",
    status: "In Progress",
    createdAt: "Oct 16, 2026",
    replies: [
      {
        id: 1,
        sender: "Author",
        message:
          "I would like to know the current status of my royalty payment and when I can expect the next payout.",
        time: "Oct 16, 2026 · 10:30 AM",
      },
      {
        id: 2,
        sender: "BookLeaf Support",
        message:
          "Hello! Thank you for reaching out. Our team is reviewing your royalty details. We will provide an update within 48 hours.",
        time: "Oct 17, 2026 · 11:15 AM",
      },
    ],
  },
  {
    id: "BL-1002",
    subject: "Incorrect ISBN on book listing",
    book: "The Silent Journey",
    description:
      "The ISBN displayed on the online listing does not match the ISBN assigned to my book.",
    status: "Open",
    createdAt: "Oct 17, 2026",
    replies: [],
  },
  {
    id: "BL-1003",
    subject: "Book description update",
    book: "Beyond the Horizon",
    description:
      "I want to update the description displayed on my book's online listing.",
    status: "Resolved",
    createdAt: "Oct 12, 2026",
    replies: [
      {
        id: 1,
        sender: "BookLeaf Support",
        message:
          "Your request has been reviewed. You can submit metadata changes through the BookLeaf team. Platform updates typically take 3–5 business days.",
        time: "Oct 14, 2026 · 2:00 PM",
      },
    ],
  },
];

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const [subject, setSubject] = useState("");
  const [book, setBook] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState("");

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedId) ?? null;

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = filter === "All" || ticket.status === filter;
    const matchesSearch = `${ticket.id} ${ticket.subject} ${ticket.book}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });
  

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    progress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter(
      (t) => t.status === "Resolved" || t.status === "Closed"
    ).length,
  };

  function createTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!subject.trim() || !book || !description.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    const newTicket: Ticket = {
      id: `BL-${1001 + tickets.length}`,
      subject: subject.trim(),
      book,
      description: description.trim(),
      status: "Open",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      replies: [
        {
          id: 1,
          sender: "Author",
          message: description.trim(),
          time: "Just now",
        },
      ],
    };

    setTickets((current) => [newTicket, ...current]);
    setSelectedId(newTicket.id);
    setSubject("");
    setBook("");
    setDescription("");
    setAttachment(null);
    setError("");
    setShowForm(false);
    setFilter("All");
    setSearch("");
  }

  function sendReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedTicket) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const message = String(data.get("reply") ?? "").trim();

    if (!message) return;

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              replies: [
                ...ticket.replies,
                {
                  id: Date.now(),
                  sender: "Author",
                  message,
                  time: "Just now",
                },
              ],
            }
          : ticket
      )
    );

    form.reset();
  }
  const features = [
  {
    label: "Total Tickets",
    value: counts.total,
    icon: MessageSquare,
    description: "All tickets created",
  },
  {
    label: "Open",
    value: counts.open,
    icon: CircleAlert,
    description: "Awaiting action",
  },
  {
    label: "In Progress",
    value: counts.progress,
    icon: Clock3,
    description: "Currently being handled",
  },
  {
    label: "Resolved / Closed",
    value: counts.resolved,
    icon: CheckCircle2,
    description: "Successfully completed",
  },
];

  return (
    <main className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8 ">
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <header>
       <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center b">
        <div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white">
             Tickets
          </h1>
          <p className="mt-1 text-sm text-accent-sidebar">
            Raise a query and keep track of your conversations with BookLeaf.
          </p>
        </div>
      

        <button
          onClick={() => {
            setShowForm(true);
            setSelectedId(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-accent-sidebar hover:text-white hover:cursor-pointer"
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>
     </header> 

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {features.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-accent bg-card p-4  ransition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold text-white sm:text-sm">
                  {item.label}
                </p>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">
                {item.value}
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Create ticket form */}
      {showForm && (
        <section className="rounded-2xl border border-accent-sidebar bg-background p-5 sm:p-7">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Create a Support Ticket
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Tell us what you need help with.
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              aria-label="Close ticket form"
              className="p-2 text-white hover:text-accent-sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={createTicket} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Book / Query Type <span className="text-muted-foreground">*</span>
              </label>
              <select
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="w-full rounded-xl border border-accent-sidebar bg-accent px-4 py-3 text-sm text-white outline-none transition-all focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
                required
              >
                <option value="">Select a book or query type</option>
                <option value="General / Account Level">
                  General / Account Level
                </option>
                <option value="The Silent Journey">The Silent Journey</option>
                <option value="Beyond the Horizon">Beyond the Horizon</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Select the relevant book, or choose General / Account Level.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Subject <span className="text-muted-foreground">*</span>
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Royalty payment not received"
                maxLength={150}
                required
                className="w-full rounded-xl border border-accent-sidebar bg-accent px-4 py-3 text-sm outline-none transition-all focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Describe your query{" "}
                <span className="text-muted-foreground">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue in detail so our team can help you..."
                rows={5}
                maxLength={5000}
                required
                className="w-full resize-y rounded-xl border border-accent-sidebar px-4 py-3 text-sm outline-none transition-all focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {description.length}/5000 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Attachment 
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-accent-sidebar p-4 transition hover:bg-accent">
                <Paperclip size={20} className="text-white" />
                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm font-medium text-white">
                    {attachment ? attachment.name : "Choose a file"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    UI preview only; files are not uploaded yet.
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setAttachment(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              {attachment && (
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="mt-2 text-xs font-medium text-white hover:underline"
                >
                  Remove attachment
                </button>
              )}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-accent-sidebar pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-accent-sidebar px-5 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-sidebar"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-accent hover:text-white"
              >
                <Send size={16} />
                Submit Ticket
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Ticket list and conversation */}
      {/* <div className=""> */}
       {!showForm  &&( <section className="overflow-hidden shadow-sm">
          <div className="p-4">
            {/* <h2 className="font-bold text-gray-900">My Tickets</h2>
            <p className="mt-1 text-sm text-gray-500">
              View your submitted queries and their status.
            </p> */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full rounded-xl border border-accent-sidebar bg-accent py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-accent-sidebar focus:ring-2 focus:ring-accent-sidebar"
              />
             </div>
             <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {["All", "Open", "In Progress", "Resolved", "Closed"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      filter === status
                        ? "bg-accent  text-white"
                        : "bg-black border-accent-sidebar border border-dashed text-white hover:bg-accent hover:accent-sidebar"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
            

          

          <div className="max-h-140 border border-accent rounded-lg overflow-y-auto">
             <table className="w-full min-w-210 text-left">
              <thead className="sticky top-0 bg-sidebar text-xs uppercase tracking-wide text-foreground">
                <tr className="border-b border-accent">
                   <th className="px-5 py-4 font-semibold">Ticket ID</th>
                   <th className="px-5 py-4 font-semibold">Subject</th>
                   <th className="px-5 py-4 font-semibold">Book Name</th>
                   <th className="px-5 py-4 font-semibold">Created At</th>
                   <th className="px-5 py-4 font-semibold">Status</th>
                 <th className="px-5 py-4 text-center font-semibold">Chat</th>
                </tr>
             </thead>

           <tbody>
            {filteredTickets.length === 0 ? (
             <tr>
             <td
               colSpan={6}
              className="px-5 py-12 text-center text-sm text-muted-foreground"
              >
                No tickets found.
             </td>
            </tr>
            ) : (
            filteredTickets.map((ticket) => (
            <tr
               key={ticket.id}
               onClick={() => {
               setSelectedId(ticket.id);
               setShowForm(false);
             }}
             className={`border-b border-accent ${
               selectedId === ticket.id ? "bg-muted/70" : ""
             }`}
             >
             <td className="whitespace-nowrap px-4 py-3">
               <span className="text-sm font-semibold text-white">
                 {ticket.id}
               </span>
             </td>

             <td className="max-w-55 px-4 py-3">
               <p className="wrap-break-words text-sm font-medium text-foreground">
                 {ticket.subject}
               </p>
             </td>

             <td className="max-w-45 px-4 py-3">
               <span className="block truncate text-sm text-muted-foreground">
                 {ticket.book}
               </span>
             </td>

             <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
               {ticket.createdAt}
             </td>

             <td className="whitespace-nowrap px-4 py-3">
               <span
                 className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${
                   statusStyles[ticket.status]
                 }`}
               >
                 {ticket.status}
               </span>
             </td>

              <td className="px-5 py-4 text-center">
                <button
                 type="button"
                 onClick={(e) => {
                 e.stopPropagation();
                 setSelectedId(ticket.id);
                 setShowForm(false);
                 setChatOpen(true);
                }}
                 aria-label={`Open chat for ${ticket.id}`}
                 className="relative inline-flex items-center justify-center rounded-lg border border-accent p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer"
                >
                 <MessageSquare size={17} />

                   <span className="ml-2 text-xs font-medium">
                      {ticket.replies.length}
                    </span>
                  
                </button>
               </td>
             </tr>
           ))
          )}
         </tbody>
       </table>
           
          </div>
        </section>
        )}

        {/* Conversation panel */}
        {chatOpen && selectedTicket && (
           <section
           className="fixed left-1/2 top-1/2 z-40 flex h-175 w-175 max-h-[90vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-accent-sidebar bg-background shadow-2xl"
           aria-label="Ticket conversation"
            >
    {/* Chat Header */}
        <div className="flex items-start justify-between gap-3 border-b border-accent-sidebar bg-sidebar p-4">
        <div className="flex min-w-0 items-start gap-3">
         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
           <MessageSquare size={19} />
         </div>

         <div className="min-w-0">
           

          <h2 className="mt-1 line-clamp-2 wrap-break-words text-sm font-semibold text-foreground">
             {selectedTicket.subject}
           </h2>

           <p className="mt-1 truncate text-xs text-accent-sidebar">
             {selectedTicket.book}
           </p>

           {/* <span
            className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[selectedTicket.status]}`}
           >
            {selectedTicket.status}
           </span> */}
         </div>
       </div>

       <button
         type="button"
         onClick={() => setChatOpen(false)}
         aria-label="Close chat"
         className="rounded-lg p-2 text-foreground transition hover:text-accent-sidebar hover:cursor-pointer"
       >
         <X size={19} />
       </button>
     </div>

    {/* Chat Messages */}
    <div className="flex-1 space-y-5 overflow-y-auto bg-background p-4">
      <div className="text-center">
        <span className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
          Ticket created · {selectedTicket.createdAt}
        </span>
      </div>

       {selectedTicket.replies.length === 0 ? (
         <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-3">
             <Headphones size={23} className="text-muted-foreground" />
           </div>

           <p className="mt-3 text-sm font-semibold text-foreground">
             No replies yet
           </p>

           <p className="mt-1 max-w-57 text-xs leading-5 text-muted-foreground">
             Your query has been submitted. BookLeaf Support will respond here.
           </p>
         </div>
        ) : (
         selectedTicket.replies.map((reply) => (
           <div
             key={reply.id}
             className={`flex ${
               reply.sender === "Author"
                 ? "justify-end"
                 : "justify-start"
             }`}
           >
             <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-3 ${
                reply.sender === "Author"
                  ? "rounded-br-sm bg-[#1d5270] text-white"
                  : "rounded-bl-sm border border-accent-sidebar bg-accent text-foreground"
               }`}
             >
               <p
                 className={`mb-1.5 text-[10px] font-semibold ${
                   reply.sender === "Author"
                     ? "text-blue-100"
                     : "text-slate-400"
                 }`}
               >
                 {reply.sender === "Author"
                   ? "You"
                   : "BookLeaf Support"}
                </p>

                <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6">
                  {reply.message}
                 </p>

                <p
                 className={`mt-2 text-right text-[10px] ${
                   reply.sender === "Author"
                     ? "text-blue-100"
                     : "text-muted-foreground"
                  }`}
                >
                {reply.time}
              </p>
            </div>
          </div>
          ))
        )}
       </div>

    {/* Chat Footer */}
     {selectedTicket.status === "Closed" ||
      selectedTicket.status === "Resolved" ? (
       <div className="border-t border-accent-sidebar bg-sidebar p-4">
         <p className="text-center text-xs text-muted-foreground">
           This ticket is {selectedTicket.status.toLowerCase()}.
           Follow-up messaging is unavailable.
         </p>
        </div>
       ) : (
       <form
         onSubmit={sendReply}
         className="border-t border-accent-sidebar bg-sidebar p-3"
       >
         <div className="flex items-end gap-2 rounded-xl border border-accent-sidebar bg-background p-2">
           <textarea
             name="reply"
             rows={1}
             maxLength={3000}
             required
             placeholder="Type your message..."
             aria-label="Type your message"
             className="max-h-24 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
             />

           <button
             type="submit"
             aria-label="Send message"
             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-accent hover:text-foreground"
            >
              <Send size={17} />
            </button>
            </div>

           <p className="mt-2 px-1 text-[10px] text-muted-foreground">
            Replying to {selectedTicket.id}
            </p>
           </form>
           )}
        </section>
        )}
      {/* </div> */}

      <p className="text-center text-xs text-gray-400">
        Need more help? Submit a ticket and our BookLeaf support team will
        assist you.
      </p>
    </div>
  </main>
  );
}
