import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-14 sm:pt-16 sm:pb-16 border-b border-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-amber-400 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Goa's #1 AI Construction Marketplace · Problem Statement 6</span>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mt-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Constructing in Goa,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Made Intelligent & Transparent
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Connect directly with verified local contractors, architects, and suppliers. Leverage AI to forecast accurate budgets, translate requirements into BOQ specifications, and audit contractor quotations side-by-side.
          </p>
        </div>
      </div>
    </section>
  );
};
