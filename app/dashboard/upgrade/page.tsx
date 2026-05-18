import React from 'react'
import Link from 'next/link'

const page = () => {
  return (
    <div className="space-y-8">
      <div className="bg-nova-card rounded-3xl p-8 border border-black/5 dark:border-white/10 dark:border-white/5 shadow-soft text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-nova-heading tracking-tight mb-4">
          Scale Beyond the Free Plan
        </h1>
        <p className="text-lg text-nova-body max-w-2xl mx-auto mb-10">
          Unlock unlimited course creation, richer customization, and faster generation throughput.
        </p>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch text-left">
          {/* Free Plan */}
          <div className="flex-1 bg-nova-bg p-8 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-nova-heading mb-2">Free Plan</h3>
              <p className="text-nova-body text-sm mb-6">Your current plan.</p>
              <div className="text-4xl font-bold text-nova-heading mb-6">$0<span className="text-lg text-nova-body font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {["1 Course generation", "Standard AI chapters", "Basic quizzes", "Community support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-nova-body">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full bg-black/5 dark:bg-white/5 text-nova-heading text-sm font-medium py-3 rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5 cursor-default">
              Current Plan
            </button>
          </div>
          
          {/* Pro Plan */}
          <div className="flex-1 bg-nova-card p-8 rounded-2xl border border-nova-primary/20 shadow-soft relative flex flex-col justify-between">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-nova-primary to-nova-accent text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm dark:shadow-none">Pro</div>
            <div>
              <h3 className="text-xl font-bold text-nova-heading mb-2">Pro Plan</h3>
              <p className="text-nova-body text-sm mb-6">For dedicated learners wanting no limits.</p>
              <div className="text-4xl font-bold text-nova-heading mb-6">$19<span className="text-lg text-nova-body font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited AI course generation",
                  "Priority processing during peak hours",
                  "Advanced branding & theme controls",
                  "Expanded analytics for learner progress",
                  "Personal AI Tutor"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-nova-heading font-medium">
                    <span className="material-symbols-outlined text-nova-primary text-[18px]">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/dashboard/contact?query=I+am+interested+in+upgrading+to+Pro" className="w-full">
              <button className="w-full bg-nova-primary text-white text-sm font-medium py-3 rounded-xl hover:shadow-[0_10px_20px_rgba(255,140,66,0.2)] transition-all active:scale-95 duration-200">
                Contact for Upgrade
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
