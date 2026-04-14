import React from 'react'

const page = () => {
  return (
    <div className="glass-panel mx-auto max-w-3xl rounded-2xl p-8 text-center sm:p-10">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Upgrade</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-100 sm:text-4xl">
        Scale Beyond the Free Plan
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-slate-300">
        Unlock unlimited course creation, richer customization, and faster generation throughput.
      </p>

      <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/60 p-6 text-left">
        <ul className="space-y-3 text-sm text-slate-300">
          <li>Unlimited AI course generation</li>
          <li>Priority processing during peak hours</li>
          <li>Advanced branding and theme controls</li>
          <li>Expanded analytics for learner progress</li>
        </ul>
      </div>

      <button className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-slate-950 transition hover:bg-primary/90">
        Contact for Upgrade
      </button>
    </div>
  )
}

export default page