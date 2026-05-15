"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

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

  return (
    <div className="bg-nova-bg text-nova-body font-sans min-h-screen flex flex-col antialiased selection:bg-nova-primary/20 selection:text-nova-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-16 py-4 bg-[#FDFCFB]/80 backdrop-blur-[16px] border-b border-black/5 shadow-sm">
        <Link className="text-2xl font-bold tracking-tight text-nova-heading flex items-center gap-2" href="/">
          <span className="material-symbols-outlined text-nova-primary">auto_awesome</span>
          Nova AI
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link className="text-sm text-nova-heading font-bold border-b-2 border-nova-primary pb-1" href="/">Home</Link>
          <Link className="text-sm text-nova-body hover:text-nova-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm text-nova-body hover:text-nova-primary transition-colors" href="#how-it-works">How It Works</Link>
          <Link className="text-sm text-nova-body hover:text-nova-primary transition-colors" href="#pricing">Pricing</Link>
          <Link className="text-sm text-nova-body hover:text-nova-primary transition-colors" href="#contact">Contact</Link>
        </div>
        {!user ? (
          <Link href="/sign-up" className="hidden md:block">
            <button className="bg-nova-primary text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-nova-primary/90 transition-colors active:scale-95 duration-200">
              Get Started
            </button>
          </Link>
        ) : (
          <Link href="/dashboard" className="hidden md:block">
            <button className="bg-nova-primary text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-nova-primary/90 transition-colors active:scale-95 duration-200">
              Dashboard
            </button>
          </Link>
        )}
        <button className="md:hidden text-nova-body">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>

      <main className="flex-grow pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="px-4 md:px-16 py-section flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nova-accent/10 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nova-primary/5 rounded-full blur-[100px] -z-10"></div>
          <div className="flex-1 flex flex-col items-start gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-soft border border-black/5">
              <span className="w-2 h-2 rounded-full bg-nova-primary animate-pulse"></span>
              <span className="text-sm text-nova-primary font-medium">Nova AI Live</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-nova-heading tracking-tight max-w-3xl leading-tight">
              Your Personal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-primary to-nova-accent">AI Learning System</span>
            </h1>
            <p className="text-lg text-nova-body max-w-2xl">
              Master any skill with a personalized roadmap, structured AI-generated courses, and adaptive learning tailored to your goals. Let intelligence guide your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              {!user ? (
                <Link href="/sign-in">
                  <button className="bg-nova-primary text-white text-sm font-medium px-8 py-3.5 rounded-lg hover:shadow-[0_10px_20px_rgba(255,140,66,0.2)] transition-all active:scale-95 duration-200 w-full sm:w-auto">
                    Create My Learning Path
                  </button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <button className="bg-nova-primary text-white text-sm font-medium px-8 py-3.5 rounded-lg hover:shadow-[0_10px_20px_rgba(255,140,66,0.2)] transition-all active:scale-95 duration-200 w-full sm:w-auto">
                    Go to Dashboard
                  </button>
                </Link>
              )}
              <Link href="/dashboard/explore" className="w-full sm:w-auto">
                <button className="bg-white text-nova-heading text-sm font-medium px-8 py-3.5 rounded-lg border border-black/5 hover:bg-gray-50 transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 shadow-sm w-full">
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  Explore Demo
                </button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-nova-body text-sm">
              <div className="flex -space-x-3">
                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1"/>
                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2"/>
                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3"/>
              </div>
              <p>Join 10,000+ early adopters</p>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="flex-1 w-full max-w-2xl relative z-10 perspective-[1000px] mt-12 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-soft p-6 rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-500 hover:rotate-0 border border-black/5">
              <div className="flex gap-2 mb-6 border-b border-black/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-nova-heading tracking-tight">Python Mastery</h3>
                  <p className="text-sm text-nova-body">Estimated completion: 3 weeks</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-nova-primary flex items-center justify-center text-nova-primary font-bold text-sm">
                  32%
                </div>
              </div>
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-nova-primary ring-4 ring-white"></div>
                  <div className="bg-nova-bg p-4 rounded-xl border border-nova-accent/30 shadow-sm">
                    <h4 className="text-nova-heading font-medium text-sm">1. Data Structures Deep Dive</h4>
                    <p className="text-nova-body text-sm mt-1">Arrays, Linked Lists, Trees</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white ring-4 ring-white border-2 border-gray-200"></div>
                  <div className="bg-white p-4 rounded-xl border border-black/5 opacity-80">
                    <h4 className="text-nova-heading font-medium text-sm">2. Advanced Algorithms</h4>
                    <p className="text-nova-body text-sm mt-1">Sorting, Searching, Graph Theory</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 lg:-right-12 top-20 bg-white/90 backdrop-blur-[16px] p-4 rounded-2xl shadow-soft border border-black/5 animate-bounce" style={{animationDuration: "3s"}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <p className="text-xs text-nova-body">Quiz Score</p>
                  <p className="font-bold text-nova-heading">95% Top Percentile</p>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 lg:-left-8 bottom-12 bg-white/90 backdrop-blur-[16px] p-4 rounded-2xl shadow-soft border border-black/5 animate-bounce" style={{animationDuration: "4s", animationDelay: "1s"}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nova-accent/10 flex items-center justify-center text-nova-primary">
                  <span className="material-symbols-outlined">code</span>
                </div>
                <div>
                  <p className="text-xs text-nova-body">Up Next</p>
                  <p className="font-bold text-nova-heading">Interactive Code Practice</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 md:px-16 py-section bg-white border-y border-black/5" id="how-it-works">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">How Nova AI Works</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">A seamless 4-step flow to transform your goals into actionable learning.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Tell Nova Your Goals", desc: "Share what you want to learn, your current skill level, and your timeline.", icon: "chat_bubble" },
                { step: "02", title: "AI Analyzes", desc: "Our engine understands your requirements and maps out the perfect learning strategy.", icon: "psychology" },
                { step: "03", title: "Roadmap Generated", desc: "Get a personalized, step-by-step roadmap tailored specifically to your needs.", icon: "map" },
                { step: "04", title: "Course Created", desc: "Start learning with AI-generated chapters, videos, quizzes, and code practice.", icon: "school" },
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-nova-bg rounded-2xl border border-black/5 shadow-sm group hover:shadow-soft transition-all">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-nova-primary shadow-sm mb-4 border border-nova-accent/20 group-hover:bg-nova-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-nova-accent tracking-widest uppercase mb-2">Step {item.step}</span>
                  <h3 className="text-lg font-bold text-nova-heading mb-2">{item.title}</h3>
                  <p className="text-sm text-nova-body">{item.desc}</p>
                  {idx !== 3 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-nova-primary/20"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid (Bento Style) */}
        <section className="px-4 md:px-16 py-section" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">A Complete Learning Ecosystem</h2>
            <p className="text-lg text-nova-body max-w-2xl mx-auto">Everything you need to go from beginner to expert, powered by adaptive intelligence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="md:col-span-8 bg-white rounded-2xl p-8 shadow-soft group relative overflow-hidden border border-black/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-nova-accent/5 rounded-full blur-[50px] group-hover:bg-nova-accent/10 transition-colors"></div>
              <span className="material-symbols-outlined text-[32px] text-nova-primary mb-4 relative z-10">route</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2 relative z-10">Personalized Roadmaps</h3>
              <p className="text-nova-body relative z-10">Stop guessing what to learn next. Get a dynamically generated, step-by-step path to mastery based on your current skill level and ultimate goals.</p>
            </div>
            {/* Feature 2 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft group border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-nova-accent mb-4">auto_awesome_mosaic</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">AI Course Generation</h3>
              <p className="text-nova-body">Topics are broken down into digestible, AI-curated chapters tailored to your reading speed.</p>
            </div>
            {/* Feature 3 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">video_library</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Video Recommendations</h3>
              <p className="text-nova-body">Curated YouTube videos integrated directly into your learning chapters for better understanding.</p>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">touch_app</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Interactive Learning</h3>
              <p className="text-nova-body">Engage with dynamic content, notes, and interactive blocks instead of passive reading.</p>
            </div>
            {/* Feature 5 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">quiz</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Quizzes</h3>
              <p className="text-nova-body">Test your knowledge with generated quizzes that adapt in difficulty based on your performance.</p>
            </div>
            {/* Feature 6 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">terminal</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Code Practice</h3>
              <p className="text-nova-body">Practice immediately with integrated development environments for seamless coding exercises.</p>
            </div>
            {/* Feature 7 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">monitoring</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Progress Tracking</h3>
              <p className="text-nova-body">Visualize your growth with detailed analytics, daily streaks, and completion metrics.</p>
            </div>
            {/* Feature 8 */}
            <div className="md:col-span-4 bg-white rounded-2xl p-8 shadow-soft border border-black/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">workspace_premium</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Certificates</h3>
              <p className="text-nova-body">Earn verifiable certificates upon course completion to showcase your newly acquired skills.</p>
            </div>
          </div>
        </section>

        {/* Product Preview Section */}
        <section className="px-4 md:px-16 py-section bg-nova-accent/5 border-y border-black/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Experience the Next Generation</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">A beautifully designed workspace crafted for focus and productivity.</p>
            </div>
            <div className="bg-white rounded-3xl p-2 md:p-6 shadow-soft border border-black/5 overflow-hidden">
              <div className="bg-nova-bg rounded-2xl border border-black/5 overflow-hidden flex flex-col md:flex-row h-[500px]">
                {/* Sidebar Mock */}
                <div className="w-full md:w-64 bg-white border-r border-black/5 p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    </div>
                    <span className="font-bold text-nova-heading">Nova Studio</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-nova-primary/10 text-nova-primary rounded-md flex items-center px-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-[16px] mr-2">dashboard</span> Dashboard
                    </div>
                    <div className="h-8 hover:bg-black/5 text-nova-body rounded-md flex items-center px-3 text-sm cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] mr-2">route</span> Roadmaps
                    </div>
                    <div className="h-8 hover:bg-black/5 text-nova-body rounded-md flex items-center px-3 text-sm cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] mr-2">school</span> Courses
                    </div>
                  </div>
                </div>
                {/* Main Content Mock */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                  <div className="h-6 w-48 bg-gray-200 rounded-md mb-8"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="h-32 bg-white rounded-xl border border-black/5 shadow-sm p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-blue-50"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-white rounded-xl border border-black/5 shadow-sm p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-green-50"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-white rounded-xl border border-black/5 shadow-sm p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-purple-50"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 bg-white rounded-xl border border-black/5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Nova AI */}
        <section className="px-4 md:px-16 py-section">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Why Choose Nova AI?</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">Ditch the outdated methods. Embrace the future of learning.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <span className="material-symbols-outlined">cancel</span>
                  <h3 className="text-xl font-bold">Traditional Platforms</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Static, one-size-fits-all content",
                    "Generic roadmaps that ignore your background",
                    "Overwhelming lists of disjointed videos",
                    "Passive reading with low retention"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-nova-body">
                      <span className="material-symbols-outlined text-gray-300 mt-0.5">close</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-nova-bg p-8 rounded-2xl border-2 border-nova-primary/20 shadow-soft relative">
                <div className="absolute -top-3 -right-3 bg-nova-primary text-white text-xs font-bold px-3 py-1 rounded-full">The New Way</div>
                <div className="flex items-center gap-2 mb-6 text-nova-primary">
                  <span className="material-symbols-outlined">check_circle</span>
                  <h3 className="text-xl font-bold text-nova-heading">Nova AI</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Adaptive content tailored to your pace",
                    "Personalized roadmaps based on your skills",
                    "AI-generated, cohesive course structures",
                    "Interactive quizzes, code blocks, and practice"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-nova-heading font-medium">
                      <span className="material-symbols-outlined text-nova-primary mt-0.5">check</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-4 md:px-16 py-section bg-white border-y border-black/5" id="pricing">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">Start learning for free. Upgrade when you need more power.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              {/* Free Plan */}
              <div className="w-full md:w-96 bg-nova-bg p-8 rounded-2xl border border-black/5 shadow-sm">
                <h3 className="text-xl font-bold text-nova-heading mb-2">Free Plan</h3>
                <p className="text-nova-body text-sm mb-6">Perfect to explore personalized learning.</p>
                <div className="text-4xl font-bold text-nova-heading mb-6">$0<span className="text-lg text-nova-body font-normal">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {["Basic roadmap generation", "Limited course generations", "Standard quizzes", "Community support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-nova-body">
                      <span className="material-symbols-outlined text-gray-400 text-[18px]">check</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-white text-nova-heading text-sm font-medium py-3 rounded-lg border border-black/10 hover:bg-gray-50 transition-colors">
                  Get Started Free
                </button>
              </div>
              {/* Pro Plan */}
              <div className="w-full md:w-96 bg-white p-8 rounded-2xl border border-nova-primary/20 shadow-soft relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-nova-primary to-nova-accent text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                <h3 className="text-xl font-bold text-nova-heading mb-2">Pro Plan</h3>
                <p className="text-nova-body text-sm mb-6">For dedicated learners wanting no limits.</p>
                <div className="text-4xl font-bold text-nova-heading mb-6">$19<span className="text-lg text-nova-body font-normal">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {["Unlimited roadmap generations", "Advanced AI personalization", "Personal AI Tutor", "Improve Course feature", "Priority support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-nova-heading font-medium">
                      <span className="material-symbols-outlined text-nova-primary text-[18px]">check</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-nova-primary text-white text-sm font-medium py-3 rounded-lg hover:bg-nova-primary/90 transition-colors shadow-sm">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 md:px-16 py-section">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-12">Loved by Learners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: "Nova AI completely changed how I learn React. The customized roadmap saved me weeks of aimless searching on YouTube.", name: "Alex P.", role: "Frontend Developer" },
                { quote: "The AI course generation is magic. It broke down complex machine learning topics into chapters I could actually understand.", name: "Sarah K.", role: "Data Science Student" },
                { quote: "Finally, a platform that adapts to my pace. The interactive quizzes make sure I don't just read, but actually retain the knowledge.", name: "David M.", role: "Self-taught Programmer" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm text-left flex flex-col justify-between">
                  <p className="text-nova-body text-sm mb-6 italic">"{item.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-nova-heading text-sm">{item.name}</h4>
                      <p className="text-xs text-nova-body">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-nova-body">
              <div className="text-center">
                <div className="text-3xl font-bold text-nova-heading mb-1">10k+</div>
                <div className="text-sm">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-nova-heading mb-1">50k+</div>
                <div className="text-sm">Courses Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-nova-heading mb-1">4.9/5</div>
                <div className="text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-4 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8 bg-white border-t border-black/5 mt-auto" id="contact">
        <div className="text-xl font-bold tracking-tight text-nova-heading flex items-center gap-2">
          <span className="material-symbols-outlined text-nova-primary">auto_awesome</span>
          Nova AI
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-nova-body">
          <Link className="hover:text-nova-primary transition-colors duration-200" href="#">Privacy Policy</Link>
          <Link className="hover:text-nova-primary transition-colors duration-200" href="#">Terms of Service</Link>
          <Link className="hover:text-nova-primary transition-colors duration-200" href="#">Help Center</Link>
          <Link className="hover:text-nova-primary transition-colors duration-200" href="#">Community</Link>
        </div>
        <div className="text-sm text-nova-body">
          © {new Date().getFullYear()} Nova AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
