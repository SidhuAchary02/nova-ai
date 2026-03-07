"use client";

import Image from "next/image";
import { supabase } from "@/configs/supabase";
import { useEffect, useState } from "react";

const Header = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex justify-between items-center p-5 shadow-sm">
      <Image src={"/logo.png"} alt="logo" width={150} height={100} />

      {user && (
        <button
          onClick={logout}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Header;