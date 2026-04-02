import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingState from './LoadingState';

const questions = [
  {
    question: 'A coastal city wants to build 50 offshore turbines but is concerned about supply chain risk. Which combination would you recommend?',
    options: [
      'Standard NdFeB for max power',
      'Iron-Nitride to avoid rare-earth dependency',
      'NdFeB+Dy for offshore heat resistance despite higher risk',
      'Ferrite to minimize cost',
    ],
    correct: 1,
    explanation: 'Iron-Nitride eliminates rare-earth dependency entirely, addressing the city\'s core concern about supply chain risk. While NdFeB or NdFeB+Dy deliver more power, they tie the project to volatile rare-earth markets dominated by China (~85–90% of processing). Ferrite is cheap but too weak for large offshore turbines. Iron-Nitride offers ~80% of NdFeB performance with zero supply-chain vulnerability — the best balance for this scenario.',
  },
  {
    question: 'What is the relationship between wind speed and power output?',
    options: [
      'Linear — double the wind, double the power',
      'Quadratic — power scales with the square of wind speed',
      'Cubic — power scales with the cube of wind speed',
      'Logarithmic — power increases slowly with more wind',
    ],
    correct: 2,
    explanation: 'Wind power follows the cubic law: P ∝ v³. Doubling the wind speed increases available power by 8× (2³ = 8). This is why site selection for consistent, strong winds is critical for turbine economics.',
  },
  {
    question: 'If China restricts rare-earth exports tomorrow, which of these effects would you expect FIRST?',
    options: [
      'Wind turbine prices drop',
      'NdFeB magnet prices spike 3–10×',
      'More turbines get built',
      'Recycling rates immediately reach 25%',
    ],
    correct: 1,
    explanation: 'China controls ~85–90% of rare-earth processing. An export restriction would immediately spike NdFeB magnet prices (3–10×), as happened during the 2010–2011 crisis when neodymium prices surged from ~$30/kg to $340/kg. Turbine prices would rise (not drop), construction would slow (not accelerate), and scaling up recycling takes years — it cannot happen overnight.',
  },
  {
    question: 'What is the main environmental cost of NdFeB magnet production?',
    options: [
      'High CO₂ emissions during smelting',
      'Toxic and radioactive tailings from rare-earth ore processing',
      'Deforestation for mining sites',
      'Noise pollution during extraction',
    ],
    correct: 1,
    explanation: 'Rare-earth mining generates large volumes of toxic tailings containing acids, heavy metals, and radioactive thorium/uranium. For every ton of rare-earth oxide, roughly 2,000 tons of toxic waste are produced — an enormous environmental footprint.',
  },
  {
    question: 'What does Iron-Nitride (Fe₁₆N₂) sacrifice compared to NdFeB magnets?',
    options: [
      'It costs significantly more',
      'It produces more toxic waste',
      'It delivers ~80% of the power efficiency of NdFeB',
      'It cannot be used in wind turbines',
    ],
    correct: 2,
    explanation: 'Iron-Nitride is a promising rare-earth-free alternative that eliminates toxic mining waste and costs ~30% less. The trade-off is roughly 80% power efficiency compared to NdFeB — a meaningful reduction that may be acceptable given the environmental and supply-chain benefits.',
  },
  {
    question: 'You ran the simulation and found that increasing magnet strength from 50% to 100% doubles the power but triples the cost. Is this a good investment?',
    options: [
      'Always yes — more power is always better',
      'It depends on the payback period relative to the turbine\'s 25-year lifespan',
      'No — you should always minimize cost',
      'Only if Iron-Nitride is unavailable',
    ],
    correct: 1,
    explanation: 'The answer depends on whether the extra power generates enough annual revenue to recover the tripled cost within the turbine\'s 25-year lifespan. "Always maximize power" and "always minimize cost" are both wrong — real engineering requires evaluating the payback period. If payback is 12 years on a 25-year turbine, you get 13 years of pure profit. If payback is 30 years, the investment never pays off. This is the core trade-off engineers face.',
  },
];

const Quiz = ({ onClose }) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Simulate loading the quiz questions
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const selectAnswer = (qIndex, oIndex) => {
    if (submitted) return;
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = oIndex;
      return next;
    });
  };

  const allAnswered = answers.every(a => a !== null);
  const score = answers.reduce((sum, a, i) => sum + (a === questions[i].correct ? 1 : 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-nobel-cream rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-200 sticky top-0 bg-nobel-cream rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Test Your Knowledge</h2>
            <p className="text-sm text-slate-500">6 questions on critical materials &amp; wind energy</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {isInitializing ? (
          <div className="py-20">
            <LoadingState message="Loading quiz data..." />
          </div>
        ) : (
          <>
            <div className="p-5 space-y-6">
              {questions.map((q, qi) => {
                const isCorrect = answers[qi] === q.correct;
                return (
                  <div key={qi} className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                    submitted
                      ? isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'
                      : answers[qi] !== null ? 'border-nobel-gold bg-amber-50/60' : 'border-stone-200 bg-white/70'
                  }`}>
                    <p className="text-sm font-bold text-slate-800 mb-3">
                      <span className="text-slate-500 mr-1">Q{qi + 1}.</span> {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = answers[qi] === oi;
                        const isRight = oi === q.correct;
                        let optClass = 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-1 cursor-pointer';
                        let animateState = "default";
                        
                        if (submitted) {
                          optClass = 'border-slate-200 bg-slate-50 opacity-60';
                          if (isRight) {
                            optClass = 'border-emerald-400 bg-emerald-100 font-semibold z-10';
                            animateState = "correct";
                          } else if (isSelected && !isRight) {
                            optClass = 'border-red-400 bg-red-100 line-through z-10';
                            animateState = "incorrect";
                          }
                        } else if (isSelected) {
                          optClass = 'border-nobel-gold bg-amber-50 ring-2 ring-[#C5A059]/50';
                          animateState = "selected";
                        }

                        return (
                          <motion.button
                            key={oi}
                            onClick={() => selectAnswer(qi, oi)}
                            disabled={submitted}
                            initial="default"
                            animate={animateState}
                            variants={{
                              default: { scale: 1, x: 0 },
                              selected: { scale: 1.01 },
                              correct: { scale: [1, 1.03, 1], transition: { duration: 0.4 } },
                              incorrect: { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } }
                            }}
                            whileHover={!submitted ? { scale: 1.01 } : {}}
                            whileTap={!submitted ? { scale: 0.98 } : {}}
                            className={`w-full text-left rounded-lg border-2 px-3 py-2 text-sm transition-colors duration-150 relative ${optClass}`}
                          >
                            <span className={`font-semibold mr-2 transition-colors ${submitted && isRight ? 'text-emerald-700' : submitted && isSelected ? 'text-red-700' : 'text-slate-500'}`}>
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            <span className={submitted && isRight ? 'text-emerald-900' : submitted && isSelected ? 'text-red-900' : ''}>{opt}</span>
                            {submitted && isRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">✓</span>}
                            {submitted && isSelected && !isRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">✗</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <div className={`mt-3 p-2.5 rounded-lg text-xs leading-snug ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        <strong>{isCorrect ? 'Correct!' : 'Incorrect.'}</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-stone-200 sticky bottom-0 bg-nobel-cream rounded-b-2xl">
              {!submitted ? (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!allAnswered}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    allAnswered
                      ? 'bg-nobel-gold hover:bg-[#b8904d] text-white shadow-lg'
                      : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {allAnswered ? 'Submit Answers' : `Answer all questions (${answers.filter(a => a !== null).length}/${questions.length})`}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800 mb-1">
                    {score}/{questions.length}
                    <span className="ml-2 text-lg">
                      {score === 6 ? '🏆 Perfect!' : score >= 4 ? '👏 Great job!' : score >= 2 ? '📚 Keep learning!' : '💡 Review the dashboard!'}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 mb-3">Scroll up to review explanations for each question.</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { setAnswers(Array(questions.length).fill(null)); setSubmitted(false); }}
                      className="bg-nobel-gold hover:bg-[#b8904d] text-white px-6 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-6 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
