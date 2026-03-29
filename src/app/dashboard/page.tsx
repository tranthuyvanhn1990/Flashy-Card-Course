import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your decks and study progress",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-md text-muted-foreground">
          Your decks and study tools will show up here.
        </p>
      </div>
    </div>
  );
}
