"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/lib/user-context";
import { getInitials } from "@/lib/formatting";
import { toast } from "sonner";

export function AuthControls() {
  const router = useRouter();
  const { user } = useUser();
  const [isPending, setIsPending] = useState(false);

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
      toast.success("Úspešne odhlásený");
    } catch (e) {
      console.error(e);
      toast.error("Nepodarilo sa odhlásiť");
    } finally {
      setIsPending(false);
    }
  };

  if (!user) {
    return (
      <Button
        className="rounded-full bg-brand-700 px-5 text-white hover:bg-brand-800"
        onClick={handleGoogleLogin}
        aria-label="Prihlásiť sa"
      >
        <LogIn size={18} className="sm:hidden" />
        <span className="hidden sm:inline">Prihlásiť sa</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-white p-0.5 transition-colors hover:border-brand-300 hover:bg-brand-100 border border-brand-200"
        aria-label={`Používateľské menu pre ${user.name}`}
      >
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
            <LogOut size={16} className="mr-2" />
            {isPending ? "Odhlasovanie..." : "Odhlásiť sa"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
