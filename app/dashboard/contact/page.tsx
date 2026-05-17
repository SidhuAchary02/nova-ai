"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/configs/supabase";
import { sendEmail } from "@/app/actions/sendEmail";

export default function ContactPage() {
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (!name) {
        const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "";
        if (fullName) setName(fullName.split(' ')[0]);
      }
      if (!email && user?.email) setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const q = searchParams.get("query");
      if (q) setQuery(q);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Get In Touch</h2>
        <p className="text-lg text-nova-body">Have questions or need support? We're here to help.</p>
      </div>
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-black/5 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nova-primary/5 rounded-full blur-[50px] pointer-events-none"></div>

        {isSubmitted ? (
          <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-nova-heading mb-2">Query Received!</h3>
            <p className="text-nova-body">You will hear from us within 24 hrs.</p>
          </div>
        ) : (
          <form
            className="relative z-10 flex flex-col gap-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const formData = new FormData(e.currentTarget);
              const res = await sendEmail(formData);
              setIsLoading(false);
              if (res.success) {
                setIsSubmitted(true);
                setQuery("");
                setTimeout(() => {
                  setIsSubmitted(false);
                }, 3000);
              }
            }}
          >
            <div>
              <label className="block text-sm font-bold text-nova-heading mb-2">Full Name</label>
              <input required name="name" value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full bg-[#fdf8f4] border border-black/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-bold text-nova-heading mb-2">Email Address</label>
              <input required name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-[#fdf8f4] border border-black/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all" placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-bold text-nova-heading mb-2">Phone Number <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
              <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="w-full bg-[#fdf8f4] border border-black/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all" placeholder="+91 9876543210" />
            </div>

            <div>
              <label className="block text-sm font-bold text-nova-heading mb-2">Your Query</label>
              <textarea required name="query" rows={4} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-[#fdf8f4] border border-black/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-nova-primary text-white font-bold py-4 rounded-xl hover:bg-nova-primary/90 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] transition-all active:scale-[0.98] duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Query...
                </>
              ) : (
                "Submit Query"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
