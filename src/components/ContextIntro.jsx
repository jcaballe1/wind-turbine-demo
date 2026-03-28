import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Wind, Magnet, Globe, Target, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
  {
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 border-yellow-200',
    title: 'How does a generator actually work?',
    body: 'Every generator — from a bicycle dynamo to a 15MW offshore turbine — runs on one fundamental principle: move a magnetic field past a coil of copper wire, and electrons start flowing. That flow of electrons is electricity. Motion + Magnetism = Electricity. No magnets, no electricity. It\'s that simple — and it changes everything.',
    visual: (
      <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-16 rounded-lg bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-3xl shadow-inner">🌀</div>
          <span className="text-xs text-slate-500 font-semibold mt-1">Copper Coil</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <ArrowRight size={32} />
          <span className="text-xs font-medium">moves past</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-16 rounded-lg bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-3xl shadow-inner">🧲</div>
          <span className="text-xs text-blue-600 font-semibold mt-1">Rotating Magnet</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <ArrowRight size={32} />
          <span className="text-xs font-medium">produces</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-16 rounded-lg bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center text-3xl shadow-inner">⚡</div>
          <span className="text-xs text-yellow-600 font-semibold mt-1">Electricity</span>
        </div>
      </div>
    ),
  },
  {
    icon: Wind,
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200',
    title: 'The slow-rotation problem',
    body: 'A car engine spins at 3,000+ RPM. An offshore wind turbine blade? Only 7–12 RPM — barely a crawl. Conventional magnets (like cheap ferrite, made from iron) need high rotational speeds to produce useful amounts of electricity. At 10 RPM, they generate almost nothing. So engineers faced a hard question: how do you produce megawatts of power from blades that spin slower than a ceiling fan?',
    visual: (
      <div className="flex items-center justify-center gap-12 py-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">🚗</span>
          <span className="text-xs font-bold text-slate-700">Car Engine</span>
          <span className="text-xl font-extrabold text-red-500">3,000+ RPM</span>
          <span className="text-xs text-slate-500">Fast — easy to generate power</span>
        </div>
        <div className="text-3xl font-thin text-slate-300">vs</div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">🌬️</span>
          <span className="text-xs font-bold text-slate-700">Offshore Turbine</span>
          <span className="text-xl font-extrabold text-blue-500">~10 RPM</span>
          <span className="text-xs text-slate-500">Slow — conventional magnets fail</span>
        </div>
      </div>
    ),
  },
  {
    icon: Magnet,
    color: 'text-purple-500',
    bg: 'bg-purple-50 border-purple-200',
    title: 'The rare-earth solution',
    body: 'Neodymium (NdFeB) magnets — made from rare-earth elements — are approximately 10× stronger than ferrite magnets of the same physical size. With a strong enough magnet, you can generate serious electricity even at 10 RPM. This is why modern direct-drive offshore turbines skip the gearbox entirely — the powerful magnet does all the heavy lifting. Fewer moving parts means far less maintenance, which is critical when your turbine is 50 km out at sea.',
    visual: (
      <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
        <div className="flex flex-col items-center gap-2 p-4 bg-slate-100 rounded-xl border border-slate-200 w-36">
          <span className="text-4xl">🧲</span>
          <span className="text-xs font-bold text-slate-600 text-center">Ferrite Magnet</span>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
          <span className="text-xs text-slate-500">~10% relative strength</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl border-2 border-purple-400 shadow-lg w-36">
          <span className="text-4xl">🔮</span>
          <span className="text-xs font-bold text-purple-700 text-center">Neodymium (NdFeB)</span>
          <div className="w-full bg-purple-100 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <span className="text-xs text-purple-700 font-semibold">~100% relative strength</span>
        </div>
      </div>
    ),
  },
  {
    icon: Globe,
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    title: 'But there is a catch.',
    body: 'Neodymium is a "rare-earth" element. It\'s not actually rare in the earth\'s crust — but mining and refining it is expensive, environmentally damaging, and heavily concentrated geographically. Over 90% of the world\'s rare-earth processing currently happens in China. This creates a powerful supply-chain dependency: if access is disrupted politically or economically, the entire wind energy build-out is at risk. This is precisely what experts mean when they call something a "critical material."',
    visual: (
      <div className="flex items-center justify-center py-4">
        <div className="relative w-64 h-28 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center gap-4">
          <span className="text-6xl">🌏</span>
          <div className="flex flex-col gap-1">
            <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1">
              <span className="text-xs font-bold text-red-700">90%+ processed in China</span>
            </div>
            <div className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-1">
              <span className="text-xs font-bold text-amber-700">Toxic tailings waste</span>
            </div>
            <div className="bg-orange-100 border border-orange-300 rounded-lg px-3 py-1">
              <span className="text-xs font-bold text-orange-700">High extraction cost</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200',
    title: "You're the engineer now.",
    body: "In the simulation ahead, you'll control a wind turbine's design by choosing the magnet type, its size, and the generator configuration. You'll immediately see the consequences across three dimensions that are always in tension with each other: Power Output, Total Cost (CAPEX + OPEX), and Environmental & Supply-Chain Risk. There is no single perfect answer. Your job is to explore the trade-offs and decide what matters most.",
    visual: (
      <div className="flex justify-center gap-4 py-4 flex-wrap">
        {[
          { label: 'Power Output', icon: '⚡', sub: 'How much electricity?', color: 'bg-blue-50 border-blue-300 text-blue-700', sub2: 'text-blue-500' },
          { label: 'Total Cost', icon: '💰', sub: 'CAPEX + maintenance', color: 'bg-amber-50 border-amber-300 text-amber-700', sub2: 'text-amber-500' },
          { label: 'Environment', icon: '🌱', sub: 'Supply chain risk', color: 'bg-emerald-50 border-emerald-300 text-emerald-700', sub2: 'text-emerald-500' },
        ].map(({ label, icon, sub, color, sub2 }) => (
          <div key={label} className={`flex flex-col items-center gap-1 px-5 py-4 rounded-xl border-2 ${color} min-w-[110px]`}>
            <span className="text-3xl">{icon}</span>
            <span className="text-xs font-bold text-center mt-1">{label}</span>
            <span className={`text-xs text-center ${sub2}`}>{sub}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 70 : -70, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -70 : 70, opacity: 0 }),
};

const ContextIntro = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (next) => {
    setDirection(next > stepIndex ? 1 : -1);
    setStepIndex(next);
  };

  const step = steps[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Header label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold text-teal-600 uppercase tracking-widest mb-4"
        >
          Before You Start · The Physics That Matter
        </motion.p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'bg-teal-700 w-7' : 'bg-slate-300 hover:bg-slate-400 w-2.5'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="relative bg-white rounded-2xl border-2 border-slate-900 shadow-hard overflow-hidden" style={{ minHeight: 440 }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={stepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: 'easeInOut' }}
              className="p-8 flex flex-col gap-5"
            >
              {/* Icon badge + step counter */}
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${step.bg}`}>
                  <Icon className={step.color} size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  {stepIndex + 1} / {steps.length}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold font-serif text-slate-900 leading-snug">{step.title}</h2>

              {/* Visual block */}
              <div className={`rounded-xl border ${step.bg}`}>
                {step.visual}
              </div>

              {/* Body text */}
              <p className="text-slate-600 leading-relaxed text-[15px]">{step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {isLast ? (
            <motion.button
              onClick={onComplete}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-8 py-3 rounded-xl border-2 border-slate-900 shadow-hard transition-colors"
            >
              Enter the Simulation <ArrowRight size={18} />
            </motion.button>
          ) : (
            <button
              onClick={() => goTo(stepIndex + 1)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContextIntro;
