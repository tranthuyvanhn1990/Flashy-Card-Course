"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

type AuthHeaderButtonsProps = {
  /** Defaults to `sm` for compact header use. */
  size?: ButtonSize;
};

export function AuthHeaderButtons({ size = "sm" }: AuthHeaderButtonsProps) {
  return (
    <>
      <SignInButton mode="modal">
        <Button variant="outline" size={size} type="button">
          Sign in
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size={size} type="button">
          Sign up
        </Button>
      </SignUpButton>
    </>
  );
}
