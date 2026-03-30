import { Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AuthHeaderButtons } from "@/components/auth-header-buttons";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          FlashyCardy
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personal flashcard platform
        </p>
      </div>
      <Show when="signed-out">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AuthHeaderButtons />
        </div>
      </Show>
      <Show when="signed-in">
        <div className="text-center text-sm text-muted-foreground">
          Redirecting to your dashboard...
        </div>
      </Show>
    </div>
  );
}
