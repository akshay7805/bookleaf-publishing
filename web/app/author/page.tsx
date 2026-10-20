import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LibraryBig,
  MessageSquareText,
  ChartNoAxesCombined,
  Ticket,
  Clock3,
  CircleCheck,
} from "lucide-react";

const features = [
  {
    title: "My Books",
    description:
      "View your titles, ISBNs, publication status and royalties.",
    href: "/author/books",
    action: "Explore books",
    icon: LibraryBig,
  },
  {
    title: "Support",
    description:
      "Submit queries, track tickets and read replies from our team.",
    href: "/author/tickets",
    action: "View tickets",
    icon: MessageSquareText,
  },
  {
    title: "Royalty Insights",
    description:
      "Review your total earnings, payments and pending royalties.",
    href: "/author/books",
    action: "View royalties",
    icon: ChartNoAxesCombined,
  },
];

const activities = [
  {
    title: "Your support activity will appear here",
    description:
      "When you submit a support ticket, you can track its progress here.",
    date: "No recent activity",
    status: "Getting started",
  },
];

export default function AuthorOverview() {
  return (
    <main className="min-h-screen flex-1 bg-background p-6 text-foreground sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Welcome section */}
        <section className="space-y-2 border-b border-accent pb-4">
          <p className="text-sm font-medium text-muted-foreground">
            Your workspace
          </p>

          <h2 className="text-lg font-semibold tracking-tight sm:text-4xl">
            Welcome back, Author
          </h2>

          <p className="max-w-2xl text-xs leading-2 text-muted-foreground sm:text-base">
            Manage your books, monitor royalties and get the support
            you need, all in one place.
          </p>
        </section>

        {/* Feature cards */}
        <section>
          <div className="mb-4">
            {/* <h2 className="text-lg font-semibold">
              Your workspace
            </h2> */}
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to manage your publishing journey.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group rounded-2xl border border-accent bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <Icon size={23} strokeWidth={1.8} />
                  </div>

                  <h3 className="text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    {feature.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                    {feature.action}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent support activity */}
        <section className="rounded-2xl border border-accent bg-card p-4 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Support activity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep track of your recent support requests.
              </p>
            </div>

            <Link
              href="/author/tickets"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              All tickets
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-accent px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Ticket size={22} />
            </div>

            <h3 className="mt-2 font-medium">
              No support activity yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Your submitted tickets, replies and status updates
              will appear here once you start contacting our team.
            </p>

            <Link
              href="/author/tickets"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Visit support tickets
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-accent pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>BookLeaf Publishing · Author Portal</p>
          <p>Manage your publishing journey with confidence.</p>
        </footer>

      </div>
    </main>
  );
}