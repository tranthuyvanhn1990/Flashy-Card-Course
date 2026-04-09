import type { Metadata } from "next";
import { PricingTable } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a plan to unlock more features",
};

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pricing
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upgrade to unlock unlimited desks and AI flashcard generation.
          </p>
        </div>

        <PricingTable />
      </div>
    </div>
  );
}

