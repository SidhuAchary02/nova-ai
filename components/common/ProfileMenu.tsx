"use client";

import Link from "next/link";
import { supabase } from "@/configs/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProfileMenuProps = {
  userName?: string | null;
};

export default function ProfileMenu({ userName }: ProfileMenuProps) {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-nova-primary/20 bg-nova-primary/10 text-nova-primary transition-colors hover:bg-nova-primary/20">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 w-56 bg-nova-card">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-nova-body">Signed in as</p>
            <p className="truncate text-sm font-semibold leading-none text-nova-heading">
              {userName || "Creator"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/profile" className="flex w-full items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
