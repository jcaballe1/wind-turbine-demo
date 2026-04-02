import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Zap, DollarSign, FlaskConical, Target, TrendingDown, Magnet, Wind, BookOpen, TrendingUp, Globe, Recycle, AlertTriangle, Clock, Leaf, Mountain, Factory, Car, Shield, Wrench, HelpCircle, Flag, Ban, Smartphone, RefreshCw } from 'lucide-react';
import { ResponsiveSankey } from '@nivo/sankey';
import VisualGenerator from './VisualGenerator';
import LoadingState from './LoadingState';

// ===== Contextual Advisor Rules =====
// Each rule fires once per "session entry" into that state.
// id must be unique; check() receives current sim state.
const ADVISOR_RULES = [
  {
    id: 'max-power-max-risk',
    icon: Zap,
    color: 'amber',
    title: 'Peak power, but at what cost?',
    body: 'You\'ve pushed magnet strength above 150%. Power output is near the maximum, but your CAPEX has shot up exponentially and toxic tailings are in the thousands of tons. This is the central dilemma of rare-earth dependency: maximum performance comes with maximum geopolitical and environmental risk.',
    check: (s) => s.magnetStrength >= 150 && !s.useIronNitride,
  },
  {
    id: 'ferrite-zone',
    icon: DollarSign,
    color: 'blue',
    title: 'Safe and cheap, but enough?',
    body: 'With magnet strength below 50% you\'re in ferrite territory: zero rare-earth dependency, zero toxic waste, very low cost. The problem? Power output is a fraction of what you\'d need for an offshore turbine. Ferrite works for small onshore generators, but it can\'t spin a multi-MW direct-drive rotor at 10 RPM.',
    check: (s) => s.magnetStrength <= 50 && !s.useIronNitride,
  },
  {
    id: 'iron-nitride-tradeoff',
    icon: FlaskConical,
    color: 'emerald',
    title: 'The emerging alternative',
    body: 'Iron-Nitride eliminates rare-earth dependency and toxic waste entirely. But notice the 20% power penalty. At commercial scale, that gap means fewer MW per turbine, which means more turbines needed to hit the same energy target. TRL matters: the technology has to improve before it can compete at sea.',
    check: (s) => s.useIronNitride,
  },
  {
    id: 'sweet-spot',
    icon: Target,
    color: 'violet',
    title: 'You\'ve found a viable balance!',
    body: 'With a payback period under 15 years and tailings below 800 tons, you\'re in a zone that many offshore project developers would consider commercially and environmentally acceptable.',
    check: (s) => s.paybackYears > 0 && s.paybackYears < 15 && s.toxicTailings < 800 && s.toxicTailings > 0 && !s.useIronNitride,
  },
  {
    id: 'uneconomical',
    icon: TrendingDown,
    color: 'red',
    title: 'Not viable, but why?',
    body: 'Your payback period is over 25 years, making this turbine design commercially unviable. Is it because wind is too low? Or magnet cost is too high? Try adjusting one variable at a time to isolate which factor is the dominant constraint.',
    check: (s) => (s.paybackYears > 25 || s.paybackYears === Infinity) && s.currentPower > 0,
  },
];

const Dashboard = ({ onBackToIntro, onOpenQuiz }) => {
  // ===== Core Simulation State =====
  const [windSpeed, setWindSpeed] = useState(50);
  const [magnetStrength, setMagnetStrength] = useState(100);
  const [powerData, setPowerData] = useState([]);
  const [currentPower, setCurrentPower] = useState(0);
  const [magnetCost, setMagnetCost] = useState(0);
  const [paybackYears, setPaybackYears] = useState(0);
  const [toxicTailings, setToxicTailings] = useState(0);
  const [useIronNitride, setUseIronNitride] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ===== UI State =====
  const [showReferenceMenu, setShowReferenceMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEuPolicy, setShowEuPolicy] = useState(false);
  const [showSupplyChain, setShowSupplyChain] = useState(false);
  const [showNdPrice, setShowNdPrice] = useState(false);
  const [showLifecycle, setShowLifecycle] = useState(false);

  // ===== Supply Chain & Lifecycle State =====
  const [supplyDisruption, setSupplyDisruption] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [lifecycleRecycling, setLifecycleRecycling] = useState(false);

  // ===== Contextual Advisor State =====
  const [activeHint, setActiveHint] = useState(null);   // current hint object to display
  const [dismissedHints, setDismissedHints] = useState(new Set()); // never re-fire dismissed
  const hintDebounceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Close reference dropdown on outside click
  useEffect(() => {
    if (!showReferenceMenu) return;
    const close = () => setShowReferenceMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showReferenceMenu]);

  // ===== Contextual Advisor Rules Engine =====
  // Debounced so rapid slider drags don't spam hints.
  useEffect(() => {
    if (isInitializing) return;
    clearTimeout(hintDebounceRef.current);
    hintDebounceRef.current = setTimeout(() => {
      const simState = { magnetStrength, windSpeed, useIronNitride, paybackYears, toxicTailings, currentPower };
      // Find the first matching rule that hasn't been dismissed and isn't already active
      const match = ADVISOR_RULES.find(
        r => !dismissedHints.has(r.id) && r.check(simState) && activeHint?.id !== r.id
      );
      if (match) setActiveHint(match);
      // If the current hint's condition is no longer true, clear it
      else if (activeHint && !activeHint.check(simState)) setActiveHint(null);
    }, 900);
    return () => clearTimeout(hintDebounceRef.current);
  }, [magnetStrength, windSpeed, useIronNitride, paybackYears, toxicTailings, currentPower, isInitializing]);

  const dismissHint = () => {
    if (!activeHint) return;
    setDismissedHints(prev => new Set([...prev, activeHint.id]));
    setActiveHint(null);
  };

  // ===== Neodymium Price History =====
  const ndPriceData = [
    { year: 2008, price: 30 }, { year: 2009, price: 35 }, { year: 2010, price: 80 },
    { year: 2011, price: 340 }, { year: 2012, price: 120 }, { year: 2013, price: 75 },
    { year: 2014, price: 58 }, { year: 2015, price: 50 }, { year: 2016, price: 45 },
    { year: 2017, price: 55 }, { year: 2018, price: 48 }, { year: 2019, price: 45 },
    { year: 2020, price: 55 }, { year: 2021, price: 95 }, { year: 2022, price: 110 },
    { year: 2023, price: 120 }, { year: 2024, price: 105 }, { year: 2025, price: 100 },
  ];

  // ===== Main Calculation Engine =====
  useEffect(() => {
    const BASE_TURBINE_COST = 4000000;
    const basePower = Math.pow(windSpeed / 100, 3) * 15;
    let power = basePower * (magnetStrength / 100);
    if (useIronNitride) power = power * 0.8;
    setCurrentPower(power);

    let magnetCostOnly;
    if (magnetStrength <= 50) {
      magnetCostOnly = 50000 + (magnetStrength / 50) * 50000;
    } else if (magnetStrength <= 100) {
      magnetCostOnly = 100000 + ((magnetStrength - 50) / 50) * 2400000;
    } else {
      const dysprosiumFactor = (magnetStrength - 100) / 100;
      magnetCostOnly = 2500000 + (Math.pow(dysprosiumFactor, 1.5) * 4500000);
    }
    if (useIronNitride) magnetCostOnly = magnetCostOnly * 0.7;

    const totalCost = BASE_TURBINE_COST + magnetCostOnly;
    setMagnetCost(totalCost);

    const annualRevenue = power * 8760 * 50;
    setPaybackYears(annualRevenue > 0 ? totalCost / annualRevenue : Infinity);

    let tailings;
    if (useIronNitride || magnetStrength <= 50) {
      tailings = 0;
    } else if (magnetStrength <= 100) {
      tailings = ((magnetStrength - 50) / 50) * 1200;
    } else {
      tailings = 1200 + ((magnetStrength - 100) / 100) * 2300;
    }
    setToxicTailings(tailings);

    setPowerData(prev => {
      const updated = [...prev, { power: Number(power.toFixed(2)), windSpeed: Number(windSpeed.toFixed(1)) }];
      const sliced = updated.length > 50 ? updated.slice(-50) : updated;
      return sliced.map((item, i) => ({ ...item, time: i }));
    });
  }, [windSpeed, magnetStrength, useIronNitride]);

  // ===== Helpers =====
  const formatMagnetCost = (totalCost) => {
    const BASE = 4000000;
    return {
      total: (totalCost / 1e6).toFixed(2),
      base: (BASE / 1e6).toFixed(2),
      magnet: ((totalCost - BASE) / 1e6).toFixed(2),
    };
  };

  const getActiveTechId = () => {
    if (useIronNitride) return 'iron-nitride';
    if (magnetStrength <= 50) return 'ferrite';
    if (magnetStrength <= 100) return 'ndfeb';
    return 'ndfeb-dy';
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-nobel-cream flex items-center justify-center">
        <LoadingState message="Initializing turbine simulation..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nobel-cream flex flex-col">

      {/* ===== HEADER ===== */}
      <header className="bg-nobel-cream border-b-2 border-stone-200 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-[1920px] mx-auto flex items-center gap-3">
          <button
            onClick={onBackToIntro}
            className="bg-nobel-dark hover:bg-stone-800 text-white px-4 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            ← <span className="hidden sm:inline">Back to Intro</span>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-xl font-bold font-serif text-slate-900 truncate">Wind Turbine Sandbox</h1>
            <p className="text-xs text-slate-600 hidden md:block">Move a slider and watch all four metrics shift at once. That tension is the point.</p>
          </div>

          {/* Reference Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowReferenceMenu(!showReferenceMenu); }}
              className="bg-nobel-dark hover:bg-stone-800 text-white px-3 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <BookOpen size={18} /> <span className="hidden sm:inline">Reference</span> <span className="text-xs opacity-70">▾</span>
            </button>
            {showReferenceMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-nobel-cream rounded-lg shadow-xl border border-stone-200 z-50 py-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setShowSupplyChain(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"><Globe size={16} className="text-nobel-dark" /> Supply Chain</button>
                <button onClick={() => { setShowNdPrice(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"><TrendingUp size={16} className="text-nobel-dark" /> Nd Price History</button>
                <button onClick={() => { setShowLifecycle(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"><Recycle size={16} className="text-nobel-dark" /> Lifecycle</button>
                <hr className="my-1 border-slate-100" />
                <button onClick={() => { setShowEuPolicy(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"><Flag size={16} className="text-nobel-dark" /> EU Policy</button>
                <button onClick={() => { setShowAbout(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"><HelpCircle size={16} className="text-nobel-dark" /> About</button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenQuiz}
            className="bg-nobel-gold hover:bg-[#b8904d] text-white px-4 py-2 rounded-lg shadow text-sm font-medium whitespace-nowrap transition-colors"
          >
            Take Quiz
          </button>
        </div>
      </header>

      {/* ===== CONTEXTUAL ADVISOR TOAST ===== */}
      <AnimatePresence>
        {activeHint && (() => {
          const colorMap = {
            amber:   { bg: 'bg-amber-50',   border: 'border-amber-300',  title: 'text-amber-900',  body: 'text-amber-800',  badge: 'bg-amber-100 text-amber-700',  btn: 'bg-amber-600 hover:bg-amber-700', dismiss: 'text-amber-500 hover:text-amber-700' },
            blue:    { bg: 'bg-blue-50',    border: 'border-blue-300',   title: 'text-blue-900',   body: 'text-blue-800',   badge: 'bg-blue-100 text-blue-700',    btn: 'bg-blue-600 hover:bg-blue-700',   dismiss: 'text-blue-500 hover:text-blue-700' },
            emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300',title: 'text-emerald-900',body: 'text-emerald-800',badge: 'bg-emerald-100 text-emerald-700',btn: 'bg-emerald-600 hover:bg-emerald-700',dismiss: 'text-emerald-500 hover:text-emerald-700' },
            violet:  { bg: 'bg-violet-50',  border: 'border-violet-300', title: 'text-violet-900', body: 'text-violet-800', badge: 'bg-violet-100 text-violet-700',  btn: 'bg-violet-600 hover:bg-violet-700', dismiss: 'text-violet-500 hover:text-violet-700' },
            red:     { bg: 'bg-red-50',     border: 'border-red-300',    title: 'text-red-900',    body: 'text-red-800',    badge: 'bg-red-100 text-red-700',      btn: 'bg-red-600 hover:bg-red-700',     dismiss: 'text-red-500 hover:text-red-700' },
          };
          const c = colorMap[activeHint.color] ?? colorMap.amber;
          return (
            <motion.div
              key={activeHint.id}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`${c.bg} ${c.border} border-2 px-4 py-3 flex items-start gap-3 shadow-md`}
              role="status"
              aria-live="polite"
            >
              {/* Icon badge */}
              <span className={`shrink-0 text-xl mt-0.5 w-9 h-9 flex items-center justify-center rounded-full ${c.badge}`}>
                <activeHint.icon size={20} />
              </span>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${c.title} leading-snug`}>{activeHint.title}</p>
                <p className={`text-xs ${c.body} leading-relaxed mt-0.5`}>{activeHint.body}</p>
              </div>
              {/* Actions */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  onClick={dismissHint}
                  aria-label="Dismiss hint"
                  className={`text-lg font-bold leading-none ${c.dismiss} transition-colors`}
                >
                  ×
                </button>
                <button
                  onClick={dismissHint}
                  className={`text-xs font-semibold text-white ${c.btn} px-3 py-1 rounded-lg transition-colors whitespace-nowrap`}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ===== TWO-COLUMN LAYOUT ===== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ===== LEFT: Control Panel (sticky) ===== */}
        <aside className="lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-stone-200 p-4 flex-shrink-0 lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:overflow-y-auto space-y-4">

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Controls</p>

          {/* Wind Speed */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-hard-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Wind size={16} className="text-nobel-gold" /> Wind Speed</label>
              <span className="text-xl font-bold text-blue-600">{windSpeed.toFixed(1)}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={windSpeed}
              onChange={e => setWindSpeed(Number(e.target.value))}
              aria-label={`Wind speed ${windSpeed.toFixed(1)}%`}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-blue mb-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Calm</span><span>Moderate</span><span>Strong</span>
            </div>
            <p className="text-xs text-slate-500 leading-tight">Wind power scales as the cube of speed. Double the wind and you get 8× the energy.</p>
          </div>

          {/* Magnet Strength */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-hard-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Magnet size={16} className="text-nobel-gold" /> Magnet Strength</label>
              <span className="text-xl font-bold text-red-600">{magnetStrength}%</span>
            </div>
            <input
              type="range" min="0" max="200" value={magnetStrength}
              onChange={e => setMagnetStrength(Number(e.target.value))}
              aria-label={`Magnet strength ${magnetStrength}%`}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-red mb-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mb-3">
              <span>Ferrite</span><span>NdFeB</span><span>NdFeB+Dy</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-slate-700 leading-tight">
                <strong className="text-amber-800">Notice:</strong> past 100% you’re adding dysprosium, rarer, pricier, more toxic. The cost curve is exponential by design.
              </p>
            </div>
          </div>

          {/* Iron-Nitride Toggle */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-hard-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FlaskConical size={16} className="text-nobel-gold" /> R&D: Iron-Nitride</p>
                <p className="text-xs text-slate-500 mt-0.5">No rare earths · Zero toxic waste · 80% of the power</p>
              </div>
              <button
                onClick={() => setUseIronNitride(!useIronNitride)}
                role="switch" aria-checked={useIronNitride}
                aria-label={useIronNitride ? 'Disable Iron-Nitride' : 'Enable Iron-Nitride'}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${useIronNitride ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${useIronNitride ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {useIronNitride && (
              <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs text-emerald-800"><strong>Active:</strong> Costs drop 30%, zero toxic waste, but you lose 20% of power output.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ===== RIGHT: Output Panel (scrollable) ===== */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">

          {/* ===== KPI ROW — all 4 metrics always visible ===== */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

            {/* Power */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 shadow-hard-sm" role="status" aria-live="polite">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5"><Zap size={14} className="text-nobel-gold" /> Power Output</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600">{currentPower.toFixed(2)}</span>
                <span className="text-sm text-slate-500">MW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">This drives the economics.</p>
            </div>

            {/* CAPEX */}
            <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 shadow-hard-sm" role="status" aria-live="polite">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5"><DollarSign size={14} className="text-nobel-gold" /> Total CAPEX</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-red-600">€{formatMagnetCost(magnetCost).total}M</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">€{formatMagnetCost(magnetCost).base}M base + €{formatMagnetCost(magnetCost).magnet}M magnet</p>
            </div>

            {/* Payback */}
            <div
              className={`rounded-xl border-2 p-4 shadow-hard-sm ${paybackYears > 25 ? 'bg-red-50 border-red-200' : paybackYears < 10 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}
              role="status" aria-live="polite"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5"><Clock size={14} className="text-nobel-gold" /> Payback Period</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${paybackYears > 25 ? 'text-red-600' : paybackYears < 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {paybackYears === Infinity || currentPower === 0 ? '∞' : paybackYears > 25 ? '> 25' : paybackYears.toFixed(1)}
                </span>
                {paybackYears !== Infinity && currentPower > 0 && <span className="text-sm text-slate-500">yrs</span>}
              </div>
              <p className={`text-xs font-semibold mt-1 ${paybackYears > 25 || paybackYears === Infinity || currentPower === 0 ? 'text-red-600' : paybackYears < 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {paybackYears > 25 || paybackYears === Infinity || currentPower === 0 ? 'Uneconomical' : paybackYears < 10 ? 'Excellent' : 'Viable'}
              </p>
            </div>

            {/* Tailings */}
            <div
              className={`rounded-xl border-2 p-4 shadow-hard-sm ${toxicTailings === 0 ? 'bg-emerald-50 border-emerald-200' : toxicTailings > 2000 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
              role="status" aria-live="polite"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5"><Leaf size={14} className="text-nobel-gold" /> Toxic Tailings</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${toxicTailings === 0 ? 'text-emerald-600' : toxicTailings > 2000 ? 'text-red-600' : 'text-amber-600'}`}>
                  {toxicTailings.toFixed(0)}
                </span>
                <span className="text-sm text-slate-500">tons</span>
              </div>
              <p className={`text-xs font-semibold mt-1 ${toxicTailings === 0 ? 'text-emerald-600' : toxicTailings > 2000 ? 'text-red-600' : 'text-amber-600'}`}>
                {toxicTailings === 0 ? 'Zero rare-earth waste ✓' : toxicTailings > 2000 ? 'Very high environmental risk' : 'Moderate risk'}
              </p>
            </div>
          </div>

          {/* ===== VISUAL + POWER CHART ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* VisualGenerator (Always Visible) */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-nobel-dark text-white px-4 py-2 text-sm font-semibold">
                The Invisible Gears: From Wind to Power
              </div>
              <div style={{ aspectRatio: '10/4' }}>
                <VisualGenerator windSpeed={windSpeed} magnetStrength={magnetStrength} currentPower={currentPower} />
              </div>
            </div>

            {/* Power Chart */}
            <div className="bg-white rounded-xl border border-stone-200 border-l-4 border-l-nobel-gold shadow-sm p-4" style={{ height: '325px' }}>
              <p className="text-sm font-semibold text-slate-700 mb-2">Power Generation History</p>
              <div style={{ width: '100%', height: 'calc(100% - 28px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={powerData} margin={{ top: 5, right: 15, bottom: 20, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }}
                      tickFormatter={v => `${v - powerData.length}s`} minTickGap={30}
                      label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: '#94a3b8' } }}
                    />
                    <YAxis
                      stroke="#94a3b8" tick={{ fontSize: 10 }}
                      label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#94a3b8', textAnchor: 'middle' } }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                      labelStyle={{ color: '#64748b' }}
                      labelFormatter={v => `Time: ${v}s`}
                      formatter={(v, n) => n === 'Power Output (MW)' ? [v, n] : [v + '%', n]}
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="power" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name="Power Output (MW)" activeDot={{ r: 5, strokeWidth: 0, fill: '#0ea5e9' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ===== REFERENCE SECTION: essential comparison table ===== */}
          <div className="space-y-3">

            {/* --- Magnet Technology Comparison (Always Visible) --- */}
            <div>
              <div className="bg-nobel-dark text-white p-3 rounded-t-lg shadow-sm">
                <div className="flex items-center gap-2"><Magnet size={18} /><span className="font-semibold text-sm">Magnet Technology Comparison</span></div>
              </div>
              <div className="bg-white rounded-b-lg shadow-sm p-5 border border-t-0 border-stone-200 overflow-x-auto">
                  <table className="w-full text-sm min-w-[580px]">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-3 text-slate-600 font-semibold">Technology</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-semibold">Strength</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-semibold">Cost (€/kg)</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-semibold">Toxic Waste</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-semibold">Supply Risk</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-semibold">TRL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'ferrite', name: 'Ferrite', strength: '●○○○○', cost: '~€2', waste: 'None', risk: 'None', trl: '9', tooltip: 'Cheap ceramic magnets. Too weak and heavy for modern multi-MW turbines.' },
                        { id: 'ndfeb', name: 'Standard NdFeB', strength: '●●●●○', cost: '~€80', waste: 'High (1,200 t)', risk: 'High', trl: '9', tooltip: '10× stronger than ferrite. Workhorse of onshore wind. High supply chain concentration in China (~90%).' },
                        { id: 'ndfeb-dy', name: 'NdFeB + Dysprosium', strength: '●●●●●', cost: '~€200', waste: 'Very High (3,500 t)', risk: 'Very High', trl: '9', tooltip: 'Dysprosium preserves strength at offshore temperatures. Most expensive and most environmentally damaging option.' },
                        { id: 'iron-nitride', name: 'Iron-Nitride (Fe₁₆N₂)', strength: '●●●○○', cost: '~€50', waste: 'None', risk: 'None', trl: '4-5', tooltip: 'Lab-stage alternative using iron and nitrogen. ~80% of NdFeB performance, zero rare-earth dependency. Scaling is the challenge.' },
                        { id: 'hts', name: 'HTS (Superconducting)', strength: '●●●●●+', cost: '~€500+', waste: 'Minimal', risk: 'Low', trl: '3-4', tooltip: 'Superconducting electromagnets replace permanent magnets entirely. Requires cryogenic cooling. Early demonstration stage.' },
                      ].map(tech => {
                        const isActive = getActiveTechId() === tech.id;
                        return (
                          <tr key={tech.id} className={`border-b border-slate-100 ${isActive ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : 'hover:bg-slate-50'}`}>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{tech.name}</span>
                                {isActive && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">Active</span>}
                                <span className="group relative inline-block">
                                  <span className="text-slate-500 text-xs cursor-help">ⓘ</span>
                                  <span className="invisible group-hover:visible absolute z-10 left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded py-2 px-3 shadow-lg">{tech.tooltip}</span>
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-3 px-3 font-mono text-xs tracking-wider">{tech.strength}</td>
                            <td className="text-center py-3 px-3">{tech.cost}</td>
                            <td className="text-center py-3 px-3">{tech.waste}</td>
                            <td className="text-center py-3 px-3">{tech.risk}</td>
                            <td className="text-center py-3 px-3 font-semibold">{tech.trl}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-500 italic text-center mt-3">TRL = Technology Readiness Level (1–9). TRL 9 = commercially proven. Costs are indicative and vary by market.</p>
                </div>
            </div>
          </div>

        </main>
      </div>

      {/* ===== Supply Chain Modal ===== */}
      {showSupplyChain && (() => {
        // Sankey data structure: Mining → Processing → End Use
        const getSankeyData = (isRestricted) => {
          // Base values for mining (total = 100)
          const mining = {
            china: 60, usa: 14, myanmar: 12, australia: 6, india: 3, others: 5
          };
          
          // Processing allocation (most goes to China)
          const processing = {
            china: 90, japan: 3, eu: 1, usa: 1
          };
          
          // End use distribution
          const endUse = {
            evMotors: 30, industrial: 25, wind: 15, electronics: 15, defence: 15
          };
          
          // Nodes
          const nodes = [
            // Mining nodes (slate gray)
            { id: 'Mining_China', color: '#64748b' },
            { id: 'Mining_USA', color: '#64748b' },
            { id: 'Mining_Myanmar', color: '#64748b' },
            { id: 'Mining_Australia', color: '#64748b' },
            { id: 'Mining_India', color: '#64748b' },
            { id: 'Mining_Others', color: '#64748b' },
            
            // Processing nodes (China = red for bottleneck, others = blue)
            { id: 'Processing_China', color: '#ef4444' },
            { id: 'Processing_Japan', color: '#3b82f6' },
            { id: 'Processing_EU', color: '#3b82f6' },
            { id: 'Processing_USA', color: '#3b82f6' },
            
            // End use nodes (various blues)
            { id: 'EndUse_EV_Motors', color: '#0ea5e9' },
            { id: 'EndUse_Industrial', color: '#06b6d4' },
            { id: 'EndUse_Wind', color: '#14b8a6' },
            { id: 'EndUse_Electronics', color: '#8b5cf6' },
            { id: 'EndUse_Defence', color: '#6366f1' },
          ];
          
          // Links: Mining → Processing
          const miningToProcessing = [
            { source: 'Mining_China', target: 'Processing_China', value: mining.china * 0.9 },
            { source: 'Mining_China', target: 'Processing_Japan', value: mining.china * 0.05 },
            { source: 'Mining_China', target: 'Processing_EU', value: mining.china * 0.03 },
            { source: 'Mining_China', target: 'Processing_USA', value: mining.china * 0.02 },
            
            { source: 'Mining_USA', target: 'Processing_USA', value: mining.usa * 0.5 },
            { source: 'Mining_USA', target: 'Processing_China', value: mining.usa * 0.5 },
            
            { source: 'Mining_Myanmar', target: 'Processing_China', value: mining.myanmar },
            
            { source: 'Mining_Australia', target: 'Processing_China', value: mining.australia * 0.7 },
            { source: 'Mining_Australia', target: 'Processing_Japan', value: mining.australia * 0.3 },
            
            { source: 'Mining_India', target: 'Processing_China', value: mining.india * 0.8 },
            { source: 'Mining_India', target: 'Processing_Japan', value: mining.india * 0.2 },
            
            { source: 'Mining_Others', target: 'Processing_China', value: mining.others * 0.6 },
            { source: 'Mining_Others', target: 'Processing_EU', value: mining.others * 0.2 },
            { source: 'Mining_Others', target: 'Processing_Japan', value: mining.others * 0.2 },
          ];
          
          // Links: Processing → End Use (affected by restriction)
          const restrictionMultiplier = isRestricted ? 0.2 : 1.0; // 80% reduction when restricted
          
          const processingToEndUse = [
            // China Processing → End Uses (REDUCED when restricted)
            { source: 'Processing_China', target: 'EndUse_EV_Motors', value: (endUse.evMotors * 0.9) * restrictionMultiplier },
            { source: 'Processing_China', target: 'EndUse_Industrial', value: (endUse.industrial * 0.9) * restrictionMultiplier },
            { source: 'Processing_China', target: 'EndUse_Wind', value: (endUse.wind * 0.9) * restrictionMultiplier },
            { source: 'Processing_China', target: 'EndUse_Electronics', value: (endUse.electronics * 0.9) * restrictionMultiplier },
            { source: 'Processing_China', target: 'EndUse_Defence', value: (endUse.defence * 0.9) * restrictionMultiplier },
            
            // Other processors → End Uses (pick up some slack, but not enough)
            { source: 'Processing_Japan', target: 'EndUse_EV_Motors', value: endUse.evMotors * 0.05 },
            { source: 'Processing_Japan', target: 'EndUse_Electronics', value: endUse.electronics * 0.05 },
            
            { source: 'Processing_EU', target: 'EndUse_Wind', value: endUse.wind * 0.03 },
            { source: 'Processing_EU', target: 'EndUse_Industrial', value: endUse.industrial * 0.03 },
            
            { source: 'Processing_USA', target: 'EndUse_Defence', value: endUse.defence * 0.05 },
            { source: 'Processing_USA', target: 'EndUse_EV_Motors', value: endUse.evMotors * 0.03 },
          ];
          
          return {
            nodes,
            links: [...miningToProcessing, ...processingToEndUse]
          };
        };
        
        const sankeyData = getSankeyData(supplyDisruption);
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowSupplyChain(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Globe size={22} className="text-nobel-gold" /> Rare-Earth Supply Chain Flow
                </h2>
                <button 
                  onClick={() => setShowSupplyChain(false)} 
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100" 
                  aria-label="Close"
                >×</button>
              </div>
              
              <div className="p-6">
                {/* Toggle Switch */}
                <div className="flex items-center justify-between mb-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Simulate: China Export Restriction</p>
                    <p className="text-xs text-slate-600">Visualize what happens when 90% of processing capacity restricts exports</p>
                  </div>
                  <button
                    onClick={() => setSupplyDisruption(!supplyDisruption)}
                    role="switch"
                    aria-checked={supplyDisruption}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${supplyDisruption ? 'bg-red-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${supplyDisruption ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {supplyDisruption && (
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-600" /> Supply Disruption Active
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-red-100 rounded p-2 text-center">
                        <p className="text-red-900 font-bold text-lg">3–10×</p>
                        <p className="text-red-700">Price spike</p>
                      </div>
                      <div className="bg-red-100 rounded p-2 text-center">
                        <p className="text-red-900 font-bold text-lg">12–24 mo</p>
                        <p className="text-red-700">Lead time delay</p>
                      </div>
                      <div className="bg-red-100 rounded p-2 text-center">
                        <p className="text-red-900 font-bold text-lg">80%</p>
                        <p className="text-red-700">Supply reduction</p>
                      </div>
                    </div>
                    <p className="text-xs text-red-700 mt-2 italic">
                      Historical precedent: 2010–2011 China quota crisis caused a 10× price spike and severe supply shortages.
                    </p>
                  </div>
                )}
                
                {/* Sankey Diagram */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4" style={{ height: '500px' }}>
                  <ResponsiveSankey
                    data={sankeyData}
                    margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
                    align="justify"
                    colors={node => node.color}
                    nodeOpacity={1}
                    nodeHoverOpacity={1}
                    nodeThickness={18}
                    nodeSpacing={24}
                    nodeBorderWidth={0}
                    nodeBorderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.8]]
                    }}
                    nodeBorderRadius={3}
                    linkOpacity={0.5}
                    linkHoverOpacity={0.8}
                    linkContract={3}
                    enableLinkGradient={true}
                    labelPosition="outside"
                    labelOrientation="horizontal"
                    labelPadding={16}
                    labelTextColor="#1e293b"
                    label={node => {
                      // Clean up labels for display
                      const label = node.id.replace('Mining_', '').replace('Processing_', '').replace('EndUse_', '').replace(/_/g, ' ');
                      return label;
                    }}
                  />
                </div>
                
                {/* Educational Note */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-blue-800">Flow interpretation:</strong> The diagram shows the volume of rare-earth materials flowing from mining operations (left) through processing facilities (center) to end-use applications (right). The width of each connection represents the relative volume. Notice how China Processing acts as the dominant bottleneck. When restricted, downstream industries face severe shortages.
                  </p>
                </div>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-700">~90%</p>
                    <p className="text-xs text-slate-600 mt-1">Global Processing Bottleneck</p>
                    <p className="text-xs text-slate-500 mt-1 italic">China controls nearly all refining capacity</p>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 text-center">
                    <p className="text-2xl font-bold text-amber-700">&gt;98%</p>
                    <p className="text-xs text-slate-600 mt-1">EU Import Dependency</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Europe has virtually no domestic processing</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-700">&lt;1%</p>
                    <p className="text-xs text-slate-600 mt-1">Global Recycling Rate</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Circular economy barely exists for rare earths</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 mt-4 text-center italic">
                  A single policy decision can cascade through the entire global supply chain, impacting wind energy deployment, EV manufacturing, and defense systems.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Nd Price History Modal ===== */}
      {showNdPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowNdPrice(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={22} className="text-nobel-gold" /> Neodymium Price History (2008–2025)</h2>
              <button onClick={() => setShowNdPrice(false)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100" aria-label="Close">×</button>
            </div>
            <div className="p-6">
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ndPriceData} margin={{ top: 15, right: 25, bottom: 25, left: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[2008, 2025]} type="number" tickCount={10} label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#94a3b8' } }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 400]} label={{ value: 'USD/kg', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8', textAnchor: 'middle' } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} labelFormatter={v => `Year: ${v}`} formatter={v => [`$${v}/kg`, 'Nd₂O₃ Price']} />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="price" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#e11d48', strokeWidth: 0 }} name="Nd₂O₃ Price (USD/kg)" />
                    <ReferenceLine x={2010} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: '2010: China quotas → 10× spike', position: 'top', fill: '#8b5cf6', fontSize: 10 }} />
                    <ReferenceLine x={2015} stroke="#0ea5e9" strokeDasharray="4 4" label={{ value: '2015: New mines open', position: 'insideTopRight', fill: '#0ea5e9', fontSize: 10 }} />
                    <ReferenceLine x={2020} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '2020+: EV & wind demand surge', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-600 mt-4 text-center italic">Price volatility is the hidden risk of rare-earth dependency.</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Lifecycle & Recycling Modal ===== */}
      {showLifecycle && (() => {
        const ndfebPerTurbine = 600;
        const recoveryRate = 0.9;
        const gen1Virgin = ndfebPerTurbine;
        const gen2Virgin = lifecycleRecycling ? ndfebPerTurbine * (1 - recoveryRate) : ndfebPerTurbine;
        const gen3Virgin = lifecycleRecycling ? ndfebPerTurbine * (1 - recoveryRate) : ndfebPerTurbine;
        const totalVirgin = gen1Virgin + gen2Virgin + gen3Virgin;
        const totalBaseline = ndfebPerTurbine * 3;
        const totalSaved = totalBaseline - totalVirgin;
        const stages = [
          { id: 1, label: 'Mining &\nRefining', icon: '⛏️', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          { id: 2, label: 'Magnet\nManufacturing', icon: '🏭', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          { id: 3, label: 'Turbine\nOperation', icon: '🌬️', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
          { id: 4, label: 'Decom-\nmissioning', icon: '🔧', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { id: 5, label: 'End of\nLife', icon: lifecycleRecycling ? '♻️' : '🗑️', color: lifecycleRecycling ? '#059669' : '#64748b', bg: lifecycleRecycling ? '#ecfdf5' : '#f8fafc', border: lifecycleRecycling ? '#a7f3d0' : '#e2e8f0' },
        ];
        return (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowLifecycle(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Recycle size={22} className="text-nobel-gold" /> Turbine Lifecycle &amp; Recycling Potential</h2>
                <button onClick={() => setShowLifecycle(false)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100" aria-label="Close">×</button>
              </div>
              <div className="p-6">
                <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 mb-4">
                  <svg viewBox="0 0 920 200" className="w-full h-auto" style={{ maxHeight: '180px' }}>
                    <defs>
                      <marker id="lc-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8" /></marker>
                      <marker id="lc-arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#059669" /></marker>
                    </defs>
                    {stages.map((s, i) => {
                      const x = 20 + i * 180; const y = 30; const w = 140; const h = 100;
                      return (
                        <g key={s.id}>
                          <rect x={x} y={y} width={w} height={h} rx={12} fill={s.bg} stroke={s.border} strokeWidth={2} />
                          <text x={x + w / 2} y={y + 30} textAnchor="middle" fontSize="22">{s.icon}</text>
                          {s.label.split('\n').map((line, li) => (
                            <text key={li} x={x + w / 2} y={y + 52 + li * 14} textAnchor="middle" fontSize="11" fontWeight="700" fill={s.color}>{line}</text>
                          ))}
                          <text x={x + w / 2} y={y + h + 16} textAnchor="middle" fontSize="9" fill="#64748b">
                            {s.id === 3 ? '20–25 yrs' : s.id === 1 ? '~2,000t waste/t ore' : s.id === 2 ? '600 kg NdFeB' : s.id === 4 ? 'Year 25' : lifecycleRecycling ? '90% recovered' : 'Materials lost'}
                          </text>
                          {i < 4 && <line x1={x + w + 4} y1={y + h / 2} x2={x + w + 36} y2={y + h / 2} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#lc-arrow)" />}
                        </g>
                      );
                    })}
                    {lifecycleRecycling && (
                      <g>
                        <path d="M 810,135 L 810,180 Q 810,190 800,190 L 230,190 Q 220,190 220,180 L 220,135" fill="none" stroke="#059669" strokeWidth={2.5} strokeDasharray="6 3" markerEnd="url(#lc-arrow-green)" />
                        <rect x={440} y={179} width={120} height={20} rx={4} fill="#059669" />
                        <text x={500} y={193} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">90% NdFeB recycle</text>
                      </g>
                    )}
                  </svg>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Enable Recycling at End-of-Life</p>
                    <p className="text-xs text-slate-600">Hydrogen decrepitation recovers ~90% of NdFeB material</p>
                  </div>
                  <button
                    onClick={() => setLifecycleRecycling(!lifecycleRecycling)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${lifecycleRecycling ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${lifecycleRecycling ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[1, 2, 3].map(gen => {
                    const virgin = gen === 1 ? gen1Virgin : gen === 2 ? gen2Virgin : gen3Virgin;
                    const recycled = ndfebPerTurbine - virgin;
                    return (
                      <div key={gen} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Generation {gen}</p>
                        <p className="text-xs text-slate-500 mb-2">Years {(gen - 1) * 25}–{gen * 25}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs"><span className="text-red-700">⛏️ Virgin</span><span className="font-bold">{virgin.toFixed(0)} kg</span></div>
                          {lifecycleRecycling && gen > 1 && <div className="flex items-center justify-between text-xs"><span className="text-emerald-700">♻️ Recycled</span><span className="font-bold text-emerald-700">{recycled.toFixed(0)} kg</span></div>}
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1 flex">
                            <div className="bg-red-400 h-full" style={{ width: `${(virgin / ndfebPerTurbine) * 100}%` }} />
                            {recycled > 0 && <div className="bg-emerald-400 h-full" style={{ width: `${(recycled / ndfebPerTurbine) * 100}%` }} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`rounded-lg p-4 border-2 text-center transition-all ${lifecycleRecycling ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Cumulative NdFeB — 3 generations (60 years)</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <div><p className="text-2xl font-black text-red-600">{totalVirgin.toFixed(0)} kg</p><p className="text-xs text-slate-600">Virgin material needed</p></div>
                    {lifecycleRecycling && (
                      <>
                        <div className="hidden sm:block text-slate-300 text-xl">|</div>
                        <div><p className="text-2xl font-black text-emerald-600">{totalSaved.toFixed(0)} kg</p><p className="text-xs text-slate-600">Saved vs. no recycling</p></div>
                        <div className="hidden sm:block text-slate-300 text-xl">|</div>
                        <div><p className="text-2xl font-black text-emerald-600">{((totalSaved / totalBaseline) * 100).toFixed(0)}%</p><p className="text-xs text-slate-600">Reduction in mining</p></div>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center italic">Current global rare-earth recycling rate is &lt;1%. Scaling recycling is essential for the energy transition.</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== About Modal ===== */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">About This Application</h2>
              <button onClick={() => setShowAbout(false)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100" aria-label="Close">×</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Purpose</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This interactive educational tool was developed to help students understand the complex trade-offs involved in wind turbine generator design, particularly the challenges surrounding rare-earth permanent magnets in direct-drive offshore wind turbines.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">
                  By manipulating design parameters in real-time, learners can explore how technical decisions create cascading effects across economic, environmental, and geopolitical dimensions, revealing why sustainable energy transitions require more than just technological innovation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Educational Context</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This application was created for Courses at HZ University of Applied Sciences, addressing learning objectives in renewable energy systems, critical materials supply chains, and sustainability assessment.
                </p>
                <div className="flex justify-center mt-4">
                  <img src="images/hz_logo.svg" alt="HZ University of Applied Sciences" className="h-16 opacity-80" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Development Team</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Andres Caballero, Researcher at the Critical Materials group of the HZ University of Applied Sciences.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-base font-bold text-slate-800 mb-2">Academic Foundation</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  The simulation parameters and relationships are based on industry data, peer-reviewed literature, and policy documents including the EU Critical Raw Materials Act (2024). While simplified for educational purposes, the core trade-offs reflect real engineering and policy challenges in the offshore wind sector.
                </p>
              </div>

              <div className="text-center pt-3">
                <p className="text-xs text-slate-500 italic">
                  Version 1.0 | Last Updated: April 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EU Policy Modal ===== */}
      {showEuPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowEuPolicy(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-l-4 border-[#003399]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3"><span className="text-2xl">🇪🇺</span><h2 className="text-xl font-bold text-[#003399]">EU Policy Context: Critical Raw Materials Act</h2></div>
              <button onClick={() => setShowEuPolicy(false)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100" aria-label="Close">×</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">In March 2024 the EU adopted the <strong className="text-slate-800">Critical Raw Materials Act</strong> to reduce dependency on single-country imports and secure supply chains for the green and digital transitions.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center"><p className="text-2xl font-bold text-[#003399]">10%</p><p className="text-xs text-slate-600 mt-1">Domestic extraction by 2030</p></div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center"><p className="text-2xl font-bold text-[#003399]">40%</p><p className="text-xs text-slate-600 mt-1">Domestic processing by 2030</p></div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center"><p className="text-2xl font-bold text-[#003399]">25%</p><p className="text-xs text-slate-600 mt-1">From recycling by 2030</p></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                <p className="text-slate-700"><strong className="text-slate-800">Strategic stockpiling:</strong> Member states must map supply-chain risks and coordinate strategic reserves of critical raw materials.</p>
                <p className="text-slate-700"><strong className="text-slate-800">Current gap:</strong> The EU currently imports <strong>~98%</strong> of its rare-earth supply, predominantly from China, far above the Act's diversification targets.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
