import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const LandingPage = ({ onEnterSimulation }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-stone-50 flex items-center justify-center"
    >
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-slate-900 mb-6">
            The Invisible Gears of Renewable Energy
          </h1>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Discover how rare-earth Neodymium magnets act as the <i>invisible gears </i> 
             that make wind energy possible, and why they're critical to our energy future.
          </p>
        </div>

        {/* What You'll Learn Section */}
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-hard p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-teal-600 mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-slate-700">Understand why rare-earth magnets are essential for modern wind turbines</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-teal-600 mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-slate-700">Explore the cost–power–environment trade-off of different magnet technologies</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-teal-600 mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-slate-700">Recognize the geopolitical supply-chain risks of critical minerals</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-teal-600 mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-slate-700">Evaluate emerging alternatives like Iron-Nitride</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={onEnterSimulation}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-lg px-10 py-4 rounded-xl border-2 border-slate-900 shadow-hard transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center mx-auto"
          >
            Enter Interactive Simulation <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="text-slate-500 text-sm mt-4">
            Educational Tool | Team Critical Materials | HZ University of Applied Sciences
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
