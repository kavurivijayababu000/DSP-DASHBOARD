import React, { useEffect, useRef } from 'react';

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, you would initialize Mapbox here
    // For now, we'll create a placeholder with SVG
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Andhra Pradesh SDPO Map</h3>
        <p className="text-sm text-gray-600">Geographic distribution and performance heat map</p>
      </div>

      <div ref={mapContainer} className="w-full h-80 bg-gray-100 rounded-lg relative overflow-hidden">
        {/* Placeholder SVG Map of Andhra Pradesh */}
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Background */}
          <rect width="400" height="300" fill="#f3f4f6" />
          
          {/* Simplified AP State Outline */}
          <path
            d="M 50 50 L 350 50 L 350 80 L 320 120 L 340 160 L 350 200 L 300 250 L 200 240 L 150 220 L 100 200 L 80 160 L 60 120 Z"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* SDPO Locations with Performance Indicators */}
          {[
            { x: 100, y: 80, name: 'Srikakulam', performance: 95, range: 'Visakhapatnam' },
            { x: 150, y: 90, name: 'Vizianagaram', performance: 88, range: 'Visakhapatnam' },
            { x: 200, y: 100, name: 'Visakhapatnam', performance: 92, range: 'Visakhapatnam' },
            { x: 250, y: 130, name: 'Kakinada', performance: 85, range: 'Eluru' },
            { x: 200, y: 150, name: 'Eluru', performance: 90, range: 'Eluru' },
            { x: 180, y: 180, name: 'Guntur', performance: 93, range: 'Guntur' },
            { x: 220, y: 200, name: 'Nellore', performance: 87, range: 'Guntur' },
            { x: 150, y: 200, name: 'Kurnool', performance: 82, range: 'Kurnool' },
            { x: 120, y: 220, name: 'Anantapur', performance: 89, range: 'Ananthapuramu' },
            { x: 200, y: 220, name: 'Chittoor', performance: 91, range: 'Ananthapuramu' },
          ].map((location, index) => (
            <g key={index}>
              <circle
                cx={location.x}
                cy={location.y}
                r="8"
                fill={location.performance >= 90 ? '#10b981' : 
                     location.performance >= 80 ? '#f59e0b' : '#ef4444'}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
              />
              <text
                x={location.x}
                y={location.y - 15}
                textAnchor="middle"
                fontSize="10"
                fill="#374151"
                className="font-medium"
              >
                {location.name}
              </text>
              <text
                x={location.x}
                y={location.y + 20}
                textAnchor="middle"
                fontSize="8"
                fill="#6b7280"
              >
                {location.performance}%
              </text>
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(20, 240)">
            <rect x="0" y="0" width="120" height="50" fill="white" stroke="#d1d5db" rx="4" />
            <text x="5" y="15" fontSize="10" fill="#374151" fontWeight="bold">Performance</text>
            <circle cx="15" cy="25" r="4" fill="#10b981" />
            <text x="25" y="29" fontSize="8" fill="#374151">90%+ Excellent</text>
            <circle cx="15" cy="35" r="4" fill="#f59e0b" />
            <text x="25" y="39" fontSize="8" fill="#374151">80-89% Good</text>
            <circle cx="15" cy="45" r="4" fill="#ef4444" />
            <text x="25" y="49" fontSize="8" fill="#374151">&lt;80% Needs Improvement</text>
          </g>
        </svg>

        {/* Interactive Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-2">
          <button className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded">
            📍 All Ranges
          </button>
          <button className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded">
            🎯 Performance View
          </button>
          <button className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded">
            🔍 Zoom to District
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-green-600">78</p>
          <p className="text-xs text-gray-600">High Performers</p>
        </div>
        <div>
          <p className="text-lg font-bold text-yellow-600">23</p>
          <p className="text-xs text-gray-600">Average Performers</p>
        </div>
        <div>
          <p className="text-lg font-bold text-red-600">5</p>
          <p className="text-xs text-gray-600">Needs Attention</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
