"use client";

import { useState } from "react";
import { supabase } from "@/configs/supabase";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for a verification link!");
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf8f4] p-4">
      {/* Subtle background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nova-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-nova-primary shadow-[0_4px_16px_rgba(249,115,22,0.3)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-nova-heading">Nova AI</h1>
          <p className="mt-1 text-sm text-nova-body">Create your account to start learning</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-black/6 bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <h2 className="mb-6 text-center text-xl font-bold text-nova-heading">Create Account</h2>

          <div className="flex flex-col gap-4">
            <input
              type="email"
              className="w-full rounded-xl border border-black/10 bg-[#fdf8f4] px-4 py-3 text-nova-heading placeholder:text-nova-body/50 transition focus:border-nova-primary focus:outline-none focus:ring-2 focus:ring-nova-primary/20"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-xl border border-black/10 bg-[#fdf8f4] px-4 py-3 text-nova-heading placeholder:text-nova-body/50 transition focus:border-nova-primary focus:outline-none focus:ring-2 focus:ring-nova-primary/20"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-xl bg-nova-primary py-3 font-semibold text-white shadow-[0_4px_14px_rgba(249,115,22,0.3)] transition duration-200 hover:bg-nova-primary/90 hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/8" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-nova-body">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white py-3 font-medium text-nova-heading transition duration-200 hover:bg-gray-50 hover:border-black/15"
            >
              <img width="20" height="20" src="https://img.icons8.com/fluency/48/google-logo.png" alt="google-logo" />
              <span>Sign up with Google</span>
            </button>

            <p className="mt-2 text-center text-sm text-nova-body">
              Already have an account?{" "}
              <a href="/sign-in" className="font-semibold text-nova-primary hover:text-nova-primary/80">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}