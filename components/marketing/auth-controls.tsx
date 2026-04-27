"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/lib/user-context";

export function AuthControls() {
  const router = useRouter();
  const { user } = useUser();

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <Button
        className="rounded-full bg-brand-700 px-5 text-white hover:bg-brand-800"
        onClick={handleGoogleLogin}
      >
        Prihlásiť sa
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-700">Vitaj, {user.name}</span>
      <Button
        variant="outline"
        className="rounded-full border-brand-200 text-brand-800 hover:bg-brand-50"
        onClick={handleLogout}
      >
        Odhlásiť sa
      </Button>
    </div>
  );
}
