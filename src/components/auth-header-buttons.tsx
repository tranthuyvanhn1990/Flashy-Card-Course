"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function AuthHeaderButtons() {
  return (
    <>
      <SignInButton mode="modal">
        <Button variant="outline" size="sm" type="button">
          Sign in
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" type="button">
          Sign up
        </Button>
      </SignUpButton>
    </>
  );
}
