import { useState } from 'react';

const LandingPage = ({ onEnterSimulation }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  const openLightbox = (imageSrc, imageAlt) => {
    setLightboxImage({ src: imageSrc, alt: imageAlt });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            The Invisible Gears of Renewable Energy
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover how rare-earth Neodymium magnets act as the <i>invisible gears </i> 
             that make wind energy possible, and why they're critical to our energy future.
          </p>
        </div>

        {/* TOP ROW: The Engineering Visuals (2-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* LEFT: System Comparison (Starting Point) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
              Direct-Drive vs Gearbox Systems
            </h2>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <img 
                src="/images/system-comparison.png" 
                alt="Comparison of wind turbine systems with and without gearbox"
                className="w-full h-64 object-contain bg-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox('/images/system-comparison.png', 'Comparison of wind turbine systems with and without gearbox')}
              />
              <p className="text-center text-sm text-slate-600 mt-2 italic">
                Direct-drive systems eliminate the gearbox, relying on strong permanent magnets
              </p>
            </div>
          </div>

          {/* RIGHT: Generator Diagram */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
              Inside a Wind Turbine Generator
            </h2>
            <div className="bg-slate-50 rounded-lg p-4">
              <img 
                src="/images/generator-diagram.png" 
                alt="Direct-Drive Permanent Magnet Generator showing rotor with neodymium magnets and copper stator windings"
                className="w-full h-64 object-contain bg-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox('/images/generator-diagram.png', 'Direct-Drive Permanent Magnet Generator showing rotor with neodymium magnets and copper stator windings')}
              />
              <p className="text-center text-sm text-slate-600 mt-2 italic">
                3D view: Neodymium magnets (red) rotate past stationary copper windings (orange)
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: The Business Reality (2-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-stretch">
          
          {/* LEFT: Critical Materials Reality */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600 h-full">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
              <span>⚠️</span> Critical Materials Reality
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-slate-800 font-semibold mb-2">Per Turbine Requirements:</h4>
                <ul className="space-y-1 text-slate-600 text-sm">
                  <li className="flex items-center gap-1">
                    • <strong className="text-slate-800">600kg</strong>
                    <span className="group relative inline-block">
                      <span className="text-slate-400 text-xs cursor-help">ⓘ</span>
                      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded py-1.5 px-2.5 z-10 shadow-lg">
                        Source: International Energy Agency (IEA)
                        <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                      </span>
                    </span>
                    <span>of Neodymium magnets</span>
                  </li>
                  <li>• Material cost: <strong className="text-slate-800">€50,000+</strong></li>
                  <li>• Lifespan: <strong className="text-slate-800">20-25 years</strong></li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-slate-800 font-semibold mb-2">Environmental Impact:</h4>
                <ul className="space-y-1 text-slate-600 text-sm">
                  <li className="flex items-center gap-1">
                    • Mining 1 ton → <strong className="text-slate-800">2,000 tons</strong>
                    <span className="group relative inline-block">
                      <span className="text-slate-400 text-xs cursor-help">ⓘ</span>
                      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-56 bg-slate-800 text-white text-xs rounded py-1.5 px-2.5 z-10 shadow-lg">
                        Source: Harvard International Review
                        <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                      </span>
                    </span>
                    <span>toxic waste</span>
                  </li>
                  <li className="flex items-center gap-1">
                    • Global recycling rate: <strong className="text-slate-800">&lt;1%</strong>
                    <span className="group relative inline-block">
                      <span className="text-slate-400 text-xs cursor-help">ⓘ</span>
                      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-52 bg-slate-800 text-white text-xs rounded py-1.5 px-2.5 z-10 shadow-lg">
                        Source: UN Environment Programme
                        <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                      </span>
                    </span>
                  </li>
                  <li>• Supply chain risk: <strong className="text-slate-800">High</strong></li>
                </ul>
              </div>
            </div>
            
            {/* Citation Footer */}
            <div className="border-t border-slate-200 pt-3 mt-4">
              <p className="text-xs text-slate-400 italic text-center">
                Data compiled from IEA, UNEP, and industry market reports.
              </p>
            </div>
          </div>

          {/* RIGHT: Why Magnet Strength Matters */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Why Magnet Strength Matters
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              The raw energy arriving at a turbine relies entirely on wind speed. However, because offshore turbines eliminate gearboxes to reduce maintenance costs, their blades spin incredibly slowly. To efficiently convert that slow mechanical rotation into grid-scale electricity, engineers must rely on hyper-strong rare-earth magnets.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-slate-700 font-mono mb-2">
                Available Mechanical Energy ∝ Wind Speed³
              </p>
              <p className="text-sm text-slate-700 font-mono">
                Electrical Conversion Power ∝ Magnet Strength × Rotation Speed
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Summary & CTA (Full Width) */}
        <div className="space-y-6">
          
          {/* Key Points (3-column grid) */}
          {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="text-4xl mb-3 text-center">⚡</div>
              <h3 className="text-base font-bold text-blue-700 mb-2 text-center">The Physics</h3>
              <p className="text-slate-600 text-sm text-center">
                Rotating magnets induce current in copper coils
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="text-4xl mb-3 text-center">🧲</div>
              <h3 className="text-base font-bold text-red-700 mb-2 text-center">The Material</h3>
              <p className="text-slate-600 text-sm text-center">
                <strong>Neodymium</strong> magnets are 10x stronger than standard magnets
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <div className="text-4xl mb-3 text-center">🌍</div>
              <h3 className="text-base font-bold text-yellow-700 mb-2 text-center">The Challenge</h3>
              <p className="text-slate-600 text-sm text-center">
                China: ~90% of supply. Recycling: &lt;1%
              </p>
            </div>
          </div>

          {/* Call to Action (Full Width) */}
          <div className="w-full flex justify-center mt-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 text-center max-w-4xl w-11/12">
              <h3 className="text-2xl font-bold text-white mb-3">
                See the Impact of Magnet Strength
              </h3>
              <p className="text-blue-100 mb-6 text-sm">
                See how stronger rare-earth magnets dramatically increase power output.
              </p>
              <button
                onClick={onEnterSimulation}
                className="bg-white hover:bg-slate-100 text-blue-700 font-bold text-lg px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Enter Interactive Simulation →
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-slate-500 text-sm mt-8">
          <p>Educational Tool | Team Critical Materials | HZ University of Applied Sciences</p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition-all z-10"
              aria-label="Close lightbox"
            >
              ×
            </button>
            
            {/* Image */}
            <img 
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Caption */}
            <p className="text-white text-center mt-4 text-sm">
              {lightboxImage.alt}
            </p>
            
            {/* Click anywhere to close hint */}
            <p className="text-white text-center mt-2 text-xs opacity-75">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
