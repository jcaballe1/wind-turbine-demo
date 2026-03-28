import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import VisualGenerator from './VisualGenerator';

const Dashboard = ({ onBackToIntro, onOpenQuiz }) => {
  const [windSpeed, setWindSpeed] = useState(50);
  const [magnetStrength, setMagnetStrength] = useState(100);
  const [powerData, setPowerData] = useState([]);
  const [currentPower, setCurrentPower] = useState(0);
  const [magnetCost, setMagnetCost] = useState(0);
  const [paybackYears, setPaybackYears] = useState(0);
  const [toxicTailings, setToxicTailings] = useState(0);
  const [useIronNitride, setUseIronNitride] = useState(false);
  const [showMagnetComparison, setShowMagnetComparison] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEuPolicy, setShowEuPolicy] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showSupplyChain, setShowSupplyChain] = useState(false);
  const [supplyDisruption, setSupplyDisruption] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [showLifecycle, setShowLifecycle] = useState(false);
  const [lifecycleRecycling, setLifecycleRecycling] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioSidebarOpen, setScenarioSidebarOpen] = useState(false);
  const [snapshots, setSnapshots] = useState([]);

  const scenarios = [
    {
      id: 'offshore',
      title: 'Offshore Challenge',
      icon: '\u{1F30A}',
      color: 'blue',
      description: 'Wind speed locked at 70%. Find the minimum magnet strength for profitability under 15 years.',
      lockWindSpeed: 70,
      maxMagnet: null,
      goal: 'Achieve payback < 15 years',
      check: (st) => st.paybackYears < 15 && st.paybackYears > 0,
    },
    {
      id: 'crisis',
      title: 'Supply Crisis',
      icon: '\u{1F6A8}',
      color: 'red',
      description: 'Magnet strength capped at 50% (ferrite only). Can the turbine be viable?',
      lockWindSpeed: null,
      maxMagnet: 50,
      goal: 'Achieve payback < 25 years with ferrite only',
      check: (st) => st.paybackYears < 25 && st.paybackYears > 0,
    },
    {
      id: 'green',
      title: 'Green Design',
      icon: '\u{1F331}',
      color: 'emerald',
      description: 'Minimize toxic tailings while keeping payback under 20 years.',
      lockWindSpeed: null,
      maxMagnet: null,
      goal: 'Payback < 20 yrs AND tailings < 200 tons',
      check: (st) => st.paybackYears < 20 && st.paybackYears > 0 && st.toxicTailings < 200,
    },
    {
      id: 'free',
      title: 'Free Exploration',
      icon: '\u{1F52C}',
      color: 'slate',
      description: 'Unrestricted mode. Experiment freely with all controls.',
      lockWindSpeed: null,
      maxMagnet: null,
      goal: null,
      check: () => true,
    },
  ];

  const activateScenario = (scenario) => {
    setActiveScenario(scenario.id);
    setScenarioSidebarOpen(false);
    setUseIronNitride(false);
    if (scenario.lockWindSpeed !== null) {
      setWindSpeed(scenario.lockWindSpeed);
    }
    if (scenario.maxMagnet !== null) {
      setMagnetStrength(Math.min(magnetStrength, scenario.maxMagnet));
    }
    if (scenario.id === 'free') {
      setActiveScenario(null);
    }
  };

  const currentScenario = scenarios.find(s => s.id === activeScenario);
  const scenarioMet = currentScenario?.check?.({ paybackYears, toxicTailings, currentPower, magnetStrength, windSpeed }) ?? false;

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

  const removeSnapshot = (id) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  const ndPriceData = [
    { year: 2008, price: 30 },
    { year: 2009, price: 35 },
    { year: 2010, price: 80 },
    { year: 2011, price: 340 },
    { year: 2012, price: 120 },
    { year: 2013, price: 75 },
    { year: 2014, price: 58 },
    { year: 2015, price: 50 },
    { year: 2016, price: 45 },
    { year: 2017, price: 55 },
    { year: 2018, price: 48 },
    { year: 2019, price: 45 },
    { year: 2020, price: 55 },
    { year: 2021, price: 95 },
    { year: 2022, price: 110 },
    { year: 2023, price: 120 },
    { year: 2024, price: 105 },
    { year: 2025, price: 100 },
  ];

  useEffect(() => {
    const BASE_TURBINE_COST = 4000000; // €4M for tower, blades, installation
    
    const basePower = Math.pow(windSpeed / 100, 3) * 15;
    let power = basePower * (magnetStrength / 100);
    
    // Iron-Nitride caps power at 80% of Neodymium equivalent
    if (useIronNitride) {
      power = power * 0.8;
    }
    
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
    
    // Iron-Nitride reduces magnet CAPEX by 30%
    if (useIronNitride) {
      magnetCostOnly = magnetCostOnly * 0.7;
    }
    
    // Total project cost = Base turbine + Magnet cost
    const totalCost = BASE_TURBINE_COST + magnetCostOnly;
    setMagnetCost(totalCost);

    // Calculate payback period using TOTAL PROJECT CAPEX
    // Revenue = Power (MW) × 8760 hours/year × €50/MWh
    const annualRevenue = power * 8760 * 50;
    const payback = annualRevenue > 0 ? totalCost / annualRevenue : Infinity;
    setPaybackYears(payback);

    // Calculate toxic tailings based on magnet strength
    // Iron-Nitride has zero toxic waste
    let tailings;
    if (useIronNitride) {
      tailings = 0;
    } else {
      // Ferrite (0-50%): 0 tons (no rare earth)
      // Standard NdFeB (51-100%): 0 to 1,200 tons
      // NdFeB + Dy (101-200%): 1,200 to 3,500 tons
      if (magnetStrength <= 50) {
        tailings = 0;
      } else if (magnetStrength <= 100) {
        const progress = (magnetStrength - 50) / 50;
        tailings = progress * 1200;
      } else {
        const progress = (magnetStrength - 100) / 100;
        tailings = 1200 + (progress * 2300);
      }
    }
    setToxicTailings(tailings);

    setPowerData(prevData => {
      const newData = [
        ...prevData,
        {
          power: Number(power.toFixed(2)),
          windSpeed: Number(windSpeed.toFixed(1))
        }
      ];
      const slicedData = newData.length > 50 ? newData.slice(-50) : newData;
      // Re-index time after slicing to ensure correct sequential indices
      return slicedData.map((item, index) => ({
        ...item,
        time: index
      }));
    });
  }, [windSpeed, magnetStrength, useIronNitride]);

  const formatMagnetCost = (totalCost) => {
    const BASE_TURBINE_COST = 4000000;
    const magnetOnly = totalCost - BASE_TURBINE_COST;
    return {
      total: (totalCost / 1000000).toFixed(2),
      base: (BASE_TURBINE_COST / 1000000).toFixed(2),
      magnet: (magnetOnly / 1000000).toFixed(2)
    };
  };

  const getActiveTechId = () => {
    if (useIronNitride) return 'iron-nitride';
    if (magnetStrength <= 50) return 'ferrite';
    if (magnetStrength <= 100) return 'ndfeb';
    return 'ndfeb-dy';
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-100 p-3 lg:overflow-hidden overflow-y-auto relative">
      {/* ===== Collapsible Scenario Sidebar ===== */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${scenarioSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full w-80 bg-white shadow-2xl border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Learning Scenarios</h2>
            <button onClick={() => setScenarioSidebarOpen(false)} className="text-slate-500 hover:text-slate-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {scenarios.map(s => {
              const isActive = activeScenario === s.id;
              const colorMap = { blue: 'border-blue-400 bg-blue-50', red: 'border-red-400 bg-red-50', emerald: 'border-emerald-400 bg-emerald-50', slate: 'border-slate-400 bg-slate-50' };
              const ringMap = { blue: 'ring-blue-400', red: 'ring-red-400', emerald: 'ring-emerald-400', slate: 'ring-slate-400' };
              return (
                <button
                  key={s.id}
                  onClick={() => activateScenario(s)}
                  className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-md ${isActive ? `${colorMap[s.color]} ring-2 ${ringMap[s.color]}` : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-bold text-sm text-slate-800">{s.title}</span>
                    {isActive && <span className="ml-auto text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded-full">ACTIVE</span>}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{s.description}</p>
                  {s.goal && <p className="text-xs font-semibold mt-1.5 text-slate-500">{s.goal}</p>}
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center italic">Select a scenario to apply constraints and goals to the simulator.</p>
          </div>
        </div>
      </div>
      {scenarioSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={() => setScenarioSidebarOpen(false)} />}

      <div className="max-w-[1920px] mx-auto h-full flex flex-col">
        
        {/* Scenario Goal Banner */}
        {currentScenario && currentScenario.goal && (
          <div className={`rounded-lg px-4 py-2 mb-2 flex items-center justify-between transition-all duration-300 ${scenarioMet ? 'bg-emerald-100 border-2 border-emerald-400' : 'bg-amber-50 border-2 border-amber-300'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{currentScenario.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-800">{currentScenario.title}</p>
                <p className="text-xs text-slate-600">{currentScenario.goal}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {scenarioMet ? (
                <span className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">Goal Met!</span>
              ) : (
                <span className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">In Progress</span>
              )}
              <button onClick={() => setActiveScenario(null)} className="text-xs text-slate-500 hover:text-slate-700 underline ml-2">Exit scenario</button>
            </div>
          </div>
        )}

        {/* Polished Header with Back Button */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-3">
          <div className="flex items-center gap-3 lg:gap-6 mb-2 lg:mb-0">
            <button
              onClick={onBackToIntro}
              aria-label="Back to introduction page"
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm"
            >
              <span>←</span> <span className="hidden sm:inline">Back to Intro</span><span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg lg:text-2xl font-bold text-slate-800 truncate">
                Wind Turbine Dashboard
              </h1>
              <p className="text-sm text-slate-600 hidden md:block">
                Magnetism acts as <span className="text-blue-600 font-semibold">invisible gears</span> converting wind motion into electrical power
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMagnetComparison(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>🧲</span> <span className="hidden sm:inline">Compare</span> Magnets
            </button>
            <button
              onClick={() => setShowPriceHistory(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>📈</span> <span className="hidden sm:inline">Nd</span> Price
            </button>
            <button
              onClick={() => setShowSupplyChain(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>🌍</span> Supply Chain
            </button>
            <button
              onClick={() => setShowLifecycle(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>♻️</span> Lifecycle
            </button>
            <button
              onClick={() => setShowEuPolicy(true)}
              className="bg-[#003399] hover:bg-blue-900 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>🇪🇺</span> EU Policy
            </button>
            <button
              onClick={() => setScenarioSidebarOpen(true)}
              className={`px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium ${activeScenario ? 'bg-violet-600 hover:bg-violet-700 text-white ring-2 ring-violet-300' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
            >
              <span>📋</span> Scenarios{activeScenario ? ' ●' : ''}
            </button>
            <button
              onClick={saveSnapshot}
              disabled={snapshots.length >= 3}
              className={`px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium ${snapshots.length >= 3 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}
            >
              <span>📷</span> Snapshot {snapshots.length > 0 ? `(${snapshots.length}/3)` : ''}
            </button>
            <button
              onClick={onOpenQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>🎓</span> Quiz
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="bg-slate-500 hover:bg-slate-600 text-white px-3 lg:px-4 py-2 min-h-[44px] rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              <span>❓</span> About
            </button>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden">
          
          {/* ========== TOP ROW: Physics & Controls ========== */}
          
          {/* LEFT: Control Panel (4 columns) — 2-col grid on tablet, 1-col on phone */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-3 order-2 lg:order-1">
            
            {/* Wind Speed Control */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm lg:text-base font-semibold text-slate-700">
                  Wind Speed
                </label>
                <span className="text-lg lg:text-xl font-bold text-blue-600">
                  {windSpeed.toFixed(1)}%
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                aria-label={`Wind speed control, current value ${windSpeed.toFixed(1)} percent`}
                className="w-full h-3 lg:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-blue mb-2"
                disabled={currentScenario?.lockWindSpeed != null}
              />
              {currentScenario?.lockWindSpeed != null && (
                <p className="text-xs text-blue-700 font-semibold mb-1">Locked at {currentScenario.lockWindSpeed}% by scenario</p>
              )}
              
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Calm</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
              
              <p className="text-xs text-slate-500 italic leading-tight">
                In reality, wind fluctuates by ±15%. This simulation uses steady wind so you can clearly see how speed affects power.
              </p>
            </div>

            {/* Magnet Strength Control */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm lg:text-base font-semibold text-slate-700">
                  Magnet Strength
                </label>
                <span className="text-lg lg:text-xl font-bold text-red-600">
                  {magnetStrength}%
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max={currentScenario?.maxMagnet ?? 200}
                value={magnetStrength}
                onChange={(e) => setMagnetStrength(Number(e.target.value))}
                aria-label={`Magnet strength control, current value ${magnetStrength} percent`}
                className="w-full h-3 lg:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-red mb-2"
              />
              {currentScenario?.maxMagnet != null && (
                <p className="text-xs text-red-700 font-semibold mb-1">Capped at {currentScenario.maxMagnet}% by scenario</p>
              )}
              
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span className="text-left">Ferrite<br/>(Baseline)</span>
                <span className="text-center">Standard<br/>NdFeB</span>
                <span className="text-right">NdFeB + Dy<br/>(Offshore)</span>
              </div>
              
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs text-slate-700 leading-tight">
                  <strong className="text-amber-800">Industry Reality:</strong> Ferrite is too heavy. 
                  Standard NdFeB for onshore, <strong>Dysprosium</strong> added for offshore heat resistance.
                </p>
              </div>
              
              {/* Iron-Nitride R&D Toggle */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      R&D: Iron-Nitride
                    </label>
                    <span className="group relative inline-block">
                      <span className="text-slate-500 text-xs cursor-help">ⓘ</span>
                      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-56 bg-slate-800 text-white text-xs rounded py-2 px-3 z-10 shadow-lg">
                        Iron-Nitride is a clean, lab-developed alternative to rare earths. Currently in R&D to break supply chain dependency. 30% cheaper, zero waste, but 80% power efficiency.
                        <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setUseIronNitride(!useIronNitride)}
                    aria-label={useIronNitride ? 'Disable Iron-Nitride magnet technology' : 'Enable Iron-Nitride magnet technology'}
                    role="switch"
                    aria-checked={useIronNitride}
                    className={`
                      relative inline-flex h-7 w-12 lg:h-6 lg:w-11 items-center rounded-full transition-colors duration-200
                      ${useIronNitride ? 'bg-green-600' : 'bg-slate-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-5 w-5 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform duration-200
                        ${useIronNitride ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                {useIronNitride && (
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-green-800">
                      <strong>Active:</strong> -30% CAPEX, 0 toxic waste, 80% power efficiency
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Insight */}
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-700 leading-tight">
                <strong className="text-blue-800">🧲 Key Insight:</strong> Even with constant wind speed, 
                <strong className="text-red-600"> stronger magnets directly multiply power output</strong>. 
                Critical for energy transition.
              </p>
            </div>
          </div>

          {/* RIGHT: The Invisible Gears SVG Animation (8 columns) */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="w-full lg:h-full" style={{ aspectRatio: '10/3' }}>
              <VisualGenerator windSpeed={windSpeed} magnetStrength={magnetStrength} currentPower={currentPower} />
            </div>
          </div>

          {/* ========== BOTTOM ROW: Analytics & Business ========== */}
          
          {/* LEFT: Power Generation History Chart (8 columns) */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-lg p-3 h-[280px] order-3">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">
              Power Generation History
            </h2>
            
            <div className="overflow-x-auto" style={{ width: '100%', height: 'calc(100% - 28px)' }}>
              <div className="min-w-[500px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      const historyLength = powerData.length;
                      const relativeTime = value - historyLength;
                      return `${relativeTime}s`;
                    }}
                    minTickGap={30}
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#64748b' } }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b', textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelFormatter={(value) => `Time: ${value}s`}
                    formatter={(value, name) => {
                      if (name === 'Power Output (MW)') {
                        return [value, name];
                      }
                      return [value + '%', name];
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                    name="Power Output (MW)"
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RIGHT: Business Metrics Sidebar (4 columns) */}
          <div className="lg:col-span-4 flex flex-col justify-start gap-3 order-4">
            
            {/* Business Trade-Off Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">
                Business Trade-Off
              </h2>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200" role="status" aria-live="polite">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    ⚡ Power
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-blue-600">
                      {currentPower.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-600 ml-1">MW</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    Revenue
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-2 border border-red-200" role="status" aria-live="polite">
                  <div className="flex items-center gap-1 mb-1">
                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      💰 Total CAPEX
                    </h3>
                    <span className="group relative inline-block">
                      <span className="text-slate-500 text-xs cursor-help">ⓘ</span>
                      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded py-2 px-3 z-10 shadow-lg">
                        <strong>Base Cost (€4M):</strong> Steel tower, blades, nacelle, foundation, offshore installation & grid connection.<br/><br/>
                        <strong>Magnet Cost:</strong> Varies by strength (Ferrite → NdFeB → NdFeB+Dy). Strong magnets = higher power but exponential material costs.
                        <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                      </span>
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-red-600">
                      €{formatMagnetCost(magnetCost).total}M
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    €{formatMagnetCost(magnetCost).base}M Base + €{formatMagnetCost(magnetCost).magnet}M Magnet
                  </p>
                </div>

                <div className={`rounded-lg p-2 border ${
                  paybackYears > 25
                    ? 'bg-red-50 border-red-200' 
                    : paybackYears < 10
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`} role="status" aria-live="polite">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    ⏱️ Payback
                  </h3>
                  <div className="flex items-baseline">
                    <span className={`text-lg font-bold ${
                      paybackYears > 25
                        ? 'text-red-600' 
                        : paybackYears < 10
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      {paybackYears === Infinity || currentPower === 0
                        ? '∞'
                        : paybackYears > 25
                        ? '> 25'
                        : paybackYears.toFixed(1)}
                    </span>
                    {paybackYears !== Infinity && currentPower > 0 && (
                      <span className="text-xs text-slate-600 ml-1">Years</span>
                    )}
                  </div>
                  <p className={`text-xs leading-tight font-semibold ${
                    paybackYears > 25 ? 'text-red-700' : paybackYears < 10 ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {paybackYears > 25 || paybackYears === Infinity || currentPower === 0
                      ? 'Uneconomical'
                      : paybackYears < 10
                      ? 'Excellent'
                      : 'Viable'}
                    {paybackYears <= 25 && currentPower > 0 && <span className="font-normal text-slate-500"> @ €50/MWh</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                  <p className="text-xs text-slate-600 font-mono mb-1 leading-tight">
                    Power ∝ Wind³ × Magnet
                  </p>
                  <p className="text-xs text-slate-500 leading-tight">
                    <strong>Reality:</strong> Stronger magnets boost power but increase CAPEX exponentially.
                  </p>
                </div>

                {/* Critical Materials Context - Moved Inside */}
                <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-2 col-span-2">
                  <h3 className="text-xs font-semibold text-red-900 mb-1">
                    Critical Materials
                  </h3>
                  
                  <div className="flex gap-2">
                    {/* Dynamic Toxic Tailings Counter */}
                    <div className={`${toxicTailings === 0 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border rounded-lg p-1.5 flex-1`}>
                      <p className="text-xs text-slate-700 leading-tight mb-0.5">
                        <strong className={toxicTailings === 0 ? 'text-green-900' : 'text-red-900'}>Toxic Tailings:</strong>
                      </p>
                      <div className="flex items-center gap-1.5">
                        {/* Dynamic SVG visualization */}
                        {toxicTailings === 0 ? (
                          <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
                            <circle cx="14" cy="14" r="12" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
                            <path d="M9 14.5l3.5 3.5L19.5 11" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
                            {/* Barrel stack: number visible scales with tailings (1-5 barrels) */}
                            {(() => {
                              const count = Math.max(1, Math.min(5, Math.ceil(toxicTailings / 700)));
                              const barrels = [
                                { x: 10, y: 20, w: 8, h: 6 },
                                { x: 5, y: 14, w: 8, h: 6 },
                                { x: 15, y: 14, w: 8, h: 6 },
                                { x: 3, y: 8, w: 8, h: 6 },
                                { x: 17, y: 8, w: 8, h: 6 },
                              ];
                              return barrels.slice(0, count).map((b, i) => (
                                <g key={i}>
                                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="1.5" fill="#fca5a5" stroke="#b91c1c" strokeWidth="0.8"/>
                                  <line x1={b.x} y1={b.y + b.h * 0.33} x2={b.x + b.w} y2={b.y + b.h * 0.33} stroke="#b91c1c" strokeWidth="0.5"/>
                                  <line x1={b.x} y1={b.y + b.h * 0.66} x2={b.x + b.w} y2={b.y + b.h * 0.66} stroke="#b91c1c" strokeWidth="0.5"/>
                                </g>
                              ));
                            })()}
                          </svg>
                        )}
                        <div>
                          <div className="flex items-baseline">
                            <span className={`text-lg font-bold ${toxicTailings === 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {toxicTailings.toFixed(0)}
                            </span>
                            <span className="text-xs text-slate-600 ml-1">Tons</span>
                          </div>
                        </div>
                      </div>
                      {toxicTailings === 0 ? (
                        <p className="text-xs text-green-700 font-semibold mt-0.5">Zero rare-earth waste</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                          {toxicTailings >= 2500
                            ? <>{(toxicTailings / 2500).toFixed(1)} Olympic pools</>
                            : <>{Math.ceil(toxicTailings / 28)} shipping containers</>
                          }
                        </p>
                      )}
                    </div>
                    
                    {/* Supply Chain Link */}
                    <div className="flex-1 flex items-center justify-center">
                      <button
                        onClick={() => setShowSupplyChain(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        See Supply Chain panel for details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Static Wind Farm Context Note */}
              <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs text-slate-600 leading-tight">
                  <strong className="text-amber-800">Scale context:</strong>{' '}
                  {useIronNitride || magnetStrength <= 50
                    ? 'A typical 100-turbine offshore farm using ferrite or Iron-Nitride avoids rare-earth dependency entirely.'
                    : <>A typical 100-turbine offshore farm would require <strong className="text-amber-700">60 tons</strong> of NdFeB magnets — 0.025% of global annual production (~240,000 tons/year).</>
                  }
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ===== Snapshot Comparison Strip ===== */}
        {snapshots.length > 0 && (() => {
          const bestPower = Math.max(...snapshots.map(s => s.power));
          const bestPayback = Math.min(...snapshots.filter(s => s.payback > 0).map(s => s.payback));
          const bestCapex = Math.min(...snapshots.map(s => s.capex));
          const bestTailings = Math.min(...snapshots.map(s => s.tailings));
          return (
            <div className="bg-white rounded-lg shadow-lg p-3 mt-2 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700">Saved Snapshots — Compare Trade-offs</h3>
                <span className="text-xs text-slate-500">{snapshots.length}/3 slots used</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 relative">
                    <button
                      onClick={() => removeSnapshot(snap.id)}
                      className="absolute top-1 right-1 text-slate-500 hover:text-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50"
                    >&times;</button>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Wind</span><span className="font-semibold text-slate-700">{snap.windSpeed}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Magnet</span><span className="font-semibold text-slate-700">{snap.magnetStrength}%{snap.ironNitride ? ' (Fe₁₆N₂)' : ''}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Power</span><span className={`font-semibold ${snapshots.length > 1 && snap.power === bestPower ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>{snap.power} MW</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">CAPEX</span><span className={`font-semibold ${snapshots.length > 1 && snap.capex === bestCapex ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>€{(snap.capex / 1e6).toFixed(2)}M</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Payback</span><span className={`font-semibold ${snapshots.length > 1 && snap.payback === bestPayback && snap.payback > 0 ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>{snap.payback > 100 ? '∞' : snap.payback + ' yrs'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tailings</span><span className={`font-semibold ${snapshots.length > 1 && snap.tailings === bestTailings ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>{snap.tailings.toLocaleString()} t</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Magnet Technology Comparison Modal */}
      {showMagnetComparison && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMagnetComparison(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Magnet Technology Comparison</h2>
              <button
                onClick={() => setShowMagnetComparison(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block p-5">
              <table className="w-full text-sm">
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
                    { id: 'ferrite', name: 'Ferrite', strength: '●○○○○', cost: '~€2', waste: 'None', risk: 'None', trl: '9', color: 'slate', tooltip: 'Cheap ceramic magnets widely used in low-power motors. Too weak and heavy for modern multi-MW wind turbines, so only suited for very small generators.' },
                    { id: 'ndfeb', name: 'Standard NdFeB', strength: '●●●●○', cost: '~€80', waste: 'High (1,200 t)', risk: 'High', trl: '9', color: 'blue', tooltip: 'Neodymium-Iron-Boron — the workhorse of onshore wind. 10× stronger than ferrite, enabling compact, lightweight generators. Subject to rare-earth supply chain concentration (China ~90%).' },
                    { id: 'ndfeb-dy', name: 'NdFeB + Dysprosium', strength: '●●●●●', cost: '~€200', waste: 'Very High (3,500 t)', risk: 'Very High', trl: '9', color: 'red', tooltip: 'Adding Dysprosium preserves magnetic strength at the high temperatures found inside offshore nacelles. Significantly more expensive and environmentally damaging due to heavy rare-earth mining.' },
                    { id: 'iron-nitride', name: 'Iron-Nitride (Fe₁₆N₂)', strength: '●●●○○', cost: '~€50', waste: 'None', risk: 'None', trl: '4-5', color: 'green', tooltip: 'Lab-stage alternative using abundant iron and nitrogen. Eliminates rare-earth dependency and toxic waste. Currently reaches ~80% of NdFeB performance; scaling to commercial production is the key challenge.' },
                    { id: 'hts', name: 'HTS (Superconducting)', strength: '●●●●●+', cost: '~€500+', waste: 'Minimal', risk: 'Low', trl: '3-4', color: 'purple', tooltip: 'High-Temperature Superconducting coils replace permanent magnets entirely with electromagnets cooled to cryogenic temperatures. Extremely powerful but requires complex cooling systems — still in early demonstration.' }
                  ].map((tech) => {
                    const isActive = getActiveTechId() === tech.id;
                    return (
                      <tr
                        key={tech.id}
                        className={`border-b border-slate-100 transition-colors ${
                          isActive ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{tech.name}</span>
                            {isActive && (
                              <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">Active</span>
                            )}
                            <span className="group relative inline-block">
                              <span className="text-slate-500 text-xs cursor-help">ⓘ</span>
                              <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded py-2 px-3 z-10 shadow-lg">
                                {tech.tooltip}
                                <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                              </span>
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
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {[
                { id: 'ferrite', name: 'Ferrite', strength: '●○○○○', cost: '~€2/kg', waste: 'None', risk: 'None', trl: '9', tooltip: 'Cheap ceramic magnets widely used in low-power motors. Too weak and heavy for modern multi-MW wind turbines.' },
                { id: 'ndfeb', name: 'Standard NdFeB', strength: '●●●●○', cost: '~€80/kg', waste: 'High', risk: 'High', trl: '9', tooltip: 'Neodymium-Iron-Boron — 10× stronger than ferrite, enabling compact generators. High supply chain concentration.' },
                { id: 'ndfeb-dy', name: 'NdFeB + Dysprosium', strength: '●●●●●', cost: '~€200/kg', waste: 'Very High', risk: 'Very High', trl: '9', tooltip: 'Dysprosium preserves strength at high offshore temperatures. Most expensive and environmentally damaging.' },
                { id: 'iron-nitride', name: 'Iron-Nitride (Fe₁₆N₂)', strength: '●●●○○', cost: '~€50/kg', waste: 'None', risk: 'None', trl: '4-5', tooltip: 'Lab-stage alternative using iron and nitrogen. ~80% of NdFeB performance, zero rare-earth dependency.' },
                { id: 'hts', name: 'HTS (Superconducting)', strength: '●●●●●+', cost: '~€500+/kg', waste: 'Minimal', risk: 'Low', trl: '3-4', tooltip: 'Superconducting coils replace magnets entirely. Extremely powerful but requires cryogenic cooling.' }
              ].map((tech) => {
                const isActive = getActiveTechId() === tech.id;
                return (
                  <div
                    key={tech.id}
                    className={`rounded-lg border p-3 ${
                      isActive ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-800">{tech.name}</span>
                      {isActive && (
                        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">Active</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-slate-500">Strength:</span><span className="font-mono tracking-wider">{tech.strength}</span>
                      <span className="text-slate-500">Cost:</span><span>{tech.cost}</span>
                      <span className="text-slate-500">Toxic Waste:</span><span>{tech.waste}</span>
                      <span className="text-slate-500">Supply Risk:</span><span>{tech.risk}</span>
                      <span className="text-slate-500">TRL:</span><span className="font-semibold">{tech.trl}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic">{tech.tooltip}</p>
                  </div>
                );
              })}
            </div>

            <div className="px-5 pb-5">
              <p className="text-xs text-slate-500 italic text-center">
                TRL = Technology Readiness Level (1–9). TRL 9 = commercially proven. Costs are indicative and vary by market.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Neodymium Price History Modal */}
      {showPriceHistory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPriceHistory(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Neodymium Oxide Price History (2008–2025)</h2>
              <button
                onClick={() => setShowPriceHistory(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <div style={{ width: '100%', height: '360px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ndPriceData} margin={{ top: 15, right: 25, bottom: 25, left: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      domain={[2008, 2025]}
                      type="number"
                      tickCount={10}
                      label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#64748b' } }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      domain={[0, 400]}
                      label={{ value: 'USD/kg', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b', textAnchor: 'middle' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                      labelFormatter={(value) => `Year: ${value}`}
                      formatter={(value) => [`$${value}/kg`, 'Nd₂O₃ Price']}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: '13px', paddingBottom: '10px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#dc2626"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#dc2626' }}
                      activeDot={{ r: 6 }}
                      name="Nd₂O₃ Price (USD/kg)"
                    />
                    <ReferenceLine
                      x={2010}
                      stroke="#9333ea"
                      strokeDasharray="4 4"
                      label={{ value: '2010: China export quotas \u2014 prices spike 10x', position: 'top', fill: '#9333ea', fontSize: 11 }}
                    />
                    <ReferenceLine
                      x={2015}
                      stroke="#2563eb"
                      strokeDasharray="4 4"
                      label={{ value: '2015: New mines open outside China', position: 'insideTopRight', fill: '#2563eb', fontSize: 11 }}
                    />
                    <ReferenceLine
                      x={2020}
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      label={{ value: '2020+: EV & wind demand surge', position: 'insideTopRight', fill: '#d97706', fontSize: 11 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 mt-3 text-center italic">
                Price volatility is the hidden risk of rare-earth dependency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Supply Chain Map Modal */}
      {showSupplyChain && (() => {
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
        const disrupted = supplyDisruption;

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSupplyChain(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Rare-Earth Supply Chain</h2>
                <button
                  onClick={() => setShowSupplyChain(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-5">
                {/* Supply Disruption Toggle */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Simulate: China Export Restriction</p>
                    <p className="text-xs text-slate-500">See what happens when 90% of processing capacity is restricted</p>
                  </div>
                  <button
                    onClick={() => setSupplyDisruption(!supplyDisruption)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${disrupted ? 'bg-red-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${disrupted ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Disruption Impact Banner */}
                {disrupted && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-sm font-bold text-red-800 mb-1">⚠️ Supply Disruption Active</p>
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
                        <p className="text-red-900 font-bold text-lg">~35%</p>
                        <p className="text-red-700">Available supply</p>
                      </div>
                    </div>
                    <p className="text-xs text-red-700 mt-2 italic">Historical precedent: 2010–2011 China quota crisis caused a 10× price spike.</p>
                  </div>
                )}

                {/* 3-Column Flow Diagram */}
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-start">

                  {/* COLUMN 1: Mining Sources */}
                  <div>
                    <div className="text-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">⛏️ Mining</span>
                    </div>
                    <div className="space-y-2">
                      {miners.map(m => {
                        const isChina = m.id === 'china-m';
                        const dimmed = disrupted && isChina;
                        return (
                          <div
                            key={m.id}
                            className={`group relative rounded-lg border-2 p-2.5 transition-all duration-300 ${riskColor[m.risk]} ${dimmed ? 'opacity-40' : ''}`}
                            onMouseEnter={() => setHoveredCountry(m.id)}
                            onMouseLeave={() => setHoveredCountry(null)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{m.flag}</span>
                                <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                              </div>
                              <span className="text-sm font-bold text-slate-700">{m.pct}%</span>
                            </div>
                            <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${riskBarColor[m.risk]}`} style={{ width: `${m.pct}%` }}/>
                            </div>
                            {dimmed && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-red-700 text-2xl font-bold">✕</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  <div className="flex items-center justify-center px-2 self-center">
                    <svg width="40" height="24" viewBox="0 0 40 24">
                      <defs>
                        <marker id="flow-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill={disrupted ? '#dc2626' : '#64748b'}/>
                        </marker>
                      </defs>
                      <line x1="0" y1="12" x2="30" y2="12"
                        stroke={disrupted ? '#dc2626' : '#94a3b8'}
                        strokeWidth="2"
                        strokeDasharray={disrupted ? '4 3' : 'none'}
                        markerEnd="url(#flow-arrow)"
                      />
                    </svg>
                  </div>

                  {/* COLUMN 2: Processing (China bottleneck) */}
                  <div>
                    <div className="text-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">🏭 Processing</span>
                    </div>
                    <div className={`rounded-xl border-2 p-4 text-center transition-all duration-300 ${disrupted ? 'border-red-500 bg-red-50' : 'border-red-300 bg-red-50'}`}>
                      <span className="text-3xl">🇨🇳</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">China</p>
                      <p className={`text-3xl font-black mt-1 ${disrupted ? 'text-red-700' : 'text-red-600'}`}>~90%</p>
                      <p className="text-xs text-slate-600 mt-0.5">of global processing</p>
                      {disrupted && (
                        <div className="mt-2 p-1.5 bg-red-100 border border-red-300 rounded text-xs text-red-800 font-semibold">
                          🚫 Exports restricted
                        </div>
                      )}
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

                  {/* Arrow 2 */}
                  <div className="flex items-center justify-center px-2 self-center">
                    <svg width="40" height="24" viewBox="0 0 40 24">
                      <line x1="0" y1="12" x2="30" y2="12"
                        stroke={disrupted ? '#dc2626' : '#94a3b8'}
                        strokeWidth="2"
                        strokeDasharray={disrupted ? '4 3' : 'none'}
                        markerEnd="url(#flow-arrow)"
                      />
                    </svg>
                  </div>

                  {/* COLUMN 3: End Use */}
                  <div>
                    <div className="text-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">🔧 End Use</span>
                    </div>
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
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-800">{u.label}</span>
                              <span className="text-xs font-bold text-slate-500">{u.share}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{u.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom stats bar */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-700">~90%</p>
                    <p className="text-xs text-slate-600">Global processing by China</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                    <p className="text-2xl font-bold text-amber-700">~98%</p>
                    <p className="text-xs text-slate-600">EU import dependency</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-700">&lt;1%</p>
                    <p className="text-xs text-slate-600">Global recycling rate</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 text-center italic">
                  Geographic concentration creates strategic vulnerability — a single policy change can disrupt global wind energy supply chains.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Turbine Lifecycle Modal */}
      {showLifecycle && (() => {
        const ndfebPerTurbine = 600; // kg
        const recoveryRate = 0.9;
        const gen1Virgin = ndfebPerTurbine;
        const gen2Virgin = lifecycleRecycling ? ndfebPerTurbine * (1 - recoveryRate) : ndfebPerTurbine;
        const gen3Virgin = lifecycleRecycling ? ndfebPerTurbine * (1 - recoveryRate) : ndfebPerTurbine;
        const totalVirgin = gen1Virgin + gen2Virgin + gen3Virgin;
        const totalBaseline = ndfebPerTurbine * 3;
        const totalSaved = totalBaseline - totalVirgin;

        const stages = [
          { id: 1, label: 'Mining &\nRefining', icon: '⛏️', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'Rare-earth ore extracted and separated into oxides' },
          { id: 2, label: 'Magnet\nManufacturing', icon: '🏭', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'NdFeB alloy sintered into permanent magnets' },
          { id: 3, label: 'Turbine\nOperation', icon: '🌬️', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', desc: '20–25 years generating clean energy' },
          { id: 4, label: 'Decom-\nmissioning', icon: '🔧', color: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'Turbine dismantled, components sorted' },
          { id: 5, label: 'End of\nLife', icon: lifecycleRecycling ? '♻️' : '🗑️', color: lifecycleRecycling ? '#059669' : '#64748b', bg: lifecycleRecycling ? '#ecfdf5' : '#f8fafc', border: lifecycleRecycling ? '#a7f3d0' : '#e2e8f0', desc: lifecycleRecycling ? '~90% NdFeB recovered via hydrogen decrepitation' : 'Magnets sent to landfill — materials lost forever' },
        ];

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLifecycle(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Turbine Lifecycle &amp; Recycling Potential</h2>
                <button
                  onClick={() => setShowLifecycle(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-5">
                {/* SVG Flow Diagram */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
                  <svg viewBox="0 0 920 200" className="w-full h-auto" style={{ maxHeight: '200px' }}>
                    <defs>
                      <marker id="lc-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
                      </marker>
                      <marker id="lc-arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#059669"/>
                      </marker>
                    </defs>

                    {/* Stage boxes */}
                    {stages.map((s, i) => {
                      const x = 20 + i * 180;
                      const y = 30;
                      const w = 140;
                      const h = 100;
                      return (
                        <g key={s.id}>
                          <rect x={x} y={y} width={w} height={h} rx={12} fill={s.bg} stroke={s.border} strokeWidth={2}/>
                          <text x={x + w/2} y={y + 30} textAnchor="middle" fontSize="22">{s.icon}</text>
                          {s.label.split('\n').map((line, li) => (
                            <text key={li} x={x + w/2} y={y + 52 + li * 14} textAnchor="middle" fontSize="11" fontWeight="700" fill={s.color}>{line}</text>
                          ))}
                          <text x={x + w/2} y={y + h + 16} textAnchor="middle" fontSize="9" fill="#64748b">{s.id === 3 ? '20–25 yrs' : s.id === 1 ? '~2,000t waste/t ore' : s.id === 2 ? '600 kg NdFeB' : s.id === 4 ? 'Year 25' : lifecycleRecycling ? '90% recovered' : 'Materials lost'}</text>
                          {/* Forward arrows between stages */}
                          {i < 4 && (
                            <line x1={x + w + 4} y1={y + h/2} x2={x + w + 36} y2={y + h/2} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#lc-arrow)"/>
                          )}
                        </g>
                      );
                    })}

                    {/* Recycling feedback loop arrow (stage 5 back to stage 2) */}
                    {lifecycleRecycling && (
                      <g>
                        <path d="M 810,135 L 810,180 Q 810,190 800,190 L 230,190 Q 220,190 220,180 L 220,135" fill="none" stroke="#059669" strokeWidth={2.5} strokeDasharray="6 3" markerEnd="url(#lc-arrow-green)"/>
                        <rect x={440} y={179} width={120} height={20} rx={4} fill="#059669"/>
                        <text x={500} y={193} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">90% NdFeB recycle</text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Recycling Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Enable Recycling at End-of-Life</p>
                    <p className="text-xs text-slate-500">Hydrogen decrepitation recovers ~90% of NdFeB magnet material</p>
                  </div>
                  <button
                    onClick={() => setLifecycleRecycling(!lifecycleRecycling)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${lifecycleRecycling ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${lifecycleRecycling ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* 3-Generation Comparison */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3].map(gen => {
                    const virgin = gen === 1 ? gen1Virgin : gen === 2 ? gen2Virgin : gen3Virgin;
                    const recycled = ndfebPerTurbine - virgin;
                    return (
                      <div key={gen} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Generation {gen}</p>
                        <p className="text-xs text-slate-500">Years {(gen-1)*25}–{gen*25}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-red-700">⛏️ Virgin mining</span>
                            <span className="font-bold text-slate-800">{virgin.toFixed(0)} kg</span>
                          </div>
                          {lifecycleRecycling && gen > 1 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-700">♻️ Recycled</span>
                              <span className="font-bold text-emerald-700">{recycled.toFixed(0)} kg</span>
                            </div>
                          )}
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div className="h-full rounded-full flex">
                              <div className="bg-red-400 h-full" style={{ width: `${(virgin / ndfebPerTurbine) * 100}%` }}/>
                              {recycled > 0 && <div className="bg-emerald-400 h-full" style={{ width: `${(recycled / ndfebPerTurbine) * 100}%` }}/>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cumulative Summary */}
                <div className={`rounded-lg p-4 border-2 text-center transition-all duration-300 ${lifecycleRecycling ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cumulative NdFeB over 3 generations (60 years)</p>
                  <div className="flex items-center justify-center gap-6">
                    <div>
                      <p className="text-2xl font-black text-red-600">{totalVirgin.toFixed(0)} kg</p>
                      <p className="text-xs text-slate-600">Virgin material needed</p>
                    </div>
                    {lifecycleRecycling && (
                      <>
                        <div className="text-slate-300 text-xl">|</div>
                        <div>
                          <p className="text-2xl font-black text-emerald-600">{totalSaved.toFixed(0)} kg</p>
                          <p className="text-xs text-slate-600">Saved vs. no recycling</p>
                        </div>
                        <div className="text-slate-300 text-xl">|</div>
                        <div>
                          <p className="text-2xl font-black text-emerald-600">{((totalSaved / totalBaseline) * 100).toFixed(0)}%</p>
                          <p className="text-xs text-slate-600">Reduction in mining</p>
                        </div>
                      </>
                    )}
                  </div>
                  {!lifecycleRecycling && (
                    <p className="text-xs text-slate-500 mt-2 italic">Enable recycling above to see potential material savings.</p>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3 text-center italic">
                  Current global rare-earth recycling rate is &lt;1%. Scaling recycling is essential for a sustainable energy transition.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* About / Engineering Diagrams Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">About: How Wind Turbine Generators Work</h2>
              <button
                onClick={() => setShowAbout(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Direct-Drive vs Gearbox Systems</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <img
                    src={`${import.meta.env.BASE_URL}images/system-comparison.png`}
                    alt="Comparison of wind turbine systems with and without gearbox"
                    className="w-full max-h-80 object-contain bg-white rounded-lg"
                  />
                  <p className="text-center text-sm text-slate-600 mt-2 italic">
                    Direct-drive systems eliminate the gearbox, relying on strong permanent magnets
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Inside a Wind Turbine Generator</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <img
                    src={`${import.meta.env.BASE_URL}images/generator-diagram.png`}
                    alt="Direct-Drive Permanent Magnet Generator showing rotor with neodymium magnets and copper stator windings"
                    className="w-full max-h-80 object-contain bg-white rounded-lg"
                  />
                  <p className="text-center text-sm text-slate-600 mt-2 italic">
                    3D view: Neodymium magnets (red) rotate past stationary copper windings (orange)
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-base font-bold text-slate-800 mb-2">Why Magnet Strength Matters</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  Offshore turbines eliminate gearboxes to reduce maintenance costs, so their blades spin slowly.
                  To convert that slow rotation into grid-scale electricity, engineers rely on hyper-strong rare-earth magnets.
                </p>
                <p className="text-sm text-slate-700 font-mono mb-1">
                  Available Mechanical Energy ∝ Wind Speed³
                </p>
                <p className="text-sm text-slate-700 font-mono">
                  Electrical Conversion Power ∝ Magnet Strength × Rotation Speed
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EU Policy Context Modal */}
      {showEuPolicy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEuPolicy(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-l-4 border-[#003399]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇺</span>
                <h2 className="text-xl font-bold text-[#003399]">EU Policy Context: Critical Raw Materials Act</h2>
              </div>
              <button
                onClick={() => setShowEuPolicy(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                In March 2024 the EU adopted the <strong className="text-slate-800">Critical Raw Materials Act</strong> to
                reduce dependency on single-country imports and secure supply chains for the green
                and digital transitions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                  <p className="text-2xl font-bold text-[#003399]">10%</p>
                  <p className="text-xs text-slate-600 mt-1">Domestic extraction by 2030</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                  <p className="text-2xl font-bold text-[#003399]">40%</p>
                  <p className="text-xs text-slate-600 mt-1">Domestic processing by 2030</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                  <p className="text-2xl font-bold text-[#003399]">25%</p>
                  <p className="text-xs text-slate-600 mt-1">From recycling by 2030</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                <p className="text-slate-700">
                  <strong className="text-slate-800">Strategic stockpiling:</strong> Member states must map supply-chain risks and
                  coordinate strategic reserves of critical raw materials to buffer against disruptions.
                </p>
                <p className="text-slate-700">
                  <strong className="text-slate-800">Current gap:</strong> The EU currently imports <strong>~98%</strong> of its rare-earth
                  supply — predominantly from China — far above the Act's diversification targets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
