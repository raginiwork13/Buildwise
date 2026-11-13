import React from 'react';
import { useUser } from '../context/UserContext';
import { FileText, Cpu, Scale, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();

  const steps = [
    {
      num: '01',
      title: 'Describe Your Project',
      desc: 'Tell us in plain language what you want to build in Goa (e.g. "2,000 sq.ft villa in Margao with 4 bedrooms"). Our AI converts your words into structured technical BOQ specifications.',
      icon: FileText,
      badge: 'Natural Language AI'
    },
    {
      num: '02',
      title: 'Instant Cost Forecast',
      desc: 'Our deterministic ML regression model estimates realistic construction expenditure calibrated to Goa current material and labour rates before any commitments.',
      icon: Cpu,
      badge: 'ML Regressor'
    },
    {
      num: '03',
      title: 'Receive & Compare Quotations',
      desc: 'Interested vetted local contractors submit itemized proposals. Compare civil work, materials, timelines, and warranties side-by-side with automated risk flag detection.',
      icon: Scale,
      badge: 'Transparent Bidding'
    },
    {
      num: '04',
      title: 'Track Site Progress to Completion',
      desc: 'Monitor construction stages, approve contractor photo updates at every milestone (foundation, lintel, slab, finishes), and release payments safely.',
      icon: CheckCircle2,
      badge: 'Milestone Peace of Mind'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
            How BuildWise Works
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            From initial idea to handover keys. A transparent, 4-step digital journey connecting property owners with trusted Goan builders.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-slate-600 group-hover:text-amber-400 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-700/70 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-700/50 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <span>Step {idx + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => {
              setSelectedRoleForModal('customer');
              setOpenRegisterModal(true);
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Start Your Construction Project Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

