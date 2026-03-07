"use client";

import { useState } from "react";
import { supabase } from "@/configs/supabase";

export default function SignupForm(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if(error){
      alert(error.message);
    } else {
      alert("Check your email for verification");
    }
  };

  return(
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
        onClick={handleSignup}
        className="bg-purple-600 text-white p-2 rounded"
      >
        Sign Up
      </button>
    </div>
  );
}