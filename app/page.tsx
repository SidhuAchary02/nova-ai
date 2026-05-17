"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase";
import { sendEmail } from "@/app/actions/sendEmail";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [previewTab, setPreviewTab] = useState<"dashboard" | "roadmaps" | "courses">("dashboard");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-16 py-4 bg-[#FDFCFB]/80 backdrop-blur-[16px] border-b border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none">
        <Link className="text-2xl font-bold tracking-tight text-nova-heading flex items-center gap-2" href="/">
          <span className="material-symbols-outlined text-nova-primary">auto_awesome</span>
          UpSkillAi
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nova-card shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="w-2 h-2 rounded-full bg-nova-primary animate-pulse"></span>
              <span className="text-sm text-nova-primary font-medium">UpSkillAi Live</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-nova-heading tracking-tight max-w-3xl leading-tight">
              Your Personal <br />
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
              <Link href={user ? "/dashboard/explore" : "/sign-in"} className="w-full sm:w-auto">
                <button className="bg-nova-card text-nova-heading text-sm font-medium px-8 py-3.5 rounded-lg border border-black/5 dark:border-white/10 dark:border-white/5 hover:bg-gray-50 dark:bg-nova-card/5 transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 shadow-sm dark:shadow-none w-full">
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  Explore Demo
                </button>
              </Link>
            </div>
            {/* <div className="mt-8 flex items-center gap-4 text-nova-body text-sm">
              <div className="flex -space-x-3">
                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" />
                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" />
                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" />
              </div>
              <p>Join 10,000+ early adopters</p>
            </div> */}
          </div>

          {/* Dashboard Mockup */}
          <div className="flex-1 w-full max-w-2xl relative z-10 perspective-[1000px] mt-12 lg:mt-0">
            <div className="bg-nova-card rounded-2xl shadow-soft p-6 rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-500 hover:rotate-0 border border-black/5 dark:border-white/10 dark:border-white/5">
              <div className="flex gap-2 mb-6 border-b border-black/5 dark:border-white/10 dark:border-white/5 pb-4">
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
                  <div className="bg-nova-bg p-4 rounded-xl border border-nova-accent/30 shadow-sm dark:shadow-none">
                    <h4 className="text-nova-heading font-medium text-sm">1. Data Structures Deep Dive</h4>
                    <p className="text-nova-body text-sm mt-1">Arrays, Linked Lists, Trees</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-nova-card ring-4 ring-white border-2 border-gray-200"></div>
                  <div className="bg-nova-card p-4 rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5 opacity-80">
                    <h4 className="text-nova-heading font-medium text-sm">2. Advanced Algorithms</h4>
                    <p className="text-nova-body text-sm mt-1">Sorting, Searching, Graph Theory</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 lg:-right-12 top-20 bg-nova-card/90 backdrop-blur-[16px] p-4 rounded-2xl shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5 animate-bounce" style={{ animationDuration: "3s" }}>
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
            <div className="absolute -left-4 lg:-left-8 bottom-12 bg-nova-card/90 backdrop-blur-[16px] p-4 rounded-2xl shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
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
        <section className="px-4 md:px-16 py-section bg-nova-card border-y border-black/5 dark:border-white/10 dark:border-white/5" id="how-it-works">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">How UpSkillAi Works</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">A seamless 4-step flow to transform your goals into actionable learning.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Tell UpSkillAi Your Goals", desc: "Share what you want to learn, your current skill level, and your timeline.", icon: "chat_bubble" },
                { step: "02", title: "AI Analyzes", desc: "Our engine understands your requirements and maps out the perfect learning strategy.", icon: "psychology" },
                { step: "03", title: "Roadmap Generated", desc: "Get a personalized, step-by-step roadmap tailored specifically to your needs.", icon: "map" },
                { step: "04", title: "Course Created", desc: "Start learning with AI-generated chapters, videos, quizzes, and code practice.", icon: "school" },
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-nova-bg rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none group hover:shadow-soft transition-all">
                  <div className="w-12 h-12 bg-nova-card rounded-full flex items-center justify-center text-nova-primary shadow-sm dark:shadow-none mb-4 border border-nova-accent/20 group-hover:bg-nova-primary group-hover:text-white transition-colors">
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
            <div className="md:col-span-8 bg-nova-card rounded-2xl p-8 shadow-soft group relative overflow-hidden border border-black/5 dark:border-white/10 dark:border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-nova-accent/5 rounded-full blur-[50px] group-hover:bg-nova-accent/10 transition-colors"></div>
              <span className="material-symbols-outlined text-[32px] text-nova-primary mb-4 relative z-10">route</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2 relative z-10">Personalized Roadmaps</h3>
              <p className="text-nova-body relative z-10">Stop guessing what to learn next. Get a dynamically generated, step-by-step path to mastery based on your current skill level and ultimate goals.</p>
            </div>
            {/* Feature 2 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft group border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-nova-accent mb-4">auto_awesome_mosaic</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">AI Course Generation</h3>
              <p className="text-nova-body">Topics are broken down into digestible, AI-curated chapters tailored to your reading speed.</p>
            </div>
            {/* Feature 3 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">video_library</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Video Recommendations</h3>
              <p className="text-nova-body">Curated YouTube videos integrated directly into your learning chapters for better understanding.</p>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">touch_app</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Interactive Learning</h3>
              <p className="text-nova-body">Engage with dynamic content, notes, and interactive blocks instead of passive reading.</p>
            </div>
            {/* Feature 5 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">quiz</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Quizzes</h3>
              <p className="text-nova-body">Test your knowledge with generated quizzes that adapt in difficulty based on your performance.</p>
            </div>
            {/* Feature 6 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">terminal</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Code Practice</h3>
              <p className="text-nova-body">Practice immediately with integrated development environments for seamless coding exercises.</p>
            </div>
            {/* Feature 7 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">monitoring</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Progress Tracking</h3>
              <p className="text-nova-body">Visualize your growth with detailed analytics, daily streaks, and completion metrics.</p>
            </div>
            {/* Feature 8 */}
            <div className="md:col-span-4 bg-nova-card rounded-2xl p-8 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="material-symbols-outlined text-[32px] text-gray-400 mb-4">workspace_premium</span>
              <h3 className="text-xl font-bold text-nova-heading tracking-tight mb-2">Certificates</h3>
              <p className="text-nova-body">Earn verifiable certificates upon course completion to showcase your newly acquired skills.</p>
            </div>
          </div>
        </section>

        {/* Product Preview Section */}
        <section className="px-4 md:px-16 py-section bg-nova-accent/5 border-y border-black/5 dark:border-white/10 dark:border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Experience the Future of Learning</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">A beautifully designed platform crafted for focus and productivity.</p>
            </div>
            <div className="bg-nova-card rounded-3xl p-2 md:p-6 shadow-soft border border-black/5 dark:border-white/10 dark:border-white/5 overflow-hidden">
              <div className="bg-nova-bg rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 overflow-hidden flex flex-col md:flex-row h-[500px]">
                {/* Sidebar Mock */}
                <div className="w-full md:w-64 bg-nova-card border-r border-black/5 dark:border-white/10 dark:border-white/5 p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    </div>
                    <span className="font-bold text-nova-heading">UpSkillAi Studio</span>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setPreviewTab("dashboard")}
                      className={`w-full h-10 rounded-lg flex items-center px-4 text-sm font-medium transition-all ${
                        previewTab === "dashboard" 
                          ? "bg-primary/10 text-primary shadow-inner" 
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-nova-body"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] mr-3">dashboard</span> Dashboard
                    </button>
                    <button 
                      onClick={() => setPreviewTab("roadmaps")}
                      className={`w-full h-10 rounded-lg flex items-center px-4 text-sm font-medium transition-all ${
                        previewTab === "roadmaps" 
                          ? "bg-primary/10 text-primary shadow-inner" 
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-nova-body"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] mr-3">route</span> Roadmaps
                    </button>
                    <button 
                      onClick={() => setPreviewTab("courses")}
                      className={`w-full h-10 rounded-lg flex items-center px-4 text-sm font-medium transition-all ${
                        previewTab === "courses" 
                          ? "bg-primary/10 text-primary shadow-inner" 
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-nova-body"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] mr-3">school</span> Courses
                    </button>
                  </div>
                </div>
                {/* Main Content Mock */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-nova-bg hide-scrollbar">
                  {previewTab === 'dashboard' && (
                    <div className="flex h-full gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {/* Dashboard Fake Sidebar */}
                      <div className="hidden sm:flex w-48 flex-col gap-2 border-r border-black/5 dark:border-white/10 pr-6">
                        <button className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 w-full mb-4">
                          <span className="material-symbols-outlined text-[18px]">add</span> Create Course
                        </button>
                        <div className="flex items-center gap-3 px-3 py-2.5 text-primary bg-primary/10 rounded-lg text-sm font-bold">
                          <span className="material-symbols-outlined text-[18px]">home</span> Home
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 text-nova-body hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">library_books</span> My Courses
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 text-nova-body hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">bar_chart</span> Analytics
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 text-nova-body hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors cursor-pointer mt-auto">
                          <span className="material-symbols-outlined text-[18px]">person</span> Profile
                        </div>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-nova-heading">Welcome back, Learner!</h3>
                            <p className="text-sm text-nova-body">Ready to continue your learning journey?</p>
                          </div>
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">Pro Member</span>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm flex flex-col items-center justify-center">
                            <div className="text-nova-body text-xs font-medium uppercase tracking-wider mb-2">Active Courses</div>
                            <div className="text-3xl font-black text-nova-heading tabular-nums">3</div>
                          </div>
                          <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm flex flex-col items-center justify-center">
                            <div className="text-nova-body text-xs font-medium uppercase tracking-wider mb-2">Hours Learned</div>
                            <div className="text-3xl font-black text-nova-heading tabular-nums">12.5</div>
                          </div>
                          <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm flex flex-col items-center justify-center">
                            <div className="text-nova-body text-xs font-medium uppercase tracking-wider mb-2">Quizzes Passed</div>
                            <div className="text-3xl font-black text-nova-heading tabular-nums">8</div>
                          </div>
                        </div>

                        {/* My Generated Courses */}
                        <div className="mt-8">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-nova-heading uppercase tracking-wider text-gray-500">My Generated Courses</h4>
                            <span className="text-xs font-medium text-primary cursor-pointer hover:underline">View all</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[20px]">code</span>
                                </div>
                                <div>
                                  <div className="font-bold text-nova-heading text-sm">Python Mastery</div>
                                  <div className="text-[10px] text-nova-body mt-0.5">Updated 2 days ago</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-nova-body">Chapter 2</span>
                                <span className="font-bold text-nova-heading">32%</span>
                              </div>
                              <div className="mt-1 h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[32%]"></div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-lg flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[20px]">brush</span>
                                </div>
                                <div>
                                  <div className="font-bold text-nova-heading text-sm">UI/UX Design Basics</div>
                                  <div className="text-[10px] text-nova-body mt-0.5">Updated 1 week ago</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-nova-body">Not started</span>
                                <span className="font-bold text-nova-heading">0%</span>
                              </div>
                              <div className="mt-1 h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-300 w-0"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTab === 'roadmaps' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl mx-auto">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Your personalized plan</p>
                          <h3 className="text-2xl font-bold text-nova-heading">Python Mastery</h3>
                          <p className="text-sm text-nova-body mt-1 max-w-md">A structured path from where you are today to the outcomes you chose.</p>
                        </div>
                        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary/90 whitespace-nowrap">
                          Start Course Generation
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-nova-card rounded-xl border border-black/5 dark:border-white/10 shadow-sm">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Chapters</p>
                          <p className="text-sm font-bold text-nova-heading">12</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Duration</p>
                          <p className="text-sm font-bold text-nova-heading">3 Weeks</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pace</p>
                          <p className="text-sm font-bold text-nova-heading">2 Hrs/day</p>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Content Included</p>
                          <div className="flex gap-2 mt-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"><span className="material-symbols-outlined text-[14px]">play_circle</span> Video</div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded"><span className="material-symbols-outlined text-[14px]">code</span> Code</div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded"><span className="material-symbols-outlined text-[14px]">quiz</span> Quiz</div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"><span className="material-symbols-outlined text-[14px]">description</span> Text</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-primary/5 border border-primary/10 rounded-xl mb-6">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">psychology</span> Why this roadmap?
                        </h4>
                        <p className="text-sm text-primary/80 leading-relaxed">
                          This roadmap is designed for beginners wanting to master Python data structures. It prioritizes foundational logic before moving to advanced algorithms, ensuring a smooth learning curve customized to your 2 hours/day schedule.
                        </p>
                      </div>

                      <div className="relative pl-6 border-l-2 border-gray-100 dark:border-white/10 space-y-4">
                        {/* Expanded Chapter */}
                        <div className="relative">
                          <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-primary ring-4 ring-nova-bg"></div>
                          <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm border-l-4 border-l-primary">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-nova-heading text-lg">1. Python Basics</h4>
                              <span className="text-[10px] font-bold text-nova-body bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">Day 1-3</span>
                            </div>
                            <p className="text-xs text-nova-body mb-4 pb-4 border-b border-black/5 dark:border-white/10">Variables, Data Types, Control Flow, and Functions</p>
                            
                            <div className="pl-2 border-l-2 border-gray-100 dark:border-white/10 space-y-4">
                              <div>
                                <h5 className="text-sm font-bold text-nova-heading mb-2">1.1 Variables & Data Types</h5>
                                <div className="space-y-1.5 pl-2 text-xs text-nova-body">
                                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Integers & Floats</div>
                                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Strings & Booleans</div>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-nova-heading mb-2">1.2 Control Flow</h5>
                                <div className="space-y-1.5 pl-2 text-xs text-nova-body">
                                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> If/Else Statements</div>
                                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> For and While Loops</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Collapsed Chapter */}
                        <div className="relative">
                          <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-gray-200 dark:bg-white/20 ring-4 ring-nova-bg"></div>
                          <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-black/5 opacity-80">
                            <div className="flex flex-col">
                              <h4 className="font-bold text-nova-heading">2. Data Structures</h4>
                              <span className="text-[10px] text-nova-body mt-0.5">Lists, Dictionaries, Sets</span>
                            </div>
                            <span className="material-symbols-outlined text-[20px] text-gray-400">expand_more</span>
                          </div>
                        </div>

                        {/* Collapsed Chapter */}
                        <div className="relative">
                          <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-gray-200 dark:bg-white/20 ring-4 ring-nova-bg"></div>
                          <div className="p-4 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-black/5 opacity-80">
                            <div className="flex flex-col">
                              <h4 className="font-bold text-nova-heading">3. Object Oriented Programming</h4>
                              <span className="text-[10px] text-nova-body mt-0.5">Classes & Inheritance</span>
                            </div>
                            <span className="material-symbols-outlined text-[20px] text-gray-400">expand_more</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTab === 'courses' && (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500 pr-2">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5 dark:border-white/10">
                        <div>
                          <h3 className="text-lg font-bold text-nova-heading">Lists and Arrays</h3>
                          <p className="text-xs text-nova-body mt-1">Chapter 2: Data Structures • Lesson 1</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 text-xs font-semibold bg-nova-card border border-black/5 dark:border-white/10 rounded-lg text-nova-body hover:bg-black/5 hidden sm:block">Prev</button>
                          <button className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 shadow-sm">Next</button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-8">
                        {/* Video & Text split layout */}
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Video Player Mock - Half Size */}
                          <div className="w-full md:w-1/2 aspect-video bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-md border border-black/10">
                            <img src="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80" alt="Code Background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-red-500 hover:scale-105 transition-all z-10 shadow-lg">
                              <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10">
                              <div className="text-white text-[10px] font-bold font-mono">12:04 / 24:15</div>
                              <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                                <div className="h-full bg-red-600 w-[50%]"></div>
                              </div>
                            </div>
                          </div>

                          {/* Text Output Mock beside video */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center">
                            <h4 className="font-bold text-nova-heading text-xl mb-3">Understanding Lists</h4>
                            <p className="text-sm text-nova-body leading-relaxed mb-4">
                              A list in Python is an ordered, mutable collection. Lists can contain items of different data types, and they are defined by enclosing elements in square brackets <code className="bg-nova-card border border-black/10 px-1 py-0.5 rounded text-xs font-mono">[]</code>.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-3 rounded-lg">
                              <div className="flex items-center gap-2 text-blue-600 mb-1 font-bold text-[11px] uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[14px]">info</span> Pro Tip
                              </div>
                              <p className="text-[11px] text-nova-body">Lists are zero-indexed, meaning the first element is at index 0.</p>
                            </div>
                          </div>
                        </div>

                        {/* Array / List Memory Diagram Chart Mock */}
                        <div className="p-6 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm">
                           <h4 className="font-bold text-nova-heading text-sm mb-6">List Memory Representation & Complexity</h4>
                           <div className="flex items-center justify-center gap-4 font-mono text-sm overflow-x-auto pb-4">
                             <div className="flex flex-col items-center">
                               <span className="mb-2 text-[10px] text-gray-400 font-sans font-bold">Index 0</span>
                               <div className="w-14 h-14 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center font-bold text-primary shadow-sm">10</div>
                             </div>
                             <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
                             <div className="flex flex-col items-center">
                               <span className="mb-2 text-[10px] text-gray-400 font-sans font-bold">Index 1</span>
                               <div className="w-14 h-14 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center font-bold text-primary shadow-sm">20</div>
                             </div>
                             <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
                             <div className="flex flex-col items-center">
                               <span className="mb-2 text-[10px] text-gray-400 font-sans font-bold">Index 2</span>
                               <div className="w-14 h-14 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center font-bold text-primary shadow-sm">30</div>
                             </div>
                           </div>
                           <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t border-black/5 dark:border-white/10 pt-6">
                             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                               <div className="text-xs text-nova-body mb-1 font-medium uppercase tracking-wider">Access</div>
                               <div className="font-bold text-green-500 text-lg">O(1)</div>
                             </div>
                             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                               <div className="text-xs text-nova-body mb-1 font-medium uppercase tracking-wider">Search</div>
                               <div className="font-bold text-yellow-500 text-lg">O(n)</div>
                             </div>
                             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                               <div className="text-xs text-nova-body mb-1 font-medium uppercase tracking-wider">Append</div>
                               <div className="font-bold text-green-500 text-lg">O(1)</div>
                             </div>
                           </div>
                        </div>

                        {/* Code Sandbox Mock */}
                        <div>
                          <div className="flex items-center justify-between bg-slate-800 text-white px-4 py-2 rounded-t-xl border border-slate-700">
                            <span className="text-xs font-mono font-bold text-gray-300">python</span>
                            <span className="text-[10px] bg-slate-700 px-3 py-1.5 rounded cursor-pointer hover:bg-slate-600 font-bold uppercase tracking-wider transition-colors shadow-sm">Run Code</span>
                          </div>
                          <div className="bg-[#1e1e1e] p-5 rounded-b-xl border-x border-b border-slate-800 font-mono text-sm shadow-inner overflow-x-auto">
                            <div className="text-purple-400 mb-1"># Create a new list</div>
                            <div className="mb-4"><span className="text-blue-400">my_list</span> = [<span className="text-orange-400">1</span>, <span className="text-orange-400">2</span>, <span className="text-orange-400">3</span>, <span className="text-green-400">"apple"</span>]</div>
                            
                            <div className="text-purple-400 mb-1"># Append an item</div>
                            <div className="mb-4">my_list.append(<span className="text-green-400">"banana"</span>)</div>
                            
                            <div><span className="text-yellow-200">print</span>(my_list)</div>
                          </div>
                        </div>

                        {/* Quiz Mock */}
                        <div className="p-6 bg-nova-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm relative">
                          <div className="absolute top-6 right-6 text-xs font-bold text-gray-500 bg-black/5 px-3 py-1.5 rounded-full border border-black/5">Question 5/5</div>
                          <div className="flex items-center gap-2 mb-6 text-primary font-bold">
                            <span className="material-symbols-outlined">quiz</span> Quick Knowledge Check
                          </div>
                          <p className="text-sm font-medium text-nova-heading mb-6 pr-24">What is the output of <code className="bg-black/5 px-1.5 py-0.5 rounded text-xs">my_list[1]</code> if <code className="bg-black/5 px-1.5 py-0.5 rounded text-xs">my_list = [10, 20, 30]</code>?</p>
                          <div className="space-y-3">
                            <div className="p-4 border border-black/10 rounded-lg text-sm hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors font-mono">10</div>
                            <div className="p-4 border border-primary bg-primary/10 rounded-lg text-sm font-bold text-primary flex justify-between items-center cursor-pointer font-mono shadow-sm">
                              20 <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </div>
                            <div className="p-4 border border-black/10 rounded-lg text-sm hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors font-mono">30</div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex justify-end">
                            <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-all hover:scale-105">Submit Quiz</button>
                          </div>
                        </div>

                        {/* Mark Complete Button */}
                        <div className="pt-4 flex justify-center pb-8">
                          <button className="flex items-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-sm hover:bg-green-600 transition-all hover:shadow-md hover:scale-105">
                            <span className="material-symbols-outlined">check_circle</span> Mark Lesson as Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why UpSkillAi */}
        <section className="px-4 md:px-16 py-section">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Why Choose UpSkillAi?</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">Ditch the outdated methods. Embrace the future of learning.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-nova-card p-8 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none">
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
                  <h3 className="text-xl font-bold text-nova-heading">UpSkillAi</h3>
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
        <section className="px-4 md:px-16 py-section bg-nova-card border-y border-black/5 dark:border-white/10 dark:border-white/5" id="pricing">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-nova-body max-w-2xl mx-auto">Start learning for free. Upgrade when you need more power.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              {/* Free Plan */}
              <div className="w-full md:w-96 bg-nova-bg p-8 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none">
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
                {!user ? (
                  <Link href="/sign-in" className="w-full block">
                    <button className="w-full bg-nova-card text-nova-heading text-sm font-medium py-3 rounded-lg border border-black/10 dark:border-white/10 dark:border-white/10 hover:bg-gray-50 dark:bg-nova-card/5 transition-colors">
                      Get Started Free
                    </button>
                  </Link>
                ) : (
                  <Link href="/dashboard" className="w-full block">
                    <button className="w-full bg-nova-card text-nova-heading text-sm font-medium py-3 rounded-lg border border-black/10 dark:border-white/10 dark:border-white/10 hover:bg-gray-50 dark:bg-nova-card/5 transition-colors">
                      Go to Dashboard
                    </button>
                  </Link>
                )}
              </div>
              {/* Pro Plan */}
              <div className="w-full md:w-96 bg-nova-card p-8 rounded-2xl border border-nova-primary/20 shadow-soft relative">
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
                <button
                  onClick={() => {
                    setQuery("I am interested in upgrading to Pro");
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-nova-primary text-white text-sm font-medium py-3 rounded-lg hover:bg-nova-primary/90 transition-colors shadow-sm dark:shadow-none"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {/* <section className="px-4 md:px-16 py-section">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-12">Loved by Learners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: "UpSkillAi completely changed how I learn React. The customized roadmap saved me weeks of aimless searching on YouTube.", name: "Alex P.", role: "Frontend Developer" },
                { quote: "The AI course generation is magic. It broke down complex machine learning topics into chapters I could actually understand.", name: "Sarah K.", role: "Data Science Student" },
                { quote: "Finally, a platform that adapts to my pace. The interactive quizzes make sure I don't just read, but actually retain the knowledge.", name: "David M.", role: "Self-taught Programmer" }
              ].map((item, i) => (
                <div key={i} className="bg-nova-card p-6 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none text-left flex flex-col justify-between">
                  <p className="text-nova-body text-sm mb-6 italic">"{item.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-nova-card/10 rounded-full flex items-center justify-center text-gray-500 font-bold">
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
        </section> */}

      </main>

      {/* FAQ Section */}
      <section className="px-4 md:px-16 py-section bg-nova-bg border-y border-black/5 dark:border-white/10 dark:border-white/5" id="faq">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-nova-body max-w-2xl mx-auto">Everything you need to know about UpSkillAi.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does UpSkillAi generate courses?", a: "We use advanced AI models to understand your goals and current skill level, then generate a personalized curriculum with structured chapters, interactive elements, and curated resources." },
              { q: "Are courses personalized?", a: "Yes, absolutely. Every roadmap and course is dynamically generated based on your specific timeline, background, and learning style." },
              { q: "Can I upload PDFs or notes?", a: "This feature is currently in development. Soon, you'll be able to upload your own materials, and our AI will weave them directly into your generated courses." },
              { q: "Is there a free plan?", a: "Yes! We offer a generous free plan that lets you explore personalized learning and generate your first courses at no cost." },
              { q: "How does roadmap generation work?", a: "You tell us your end goal, and the AI works backward to create a step-by-step path, identifying all the prerequisite skills and topics you need to master." },
              { q: "Will I get certificates?", a: "Yes, completing your personalized learning paths will grant you verifiable certificates to showcase your newly acquired skills." },
              { q: "Can I improve generated courses later?", a: "With our Pro plan, you can continuously refine and expand your courses, adding more depth or new topics as you progress." },
            ].map((faq, i) => (
              <details key={i} name="faq" className="group bg-nova-card rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:shadow-soft transition-all">
                <summary className="flex items-center justify-between font-bold text-nova-heading text-lg">
                  {faq.q}
                  <span className="material-symbols-outlined text-nova-primary transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-nova-body leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 md:px-16 py-section bg-nova-card" id="contact">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">Get In Touch</h2>
          <p className="text-lg text-nova-body">Have questions or need support? We're here to help.</p>
        </div>
        <div className="max-w-2xl mx-auto bg-nova-bg p-8 md:p-10 rounded-3xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-soft relative overflow-hidden">
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
                <input required name="name" value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all" placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-sm font-bold text-nova-heading mb-2">Email Address</label>
                <input required name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all" placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-nova-heading mb-2">Phone Number <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="w-full bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all" placeholder="+91 9876543210" />
              </div>

              <div>
                <label className="block text-sm font-bold text-nova-heading mb-2">Your Query</label>
                <textarea required name="query" rows={4} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 rounded-xl px-4 py-3 text-nova-body focus:outline-none focus:ring-2 focus:ring-nova-primary/20 focus:border-nova-primary transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <button disabled={isLoading} type="submit" className="w-full bg-nova-primary text-white font-bold py-4 rounded-xl hover:bg-nova-primary/90 hover:shadow-[0_10px_20px_rgba(255,140,66,0.2)] transition-all active:scale-[0.98] duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
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
      </section>

      {/* Footer */}
      <footer className="w-full bg-nova-bg border-t border-black/5 dark:border-white/10 dark:border-white/5 pt-16 pb-8 px-4 md:px-16 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          {/* Left Side */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <Link className="text-2xl font-bold tracking-tight text-nova-heading flex items-center gap-2" href="/">
              <span className="material-symbols-outlined text-nova-primary">auto_awesome</span>
              UpSkillAi
            </Link>
            <p className="text-nova-body text-sm leading-relaxed mt-2 max-w-sm">
              Personalized AI-powered learning paths designed around your goals, skill level, and learning style.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="font-bold text-nova-heading mb-4">Quick Links</h4>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-3 text-sm text-nova-body max-w-xl">
              <Link className="hover:text-nova-primary transition-colors duration-200" href="/">Home</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href="#features">Features</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href="#how-it-works">How It Works</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href="#pricing">Pricing</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href="/dashboard">Dashboard</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href="/sign-in">Create Course</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href={user ? "/dashboard/explore" : "/sign-in"}>Marketplace</Link>
              <Link className="hover:text-nova-primary transition-colors duration-200" href="#contact">Contact Us</Link>
            </div>
          </div>

          {/* Legal / Support (Commented out as requested) */}
          {/* 
          <div className="md:col-span-2">
            <h4 className="font-bold text-nova-heading mb-4">Support</h4>
            ...
          </div> 
          */}

          {/* Connect (Commented out as requested) */}
          {/* 
          <div className="md:col-span-2">
            <h4 className="font-bold text-nova-heading mb-4">Connect</h4>
            ...
          </div> 
          */}
        </div>

        {/* Bottom */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-black/5 dark:border-white/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-nova-body">
            © {new Date().getFullYear()} UpSkillAi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
