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

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/75 p-8 shadow-[0_18px_35px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-slate-100">Welcome Back</h1>
          <p className="mb-8 text-center text-slate-300">Sign in to your account</p>
          
          <div className="flex flex-col gap-4">
            <input
              type="email"
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-4 py-3 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Email address"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-4 py-3 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="w-full rounded-lg bg-primary py-3 font-medium text-slate-950 transition duration-200 hover:bg-primary/90"
            >
              Sign In
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/15"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full rounded-lg border border-white/20 py-3 font-medium text-slate-200 transition duration-200 hover:bg-slate-800 flex items-center justify-center gap-3"
            >
              <img width="20" height="20" src="https://img.icons8.com/fluency/48/google-logo.png" alt="google-logo"/>
              <span>Sign in with Google</span>
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <a href="/sign-up" className="font-medium text-cyan-300 hover:text-cyan-200">
                Sign up
              </a>
            </p>
          </div>
      </div>
    </div>
  );
}