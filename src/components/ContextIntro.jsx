import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Wind, Magnet, Globe, Target, ArrowRight, ArrowLeft, Factory, Cpu, AlertTriangle } from 'lucide-react';

const getSteps = (setEnlargedImage) => [
  {
    icon: Zap,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    title: 'Electromagnetic Induction in Wind Energy',
    body: (<>Modern wind turbines rely on Faraday's Law of Induction. By rotating a magnetic field past conductive copper stator coils, mechanical energy is converted into electrical energy.<br /><br />In Permanent Magnet Synchronous Generators (PMSGs), the strength of the magnetic flux directly dictates the generator's efficiency and size.</>),
    source: 'Ref: Hughes, E. (2012). Electrical and Electronic Technology. Pearson.',
    visual: (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm w-full flex justify-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setEnlargedImage('images/generator-diagram.png')}>
          <img 
            src="images/generator-diagram.png"
            alt="Schematic of a Permanent Magnet Synchronous Generator" 
            className="max-h-96 w-full object-contain"
          />
        </div>
        <span className="text-[10px] text-slate-500 mt-2 font-mono text-center">
          Fig 1: Cross-section of a PMSG showing NdFeB magnets and copper stator windings. <span className="text-[#C5A059] font-semibold">(Click to enlarge)</span>
        </span>
      </div>
    ),
  },
  {
    icon: Wind,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: 'The solution on Rare-Earth Magnets',
    body: (<>Conventional generators require high rotational speeds (1,500+ RPM) to generate sufficient voltage, which means using maintenance-heavy gearboxes.<br /><br />Offshore turbines aim for Direct-Drive (DD) configurations, attaching the rotor directly to the generator at low speeds (7–12 RPM). To compensate for the low speed, the generator requires exponentially stronger magnetic fields.</>),
    source: 'Ref: Polinder, H. et al. (2006). Comparison of Direct-Drive and Geared Generator Concepts.',
    visual: (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm w-full flex justify-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setEnlargedImage('images/AEE_Grafik_Windenergie_jul21_300dpi.jpg')}>
          <img 
            src="images/AEE_Grafik_Windenergie_jul21_300dpi.jpg"
            alt="Comparison of Geared and Direct-Drive Wind Turbines" 
            className="max-h-96 w-full object-contain"
          />
        </div>
        <span className="text-[10px] text-slate-500 mt-2 font-mono text-center leading-tight">
          Fig 2: Nacelle layout comparison. <br/>
          <span className="font-semibold text-slate-700">Left (1):</span> Geared drivetrain (Getriebe). 
          <span className="font-semibold text-slate-700 ml-2">Right (2):</span> Direct-Drive (Getriebelos). <span className="text-[#C5A059] font-semibold">(Click to enlarge)</span>
        </span>
      </div>
    ),
  },
  {
    icon: Magnet,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    title: 'Why Rare-Earths?',
    body: (<>To achieve necessary flux density at low RPMs, engineers use Neodymium-Iron-Boron (NdFeB) magnets. Measured by their Maximum Energy Product (BH_max), NdFeB achieves ~400 kJ/m³, compared to traditional Ferrite at ~30 kJ/m³.<br /><br />This allows for a massive reduction in generator size and weight, a key factor when installing nacelles 150 meters above the ocean.</>),
    source: 'Ref: Gutfleisch, O. et al. (2011). Magnetic Materials and Devices for the 21st Century.',
    visual: (
      <div className="flex flex-col justify-center gap-4 py-4 px-8 w-full">
        <div className="w-full">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Ferrite Magnet (BH_max)</span>
            <span>~30 kJ/m³</span>
          </div>
          <div className="w-full bg-slate-200 rounded-sm h-3 overflow-hidden">
            <div className="bg-slate-400 h-full" style={{ width: '8%' }}></div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex justify-between text-xs font-bold text-purple-700 mb-1">
            <span>NdFeB Rare-Earth (BH_max)</span>
            <span>~400 kJ/m³</span>
          </div>
          <div className="w-full bg-purple-100 rounded-sm h-3 overflow-hidden border border-purple-200">
            <div className="bg-purple-600 h-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    title: 'Critical Materials & Geopolitical Risk',
    body: (<>Neodymium and Dysprosium are "rare-earth" elements. Over 90% of the world's rare-earth processing currently happens in China. This creates a powerful supply-chain dependency: if access is disrupted politically or economically, the entire wind energy build-out is at risk.<br /><br />Neodymium and Dysprosium are classified under the EU Critical Raw Materials Act due to high supply risk. But also, refining these materials involves highly energy-intensive and environmentally toxic processes. This creates a paradox: clean energy reliant on non-sustainable extraction.</>),
    source: 'Ref: European Commission (2023). Study on the Critical Raw Materials for the EU.',
    visual: (
      <div className="flex items-center justify-center py-4">
        <div className="w-full max-w-sm bg-white rounded-xl border border-red-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-600">Global Refining Capacity (Nd/Pr)</span>
            <Globe className="text-slate-400" size={16} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-red-600">85%+</div>
            <div className="text-[11px] text-slate-600 leading-tight">Concentrated in a single market,<br/>presenting severe geopolitical risk.</div>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">High OPEX in Extraction</span>
            <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">Toxic Tailings</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'Your turn: Explore the trade-offs of magnet choice',
    body: (<>In the simulation ahead, you'll control a wind turbine's design by choosing the magnet type. You'll see the consequences across three dimensions that are always in tension with each other: Power Output, Total Cost (CAPEX + OPEX), and Environmental & Supply-Chain Risk.<br /><br />There is no single perfect answer. Your job is to explore the trade-offs and decide what matters most.</>),
    source: 'Educational Tool Context | HZ University of Applied Sciences',
    visual: (
      <div className="flex justify-center gap-3 py-4 flex-wrap w-full">
        {[
          { label: 'Energy Yield', icon: Zap, sub: 'Power / Efficiency', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Economics', icon: Factory, sub: 'CAPEX & LCOE', color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Risk & Impact', icon: AlertTriangle, sub: 'Supply & Ecology', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map(({ label, icon: IconComponent, sub, color }) => (
          <div key={label} className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${color} flex-1 min-w-[100px]`}>
            <IconComponent size={24} />
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-wide">{label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{sub}</div>
            </div>
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
  const [enlargedImage, setEnlargedImage] = useState(null);

  const steps = getSteps(setEnlargedImage);

  const goTo = (next) => {
    setDirection(next > stepIndex ? 1 : -1);
    setStepIndex(next);
  };

  const step = steps[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === steps.length - 1;

  return (
    <motion.div
      className="min-h-screen bg-nobel-cream flex flex-col items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-3xl">

        {/* Header label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold text-[#C5A059] uppercase tracking-widest mb-4"
        >
          Before You Start · The Physics That Matter
        </motion.p>

        {/* Progress dots */}
        <motion.div
          className="flex justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'bg-[#C5A059] w-7' : 'bg-stone-300 hover:bg-stone-400 w-2.5'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          className="relative bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={stepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: 'easeInOut' }}
              className="p-6 flex flex-col gap-3"
            >
              {/* Icon badge + step counter + Title */}
              <div className="flex items-center gap-3">
                <motion.div
                  className={`p-2 rounded-lg border ${step.bg}`}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  <Icon className={step.color} size={18} />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {stepIndex + 1} / {steps.length}
                  </span>
                  <h2 className="text-xl font-bold font-serif text-slate-900 leading-tight">{step.title}</h2>
                </div>
              </div>

              {/* Visual block */}
              <div className={`rounded-xl border ${step.bg}`}>
                {step.visual}
              </div>

              {/* Body text */}
              <div className="text-slate-600 leading-relaxed text-sm">{step.body}</div>

              {/* Source citation */}
              {step.source && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 italic font-mono">{step.source}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex items-center justify-between mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <button
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-stone-600 hover:text-nobel-dark bg-white border border-stone-200 hover:border-stone-300 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {isLast ? (
            <motion.button
              onClick={onComplete}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-nobel-gold hover:bg-[#b8904d] text-white font-bold px-8 py-3 rounded-xl border border-stone-200 shadow-md transition-colors"
            >
              Enter the Simulation <ArrowRight size={18} />
            </motion.button>
          ) : (
            <button
              onClick={() => goTo(stepIndex + 1)}
              className="flex items-center gap-2 bg-nobel-dark hover:bg-stone-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </motion.div>

      </div>

      {/* Image Enlargement Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setEnlargedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
              <img
                src={enlargedImage}
                alt="Enlarged view"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2 shadow-lg transition-colors"
                onClick={() => setEnlargedImage(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContextIntro;
