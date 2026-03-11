import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import VisualGenerator from './VisualGenerator';

const Dashboard = ({ onBackToIntro }) => {
  const [windSpeed, setWindSpeed] = useState(50);
  const [magnetStrength, setMagnetStrength] = useState(100);
  const [powerData, setPowerData] = useState([]);
  const [currentPower, setCurrentPower] = useState(0);
  const [magnetCost, setMagnetCost] = useState(0);
  const [simulateGusts, setSimulateGusts] = useState(false);
  const [baseWindSpeed, setBaseWindSpeed] = useState(50);

  useEffect(() => {
    if (!simulateGusts) return;

    const gustInterval = setInterval(() => {
      const fluctuation = (Math.random() * 0.3 - 0.15) * baseWindSpeed;
      const newSpeed = Math.max(0, Math.min(100, baseWindSpeed + fluctuation));
      setWindSpeed(newSpeed);
    }, 1000);

    return () => clearInterval(gustInterval);
  }, [simulateGusts, baseWindSpeed]);

  const handleWindSpeedChange = (newSpeed) => {
    setWindSpeed(newSpeed);
    setBaseWindSpeed(newSpeed);
  };

  const handleGustToggle = () => {
    if (!simulateGusts) {
      setBaseWindSpeed(windSpeed);
    } else {
      setWindSpeed(baseWindSpeed);
    }
    setSimulateGusts(!simulateGusts);
  };

  useEffect(() => {
    const basePower = Math.pow(windSpeed / 100, 3) * 15;
    const power = basePower * (magnetStrength / 100);
    setCurrentPower(power);

    let cost;
    if (magnetStrength <= 50) {
      cost = 50000 + (magnetStrength / 50) * 50000;
    } else if (magnetStrength <= 100) {
      cost = 100000 + ((magnetStrength - 50) / 50) * 2400000;
    } else {
      const dysprosiumFactor = (magnetStrength - 100) / 100;
      cost = 2500000 + (Math.pow(dysprosiumFactor, 1.5) * 4500000);
    }
    setMagnetCost(cost);

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
  }, [windSpeed, magnetStrength]);

  const formatCost = (cost) => {
    return (cost / 1000000).toFixed(2);
  };

  return (
    <div className="h-screen bg-slate-100 p-3 overflow-hidden">
      <div className="max-w-[1920px] mx-auto h-full flex flex-col">
        
        {/* Polished Header with Back Button */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-3 flex items-center gap-6">
          <button
            onClick={onBackToIntro}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <span>←</span> Back to Intro
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">
              Wind Turbine Power Generation Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Magnetism acts as <span className="text-blue-600 font-semibold">invisible gears</span> converting wind motion into electrical power
            </p>
          </div>
        </div>

        {/* Main Cockpit Grid - 2 Rows */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
          
          {/* ========== TOP ROW: Physics & Controls ========== */}
          
          {/* LEFT: Control Panel (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            
            {/* Wind Speed Control */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-base font-semibold text-slate-700">
                  Wind Speed
                </label>
                <span className="text-xl font-bold text-blue-600">
                  {windSpeed.toFixed(1)}%
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={simulateGusts ? baseWindSpeed : windSpeed}
                onChange={(e) => handleWindSpeedChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-blue mb-2"
                disabled={simulateGusts}
              />
              
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Calm</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
              
              <button
                onClick={handleGustToggle}
                className={`
                  w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${simulateGusts 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-inner' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{simulateGusts ? '🌪️' : '💨'}</span>
                  <span>{simulateGusts ? 'Wind Gusts Active' : 'Simulate Wind Gusts'}</span>
                </span>
              </button>
              
              {simulateGusts && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    Wind fluctuating ±15% every second. Baseline: {baseWindSpeed.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* Magnet Strength Control */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-base font-semibold text-slate-700">
                  Magnet Strength
                </label>
                <span className="text-xl font-bold text-red-600">
                  {magnetStrength}%
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="200"
                value={magnetStrength}
                onChange={(e) => setMagnetStrength(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-red mb-2"
              />
              
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
          <div className="lg:col-span-8">
            <VisualGenerator windSpeed={windSpeed} magnetStrength={magnetStrength} currentPower={currentPower} />
          </div>

          {/* ========== BOTTOM ROW: Analytics & Business ========== */}
          
          {/* LEFT: Power Generation History Chart (8 columns) */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-lg p-3 h-[280px]">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">
              Power Generation History
            </h2>
            
            <div style={{ width: '100%', height: 'calc(100% - 28px)' }}>
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
                  {simulateGusts && (
                    <Line 
                      type="monotone" 
                      dataKey="windSpeed" 
                      stroke="#10b981" 
                      strokeWidth={1}
                      dot={false}
                      name="Wind Speed (%)"
                      strokeDasharray="5 5"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {simulateGusts && (
              <p className="text-xs text-slate-500 mt-1 text-center italic">
                Power (blue) responds to wind fluctuations (green) - cubic relationship amplifies changes.
              </p>
            )}
          </div>

          {/* RIGHT: Business Metrics Sidebar (4 columns) */}
          <div className="lg:col-span-4 flex flex-col justify-start gap-3">
            
            {/* Business Trade-Off Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">
                Business Trade-Off
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
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

                <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    💰 Cost
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-red-600">
                      €{formatCost(magnetCost)}M
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    CAPEX
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                <p className="text-xs text-slate-600 font-mono mb-1 leading-tight">
                  Power ∝ Wind³ × Magnet
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  <strong>Reality:</strong> Stronger magnets boost power but increase CAPEX exponentially.
                </p>
              </div>
            </div>

            {/* Critical Materials Context */}
            <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-3 shadow-lg">
              <h3 className="text-sm font-semibold text-red-900 mb-1.5">
                Critical Materials
              </h3>
              <ul className="space-y-0.5 text-xs text-slate-700 leading-snug">
                <li>• <strong>600kg</strong> NdFeB per turbine</li>
                <li>• China: <strong>~90%</strong> of supply</li>
                <li>• Recycling: <strong>&lt;1%</strong> globally</li>
                <li>• Mining 1 ton → <strong>2,000 tons</strong> toxic waste</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
