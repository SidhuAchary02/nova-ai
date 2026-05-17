import { supabase } from "@/configs/supabase";
import { useEffect, useState } from "react";
import NameChip from "@/components/common/NameChip";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LuUser } from "react-icons/lu";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const isCreateCourse = path.startsWith("/create-course");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Creator");

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-[16px] border-b border-black/5 dark:border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${isCreateCourse ? "" : "md:hidden"}`}>
              <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white shadow-sm dark:shadow-none">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <span className="font-bold text-nova-heading tracking-tight">UpSkillAi</span>
            </div>
            
            {isCreateCourse ? (
              <div className="hidden md:flex items-center">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2 text-sm font-medium text-nova-body hover:text-nova-primary transition-colors bg-nova-card px-4 py-1.5 rounded-lg border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none"
                >
                  <FaChevronLeft className="text-[12px]" />
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-sm text-nova-body">
                <span className="material-symbols-outlined text-[18px] text-nova-primary">space_dashboard</span>
                <span className="font-medium">Dashboard Overview</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-nova-primary/10 text-nova-primary hover:bg-nova-primary/20 transition-colors border border-nova-primary/20">
                    <LuUser size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-nova-card z-50">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-nova-body leading-none">Signed in as</p>
                      <p className="text-sm font-semibold text-nova-heading leading-none truncate">
                        {userName}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/profile" className="w-full flex items-center gap-2">
                      <LuUser className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

    </>
  );
};

export default Header;