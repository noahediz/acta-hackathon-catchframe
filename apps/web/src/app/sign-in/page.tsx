'use client';
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  const handleSignIn = () => signIn('github');

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-foreground p-6">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-black border p-6 space-y-6">
        <Image
          src="/logo.png"
          width={160}
          height={100}
          alt="Logo"
        />
        <h1 className="text-xl font-semibold">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          This is the central inbox for all visual bug reports from your web application.
          <br />
          <br />
          Stop deciphering vague user tickets and start fixing issues faster with screen recordings, console logs, and network data bundled into one clear report. Sign in to view your team's latest reports.
        </p>
        <div className="space-y-2">
          <Button
            className="w-full flex items-center justify-center"
            onClick={handleSignIn}
            variant="default"
          >
            Sign in with GitHub
          </Button>
          <p className="text-xs text-muted-foreground text-center">For Acta Team: Authenticate with your GitHub Account</p>
        </div>        
      </div>
    </div>
  );
}

