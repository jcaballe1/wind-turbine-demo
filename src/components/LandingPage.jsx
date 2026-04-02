import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LandingPage = ({ onEnterSimulation }) => {
  return (
    <div className="min-h-screen bg-nobel-cream flex items-center justify-center">
      <motion.div
        className="max-w-3xl mx-auto px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-8" variants={fadeUp}>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-nobel-dark mb-6">
            The Invisible Gears of Renewable Energy
          </h1>
          <p className="text-lg text-stone-700 max-w-3xl mx-auto leading-relaxed">
            Discover how rare-earth Neodymium magnets act as the <i>invisible gears</i>
            {' '}that make wind energy possible, and why they're critical to our energy future.
          </p>
        </motion.div>

        {/* What You'll Learn Section */}
        <motion.div className="bg-white rounded-xl border border-stone-200 shadow-md p-6 mb-8" variants={fadeUp}>
          <h2 className="text-xl font-bold text-nobel-dark mb-4 text-center">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-nobel-gold mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-stone-700">Understand why rare-earth magnets are essential for modern Direct-Drive offshore wind generators (aka wind turbines)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-nobel-gold mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-stone-700">Explore the cost–power–environment trade-off of different magnet technologies</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-nobel-gold mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-stone-700">Recognize the geopolitical supply-chain risks of critical minerals</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-nobel-gold mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-stone-700">Learn about emerging alternatives, including Iron-Nitride (Fe₁₆N₂)</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div className="text-center" variants={fadeUp}>
          <button
            onClick={onEnterSimulation}
            className="bg-nobel-gold hover:bg-[#b8904d] text-white font-bold text-lg px-10 py-4 rounded-xl border border-stone-200 shadow-md transition-all duration-200 hover:-translate-y-1 flex items-center justify-center mx-auto"
          >
            Enter Interactive Simulation <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="text-stone-500 text-sm mt-4">
            Educational Tool | Team Critical Materials | HZ University of Applied Sciences
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
