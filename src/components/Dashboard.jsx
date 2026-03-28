import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import VisualGenerator from './VisualGenerator';
import LoadingState from './LoadingState';

// ===== Contextual Advisor Rules =====
// Each rule fires once per "session entry" into that state.
// id must be unique; check() receives current sim state.
const ADVISOR_RULES = [
  {
    id: 'max-power-max-risk',
    icon: '⚡',
    color: 'amber',
    title: 'Peak power — but at what cost?',
    body: 'You\'ve pushed magnet strength above 150%. Power output is near the maximum, but your CAPEX has shot up exponentially and toxic tailings are in the thousands of tons. This is the central dilemma of rare-earth dependency: maximum performance comes with maximum geopolitical and environmental risk.',
    check: (s) => s.magnetStrength >= 150 && !s.useIronNitride,
  },
  {
    id: 'ferrite-zone',
    icon: '💸',
    color: 'blue',
    title: 'Safe and cheap — but enough?',
    body: 'With magnet strength below 50% you\'re in ferrite territory: zero rare-earth dependency, zero toxic waste, very low cost. The catch? Power output is a fraction of what you\'d need for an offshore turbine. Ferrite works for small onshore generators, but it can\'t spin a multi-MW direct-drive rotor at 10 RPM.',
    check: (s) => s.magnetStrength <= 50 && !s.useIronNitride,
  },
  {
    id: 'iron-nitride-tradeoff',
    icon: '🔬',
    color: 'emerald',
    title: 'The researcher\'s gamble',
    body: 'Iron-Nitride eliminates rare-earth dependency and toxic waste entirely — a remarkable result. But notice the 20% power penalty. At commercial scale, that gap means fewer MW per turbine, which means more turbines needed to hit the same energy target. This is why TRL matters: the technology has to improve before it can compete at sea.',
    check: (s) => s.useIronNitride,
  },
  {
    id: 'sweet-spot',
    icon: '🎯',
    color: 'violet',
    title: 'You\'ve found a viable balance!',
    body: 'With a payback period under 15 years and tailings below 800 tons, you\'re in a zone that many offshore project developers would consider commercially and environmentally acceptable. Notice what you traded off to get here — this balance point is exactly what engineers and policymakers argue about.',
    check: (s) => s.paybackYears > 0 && s.paybackYears < 15 && s.toxicTailings < 800 && s.toxicTailings > 0 && !s.useIronNitride,
  },
  {
    id: 'uneconomical',
    icon: '📉',
    color: 'red',
    title: 'Not viable — but why?',
    body: 'Your payback period is over 25 years, making this turbine design commercially unviable. Is it because wind is too low? Or magnet cost is too high? Try adjusting one variable at a time to isolate which factor is the dominant constraint. That\'s what engineering trade-off analysis is all about.',
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
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [showReferenceMenu, setShowReferenceMenu] = useState(false);
  const [svgMinimized, setSvgMinimized] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEuPolicy, setShowEuPolicy] = useState(false);
  const [snapshots, setSnapshots] = useState([]);

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

  const togglePanel = (panel) => setExpandedPanel(prev => prev === panel ? null : panel);

  const saveSnapshot = () => {
    if (snapshots.length >= 3) return;
    setSnapshots(prev => [...prev, {
      id: Date.now(),
      windSpeed: Number(windSpeed.toFixed(1)),
      magnetStrength,
      ironNitride: useIronNitride,
      power: Number(currentPower.toFixed(2)),
      capex: magnetCost,
      payback: Number(paybackYears.toFixed(1)),
      tailings: Number(toxicTailings.toFixed(0)),
    }]);
  };

  const removeSnapshot = (id) => setSnapshots(prev => prev.filter(s => s.id !== id));

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <LoadingState message="Initializing turbine simulation..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b-4 border-slate-900 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center gap-3">
          <button
            onClick={onBackToIntro}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            ← <span className="hidden sm:inline">Back to Intro</span>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-xl font-bold font-serif text-slate-900 truncate">Wind Turbine Sandbox</h1>
            <p className="text-xs text-slate-600 hidden md:block">Move a slider — watch all four metrics shift at once. That tension is the point.</p>
          </div>

          {/* Reference Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowReferenceMenu(!showReferenceMenu); }}
              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              📚 <span className="hidden sm:inline">Reference</span> <span className="text-xs opacity-70">▾</span>
            </button>
            {showReferenceMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => { togglePanel('magnets'); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">🧲 Compare Magnets</button>
                <button onClick={() => { togglePanel('price'); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">📈 Nd Price History</button>
                <button onClick={() => { togglePanel('supply'); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">🌍 Supply Chain</button>
                <button onClick={() => { togglePanel('lifecycle'); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">♻️ Lifecycle</button>
                <hr className="my-1 border-slate-100" />
                <button onClick={() => { setShowEuPolicy(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">🇪🇺 EU Policy</button>
                <button onClick={() => { setShowAbout(true); setShowReferenceMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">❓ About</button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenQuiz}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium whitespace-nowrap transition-colors"
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
                {activeHint.icon}
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
        <aside className="lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex-shrink-0 lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:overflow-y-auto space-y-4">

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Controls</p>

          {/* Wind Speed */}
          <div className="bg-amber-50 rounded-xl border-2 border-slate-200 shadow-hard-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">💨 Wind Speed</label>
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
            <p className="text-xs text-slate-500 leading-tight">Wind power scales as the cube of speed — double the wind and you get 8× the energy.</p>
          </div>

          {/* Magnet Strength */}
          <div className="bg-amber-50 rounded-xl border-2 border-slate-200 shadow-hard-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">🧲 Magnet Strength</label>
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
                <strong className="text-amber-800">Notice:</strong> past 100% you’re adding dysprosium — rarer, pricier, more toxic. The cost curve is exponential by design.
              </p>
            </div>
          </div>

          {/* Iron-Nitride Toggle */}
          <div className="bg-amber-50 rounded-xl border-2 border-slate-200 shadow-hard-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">⚗️ R&D: Iron-Nitride</p>
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
                <p className="text-xs text-emerald-800"><strong>Active:</strong> Costs drop 30%, zero toxic waste — but you lose 20% of power output.</p>
              </div>
            )}
          </div>

          {/* Key insight */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-blue-800">🧲 Key physics:</strong> Even at the same wind speed, a stronger magnet multiplies electricity output directly. This is why rare-earth magnets are non-negotiable for slow-turning offshore turbines.
            </p>
          </div>

          {/* Save Snapshot */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">Your Design Snapshots</p>
              <span className="text-xs text-slate-500">{snapshots.length}/3</span>
            </div>
            <button
              onClick={saveSnapshot}
              disabled={snapshots.length >= 3}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              📷 Save Current Config
            </button>
            <p className="text-xs text-slate-500 mt-1.5 text-center">Save up to 3 — then lay them side by side.</p>
          </div>
        </aside>

        {/* ===== RIGHT: Output Panel (scrollable) ===== */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">

          {/* ===== KPI ROW — all 4 metrics always visible ===== */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

            {/* Power */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 shadow-hard-sm" role="status" aria-live="polite">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">⚡ Power Output</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600">{currentPower.toFixed(2)}</span>
                <span className="text-sm text-slate-500">MW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">This drives the economics.</p>
            </div>

            {/* CAPEX */}
            <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 shadow-hard-sm" role="status" aria-live="polite">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">💰 Total CAPEX</p>
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">⏱️ Payback Period</p>
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">🌿 Toxic Tailings</p>
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

            {/* VisualGenerator */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {svgMinimized ? (
                <button onClick={() => setSvgMinimized(false)} className="w-full h-10 flex items-center justify-between px-4 hover:bg-slate-50 text-sm text-slate-600 transition-colors">
                  <span>Wind → Magnets → Electricity → Factory</span>
                  <span className="text-xs text-slate-500">▼ Expand</span>
                </button>
              ) : (
                <div className="relative">
                  <button onClick={() => setSvgMinimized(true)} className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-slate-600 w-7 h-7 rounded flex items-center justify-center text-xs shadow" title="Minimize">▲</button>
                  <div style={{ aspectRatio: '10/4' }}>
                    <VisualGenerator windSpeed={windSpeed} magnetStrength={magnetStrength} currentPower={currentPower} />
                  </div>
                </div>
              )}
            </div>

            {/* Power Chart */}
            <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm p-4" style={{ height: '220px' }}>
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

          {/* ===== ACCORDION SECTIONS: deep educational content ===== */}
          <div className="space-y-3">

            {/* --- Magnet Technology Comparison --- */}
            <div>
              <button
                onClick={() => togglePanel('magnets')}
                className={`w-full flex items-center justify-between p-3 rounded-lg shadow-sm transition-all ${expandedPanel === 'magnets' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-800'}`}
              >
                <div className="flex items-center gap-2"><span>🧲</span><span className="font-semibold text-sm">Magnet Technology Comparison</span></div>
                <span className={`transition-transform duration-200 text-sm ${expandedPanel === 'magnets' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {expandedPanel === 'magnets' && (
                <div className="bg-white rounded-b-lg shadow-sm p-5 -mt-1 border-t border-slate-100 overflow-x-auto">
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
              )}
            </div>

            {/* --- Supply Chain --- */}
            <div>
              <button
                onClick={() => togglePanel('supply')}
                className={`w-full flex items-center justify-between p-3 rounded-lg shadow-sm transition-all ${expandedPanel === 'supply' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-800'}`}
              >
                <div className="flex items-center gap-2"><span>🌍</span><span className="font-semibold text-sm">Rare-Earth Supply Chain</span></div>
                <span className={`transition-transform duration-200 text-sm ${expandedPanel === 'supply' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {expandedPanel === 'supply' && (() => {
                const miners = [
                  { id: 'china-m', name: 'China', pct: 60, flag: '🇨🇳', risk: 'high' },
                  { id: 'usa', name: 'USA', pct: 14, flag: '🇺🇸', risk: 'low' },
                  { id: 'myanmar', name: 'Myanmar', pct: 12, flag: '🇲🇲', risk: 'high' },
                  { id: 'australia', name: 'Australia', pct: 6, flag: '🇦🇺', risk: 'low' },
                  { id: 'india', name: 'India', pct: 3, flag: '🇮🇳', risk: 'med' },
                  { id: 'other', name: 'Others', pct: 5, flag: '🌐', risk: 'med' },
                ];
                const riskColor = { high: 'border-red-400 bg-red-50', med: 'border-amber-300 bg-amber-50', low: 'border-blue-300 bg-blue-50' };
                const riskBarColor = { high: 'bg-red-500', med: 'bg-amber-500', low: 'bg-blue-500' };
                return (
                  <div className="bg-white rounded-b-lg shadow-sm p-5 -mt-1 border-t border-slate-100">
                    {/* Disruption Toggle */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Simulate: China Export Restriction</p>
                        <p className="text-xs text-slate-600">What happens when 90% of processing capacity is restricted?</p>
                      </div>
                      <button
                        onClick={() => setSupplyDisruption(!supplyDisruption)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${supplyDisruption ? 'bg-red-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${supplyDisruption ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {supplyDisruption && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                        <p className="text-sm font-bold text-red-800 mb-2">⚠️ Supply Disruption Active</p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="bg-red-100 rounded p-2 text-center"><p className="text-red-900 font-bold text-lg">3–10×</p><p className="text-red-700">Price spike</p></div>
                          <div className="bg-red-100 rounded p-2 text-center"><p className="text-red-900 font-bold text-lg">12–24 mo</p><p className="text-red-700">Lead time delay</p></div>
                          <div className="bg-red-100 rounded p-2 text-center"><p className="text-red-900 font-bold text-lg">~35%</p><p className="text-red-700">Available supply</p></div>
                        </div>
                        <p className="text-xs text-red-700 mt-2">Historical precedent: 2010–2011 China quota crisis caused a 10× price spike.</p>
                      </div>
                    )}
                    {/* 3-column flow */}
                    <div className="overflow-x-auto pb-4">
                      <div className="min-w-[600px] grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-start">
                        <div>
                          <div className="text-center mb-3"><span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">⛏️ Mining</span></div>
                          <div className="space-y-2">
                            {miners.map(m => (
                              <div
                                key={m.id}
                                className={`relative rounded-lg border-2 p-2.5 transition-all duration-300 ${riskColor[m.risk]} ${supplyDisruption && m.id === 'china-m' ? 'opacity-40' : ''}`}
                                onMouseEnter={() => setHoveredCountry(m.id)}
                                onMouseLeave={() => setHoveredCountry(null)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2"><span className="text-lg">{m.flag}</span><span className="text-sm font-semibold text-slate-800">{m.name}</span></div>
                                  <span className="text-sm font-bold text-slate-700">{m.pct}%</span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${riskBarColor[m.risk]}`} style={{ width: `${m.pct}%` }} />
                                </div>
                                {supplyDisruption && m.id === 'china-m' && (
                                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-red-700 text-2xl font-bold">✕</span></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-center px-2 self-center">
                          <svg width="40" height="24" viewBox="0 0 40 24">
                            <defs><marker id="fa" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill={supplyDisruption ? '#dc2626' : '#64748b'} /></marker></defs>
                            <line x1="0" y1="12" x2="30" y2="12" stroke={supplyDisruption ? '#dc2626' : '#94a3b8'} strokeWidth="2" strokeDasharray={supplyDisruption ? '4 3' : 'none'} markerEnd="url(#fa)" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-center mb-3"><span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">🏭 Processing</span></div>
                          <div className={`rounded-xl border-2 p-4 text-center transition-all ${supplyDisruption ? 'border-red-500 bg-red-50' : 'border-red-300 bg-red-50'}`}>
                            <span className="text-3xl">🇨🇳</span>
                            <p className="text-sm font-bold text-slate-800 mt-1">China</p>
                            <p className={`text-3xl font-black mt-1 ${supplyDisruption ? 'text-red-700' : 'text-red-600'}`}>~90%</p>
                            <p className="text-xs text-slate-600 mt-0.5">of global processing</p>
                            {supplyDisruption && <div className="mt-2 p-1.5 bg-red-100 border border-red-300 rounded text-xs text-red-800 font-semibold">🚫 Exports restricted</div>}
                          </div>
                          <div className="mt-2 space-y-1.5">
                            {[{ name: 'EU (Solvay)', pct: 1 }, { name: 'Japan', pct: 3 }, { name: 'USA (MP Materials)', pct: 1 }].map(p => (
                              <div key={p.name} className="rounded-lg border border-blue-200 bg-blue-50 p-2 flex items-center justify-between">
                                <span className="text-xs text-slate-700">{p.name}</span>
                                <span className="text-xs font-bold text-blue-700">{p.pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-center px-2 self-center">
                          <svg width="40" height="24" viewBox="0 0 40 24">
                            <line x1="0" y1="12" x2="30" y2="12" stroke={supplyDisruption ? '#dc2626' : '#94a3b8'} strokeWidth="2" strokeDasharray={supplyDisruption ? '4 3' : 'none'} markerEnd="url(#fa)" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-center mb-3"><span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">🔧 End Use</span></div>
                          <div className="space-y-2">
                            {[
                              { icon: '🌬️', label: 'Wind Turbines', detail: '600 kg NdFeB per turbine', share: '15%' },
                              { icon: '🚗', label: 'EV Motors', detail: '1–2 kg per vehicle', share: '30%' },
                              { icon: '🏭', label: 'Industrial Motors', detail: 'Robotics, HVAC, appliances', share: '25%' },
                              { icon: '📱', label: 'Electronics', detail: 'Speakers, sensors, HDDs', share: '15%' },
                              { icon: '🛡️', label: 'Defence', detail: 'Guided systems, aircraft', share: '15%' },
                            ].map(u => (
                              <div key={u.label} className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-3">
                                <span className="text-xl shrink-0">{u.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-800">{u.label}</span><span className="text-xs font-bold text-slate-600">{u.share}</span></div>
                                  <p className="text-xs text-slate-500 truncate">{u.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-5">
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center"><p className="text-xl font-bold text-red-700">~90%</p><p className="text-xs text-slate-600">Processing by China</p></div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center"><p className="text-xl font-bold text-amber-700">~98%</p><p className="text-xs text-slate-600">EU import dependency</p></div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center"><p className="text-xl font-bold text-blue-700">&lt;1%</p><p className="text-xs text-slate-600">Global recycling rate</p></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-center italic">A single policy change can disrupt global wind energy supply chains.</p>
                  </div>
                );
              })()}
            </div>

            {/* --- Nd Price History --- */}
            <div>
              <button
                onClick={() => togglePanel('price')}
                className={`w-full flex items-center justify-between p-3 rounded-lg shadow-sm transition-all ${expandedPanel === 'price' ? 'bg-red-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-800'}`}
              >
                <div className="flex items-center gap-2"><span>📈</span><span className="font-semibold text-sm">Neodymium Price History (2008–2025)</span></div>
                <span className={`transition-transform duration-200 text-sm ${expandedPanel === 'price' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {expandedPanel === 'price' && (
                <div className="bg-white rounded-b-lg shadow-sm p-5 -mt-1 border-t border-slate-100">
                  <div style={{ width: '100%', height: '320px' }}>
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
                  <p className="text-sm text-slate-600 mt-3 text-center italic">Price volatility is the hidden risk of rare-earth dependency.</p>
                </div>
              )}
            </div>

            {/* --- Lifecycle & Recycling --- */}
            <div>
              <button
                onClick={() => togglePanel('lifecycle')}
                className={`w-full flex items-center justify-between p-3 rounded-lg shadow-sm transition-all ${expandedPanel === 'lifecycle' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-800'}`}
              >
                <div className="flex items-center gap-2"><span>♻️</span><span className="font-semibold text-sm">Turbine Lifecycle &amp; Recycling Potential</span></div>
                <span className={`transition-transform duration-200 text-sm ${expandedPanel === 'lifecycle' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {expandedPanel === 'lifecycle' && (() => {
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
                  <div className="bg-white rounded-b-lg shadow-sm p-5 -mt-1 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
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
                );
              })()}
            </div>
          </div>

          {/* ===== SNAPSHOT COMPARISON ===== */}
          {snapshots.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Configuration Snapshots</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{snapshots.length}/3</span>
              </div>
              {snapshots.length >= 2 && (
                <p className="text-xs text-blue-600 font-medium mb-3 bg-blue-50 p-2 rounded-md">
                  Look at the differences — which config would you defend to a project board, and why?
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(() => {
                  const bestPower = Math.max(...snapshots.map(s => s.power));
                  const bestPayback = Math.min(...snapshots.filter(s => s.payback > 0 && s.payback < Infinity).map(s => s.payback));
                  const bestCapex = Math.min(...snapshots.map(s => s.capex));
                  const bestTailings = Math.min(...snapshots.map(s => s.tailings));
                  return snapshots.map(snap => (
                    <div key={snap.id} className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 shadow-sm">
                      <button onClick={() => removeSnapshot(snap.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-white transition-colors">&times;</button>
                      <div className="space-y-1.5 text-xs pr-4">
                        <div className="flex justify-between pb-1 border-b border-slate-100"><span className="text-slate-500">Wind</span><span className="font-semibold">{snap.windSpeed}%</span></div>
                        <div className="flex justify-between pb-1 border-b border-slate-100"><span className="text-slate-500">Magnet</span><span className="font-semibold">{snap.magnetStrength}%{snap.ironNitride ? ' (Fe₁₆N₂)' : ''}</span></div>
                        <div className="flex justify-between pb-1 border-b border-slate-100"><span className="text-slate-500">Power</span><span className={`font-semibold ${snap.power === bestPower ? 'text-emerald-600' : ''}`}>{snap.power} MW</span></div>
                        <div className="flex justify-between pb-1 border-b border-slate-100"><span className="text-slate-500">CAPEX</span><span className={`font-semibold ${snap.capex === bestCapex ? 'text-emerald-600' : ''}`}>€{(snap.capex / 1e6).toFixed(2)}M</span></div>
                        <div className="flex justify-between pb-1 border-b border-slate-100"><span className="text-slate-500">Payback</span><span className={`font-semibold ${snap.payback === bestPayback ? 'text-emerald-600' : ''}`}>{snap.payback > 100 ? '∞' : snap.payback + ' yrs'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Tailings</span><span className={`font-semibold ${snap.tailings === bestTailings ? 'text-emerald-600' : ''}`}>{snap.tailings.toLocaleString()} t</span></div>
                      </div>
                    </div>
                  ));
                })()}
                {snapshots.length < 3 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-2xl mb-1 opacity-50">+</span>
                    <p className="text-xs text-center">Save another config to compare</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===== About Modal ===== */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">About: How Wind Turbine Generators Work</h2>
              <button onClick={() => setShowAbout(false)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100" aria-label="Close">×</button>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Direct-Drive vs Gearbox Systems</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <img src={`${import.meta.env.BASE_URL}images/system-comparison.png`} alt="Wind turbine system comparison" className="w-full max-h-80 object-contain bg-white rounded-lg" />
                  <p className="text-center text-sm text-slate-600 mt-2 italic">Direct-drive systems eliminate the gearbox, relying on strong permanent magnets</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Inside a Wind Turbine Generator</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <img src={`${import.meta.env.BASE_URL}images/generator-diagram.png`} alt="Direct-Drive Permanent Magnet Generator" className="w-full max-h-80 object-contain bg-white rounded-lg" />
                  <p className="text-center text-sm text-slate-600 mt-2 italic">Neodymium magnets (red) rotate past stationary copper windings (orange)</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-base font-bold text-slate-800 mb-2">Why Magnet Strength Matters</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">Offshore turbines eliminate gearboxes to reduce maintenance costs, so blades spin slowly. Strong rare-earth magnets compensate for this low rotation speed.</p>
                <p className="text-sm text-slate-700 font-mono mb-1">Available Mechanical Energy ∝ Wind Speed³</p>
                <p className="text-sm text-slate-700 font-mono">Electrical Power ∝ Magnet Strength × Rotation Speed</p>
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
                <p className="text-slate-700"><strong className="text-slate-800">Current gap:</strong> The EU currently imports <strong>~98%</strong> of its rare-earth supply, predominantly from China — far above the Act's diversification targets.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
