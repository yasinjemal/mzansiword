"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="self-start cursor-pointer text-muted underline transition-colors hover:text-foreground"
      onClick={async () => {
        // supabase-js is ~60 KB gz — load it when the user actually signs
        // out, not in the profile page's first paint (PERFORMANCE.md budget).
        const { createClient } = await import("@/lib/supabase/client");
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
