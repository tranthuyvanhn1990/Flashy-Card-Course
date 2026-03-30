"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function AuthHeaderButtons() {
  return (
    <>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        Sign in
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        Sign up
      </SignUpButton>
    </>
  );
}

