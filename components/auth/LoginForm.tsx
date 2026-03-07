"use client";

import { useState } from "react";
import { supabase } from "@/configs/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(error){
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <input
        className="border p-2 rounded"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 rounded"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-purple-600 text-white p-2 rounded"
      >
        Sign In
      </button>
    </div>
  );
}