"use client";

import { Button } from "@/components/ui/button";
import ShinyButton from "@/components/ui/shiny-button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase";

const Header = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  return (
    <div className="flex justify-between p-5 shadow-sm items-center">
      <Image
        src={"/logo.png"}
        alt="logo"
        width={150}
        height={100}
        priority
        className="object-cover"
      />

      {!user ? (
        <Link href="/sign-up">
          <ShinyButton text="Sign Up" />
        </Link>
      ) : (
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      )}
    </div>
  );
};

export default Header;