import { useMemo } from 'react';

const VisualGenerator = ({ windSpeed, magnetStrength, currentPower }) => {
  // Calculate animation speeds based on wind speed
  const turbineSpeed = useMemo(() => {
    if (windSpeed === 0) return 'paused';
    // Direct-drive turbines rotate slowly: max ~30 RPM (2 seconds per rotation)
    // Range: 10s (slow) to 2.0s (realistic max for direct-drive)
    // 2.0s = 30 RPM, which is physically accurate for offshore turbines
    const duration = Math.max(2.0, 10 - (windSpeed / 100) * 8.0);
    return `${duration}s`;
  }, [windSpeed]);

  // Calculate factory brightness (0-100%)
  const factoryBrightness = useMemo(() => {
    // Max power is now 15 MW for single turbine
    return Math.min(100, (currentPower / 15) * 100);
  }, [currentPower]);

  // Calculate window opacity based on power output
  // When 0 MW: opacity 0.2 (dark), when max power: opacity 1.0 (full brightness)
  const windowOpacity = useMemo(() => {
    const minOpacity = 0.2;
    const maxOpacity = 1.0;
    const normalizedPower = currentPower / 15; // 0 to 1
    return minOpacity + (normalizedPower * (maxOpacity - minOpacity));
  }, [currentPower]);

  // Calculate electron animation speed
  const electronSpeed = useMemo(() => {
    if (windSpeed === 0) return 'paused';
    const duration = Math.max(0.5, 3 - (windSpeed / 100) * 2.5);
    return `${duration}s`;
  }, [windSpeed]);

  // Calculate magnet glow intensity based on magnet strength
  const magnetGlowIntensity = useMemo(() => {
    return (magnetStrength / 100) * 0.8; // 0 to 1.6 opacity
  }, [magnetStrength]);

  // Determine magnet color based on strength
  const magnetColor = useMemo(() => {
    if (magnetStrength < 50) return '#ef4444'; // Weak - lighter red
    if (magnetStrength < 100) return '#dc2626'; // Standard - normal red
    return '#991b1b'; // Ultra-strong - dark red
  }, [magnetStrength]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-700 mb-2 text-center">
        The Invisible Gears: From Wind to Power
      </h2>
      
      <div className="flex-1 flex items-center">
        <svg
          viewBox="0 0 1000 300"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Animated diagram showing wind turning a turbine, magnetic field in the generator, and electricity flowing to a factory. Wind speed, magnet strength, and power output are visualized."
        >
        <defs>
          {/* Gradient for wire */}
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          
          {/* Glow filter for strong magnets */}
          <filter id="magnetGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* ===== LEFT: WIND TURBINE INPUT ===== */}
        <g id="turbine">
          {/* Tapered Tower (wider at base, narrower at top) */}
          <polygon 
            points="120,250 141,250 133,150 128,150" 
            fill="#475569"
          />
          
          {/* Tower highlight/shadow for 3D effect */}
          <polygon 
            points="128,150 133,150 133,250 130.5,250" 
            fill="#334155"
            opacity="0.4"
          />
          
          {/* Nacelle (generator housing) - more substantial */}
          <ellipse cx="130.5" cy="150" rx="28" ry="18" fill="#64748b" />
          <ellipse cx="130.5" cy="148" rx="28" ry="16" fill="#94a3b8" />
          
          {/* Rotating blades with solid shapes */}
          <g
            style={{
              transformOrigin: '130.5px 150px',
              animation: `spin ${turbineSpeed} linear infinite`,
              animationPlayState: windSpeed === 0 ? 'paused' : 'running'
            }}
          >
            {/* Blade 1 - Solid airfoil shape */}
            <path
              d="M 130.5 150 L 135 145 Q 133 90, 130.5 60 Q 128 90, 126 145 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            
            {/* Blade 2 - Rotated 120 degrees */}
            <path
              d="M 130.5 150 L 135 145 Q 133 90, 130.5 60 Q 128 90, 126 145 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
              transform="rotate(120 130.5 150)"
            />
            
            {/* Blade 3 - Rotated 240 degrees */}
            <path
              d="M 130.5 150 L 135 145 Q 133 90, 130.5 60 Q 128 90, 126 145 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
              transform="rotate(240 130.5 150)"
            />
            
            {/* Central hub */}
            <circle cx="130.5" cy="150" r="10" fill="#64748b" />
            <circle cx="130.5" cy="150" r="7" fill="#475569" />
          </g>
          
          {/* Label */}
          <text x="130.5" y="265" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="600">
            Wind Input
          </text>
        </g>

        {/* ===== ARROW 1 ===== */}
        <g>
          <line x1="200" y1="150" x2="250" y2="150" stroke="#cbd5e1" strokeWidth="3" />
          <polygon points="250,150 240,145 240,155" fill="#cbd5e1" />
        </g>

        {/* ===== MIDDLE: NEODYMIUM MAGNET & COPPER COIL ===== */}
        <g id="generator">
          {/* Copper Coil (outer ring) - TONED DOWN */}
          <ellipse cx="350" cy="150" rx="70" ry="90" fill="none" stroke="#d97706" strokeWidth="10" opacity="0.6" />
          
          {/* Rotating Neodymium Magnet */}
          <g
            style={{
              transformOrigin: '350px 150px',
              animation: `spin ${turbineSpeed} linear infinite`,
              animationPlayState: windSpeed === 0 ? 'paused' : 'running'
            }}
          >
            {/* Magnet glow effect (intensity based on magnet strength) */}
            {magnetStrength > 30 && (
              <g opacity={magnetGlowIntensity}>
                <rect
                  x="305"
                  y="125"
                  width="50"
                  height="50"
                  rx="8"
                  fill={magnetColor}
                  filter="blur(15px)"
                />
                <rect
                  x="345"
                  y="125"
                  width="50"
                  height="50"
                  rx="8"
                  fill="#94a3b8"
                  filter="blur(15px)"
                />
              </g>
            )}
            
            {/* North Pole (Red/Silver) */}
            <rect
              x="310"
              y="130"
              width="40"
              height="40"
              rx="4"
              fill={magnetColor}
              filter={magnetStrength > 100 ? 'url(#magnetGlow)' : 'none'}
            />
            <text x="330" y="155" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
              N
            </text>
            
            {/* South Pole (Silver/Dark) */}
            <rect
              x="350"
              y="130"
              width="40"
              height="40"
              rx="4"
              fill="#94a3b8"
              filter={magnetStrength > 100 ? 'url(#magnetGlow)' : 'none'}
            />
            <text x="370" y="155" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
              S
            </text>
          </g>
          
          {/* Magnetic field lines (animated waves) */}
          <g opacity={0.4 * (magnetStrength / 100)}>
            <circle cx="350" cy="150" r="50" fill="none" stroke="#3b82f6" strokeWidth="2">
              <animate
                attributeName="r"
                values="50;80;50"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          
          {/* Labels */}
          <text x="350" y="35" textAnchor="middle" fill="#dc2626" fontSize="14" fontWeight="600">
            Neodymium Magnet ({magnetStrength}%)
          </text>
          <text x="350" y="265" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="600">
            Magnetic Gears
          </text>
        </g>

        {/* ===== WIRE WITH FLOWING ELECTRONS ===== */}
        <g id="transmission">
          {/* Power line */}
          <line x1="420" y1="150" x2="650" y2="150" stroke="url(#wireGradient)" strokeWidth="4" />
          
          {/* Flowing electrons - USING YELLOW COLOR #eab308 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              r="5"
              fill="#eab308"
              filter="drop-shadow(0 0 3px #eab308)"
            >
              <animateMotion
                dur={electronSpeed}
                repeatCount="indefinite"
                path="M 420 150 L 650 150"
                begin={`${i * 0.6}s`}
              />
            </circle>
          ))}
        </g>

        {/* ===== ARROW 2 ===== */}
        <g>
          <line x1="630" y1="150" x2="680" y2="150" stroke="#cbd5e1" strokeWidth="3" />
          <polygon points="680,150 670,145 670,155" fill="#cbd5e1" />
        </g>

        {/* ===== RIGHT: FACTORY PAYLOAD ===== */}
        <g id="factory">
          {/* Factory building */}
          <rect x="720" y="100" width="200" height="100" fill="#334155" stroke="#475569" strokeWidth="2" rx="4" />
          
          {/* Windows - BRIGHT YELLOW (#FFD700) WITH DYNAMIC OPACITY */}
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={740 + col * 45}
                y={115 + row * 18}
                width="20"
                height="12"
                fill="#FFD700"
                opacity={windowOpacity}
                stroke="#64748b"
                strokeWidth="1"
              />
            ))
          )}
          
          {/* Factory glow when high power - BRIGHT YELLOW GLOW */}
          {factoryBrightness > 50 && (
            <rect
              x="715"
              y="95"
              width="210"
              height="110"
              fill="#FFD700"
              opacity={(factoryBrightness - 50) / 200}
              rx="4"
              filter="blur(10px)"
            />
          )}
          
          {/* Smokestacks */}
          <rect x="750" y="70" width="20" height="30" fill="#475569" />
          <rect x="810" y="60" width="20" height="40" fill="#475569" />
          <rect x="870" y="75" width="20" height="25" fill="#475569" />
          
          {/* Smoke (appears when generating power) */}
          {factoryBrightness > 30 && (
            <>
              <circle cx="760" cy="65" r="8" fill="#cbd5e1" opacity={factoryBrightness / 150}>
                <animate attributeName="cy" values="65;50;65" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="820" cy="55" r="10" fill="#cbd5e1" opacity={factoryBrightness / 150}>
                <animate attributeName="cy" values="55;38;55" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="880" cy="70" r="7" fill="#cbd5e1" opacity={factoryBrightness / 150}>
                <animate attributeName="cy" values="70;56;70" dur="3.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3.2s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          
          {/* Label */}
          <text x="820" y="265" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="600">
            Power to Grid
          </text>
        </g>

        {/* CSS Animation for rotation */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </svg>
      </div>
      
      {/* Pedagogical note */}
      <p className="text-center text-xs text-slate-600 mt-2 italic">
        <span className="font-semibold text-blue-600">The Bridge:</span> Neodymium magnets act as "invisible gears" 
        converting mechanical rotation into electrical flow.
      </p>
    </div>
  );
};

export default VisualGenerator;
