import type { SiteState } from "../engine";
import { getAQIColor, getAQICategory } from "../engine";
import {
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  Navigation,
  Satellite,
  CloudRain,
} from "lucide-react";

interface SiteMeta {
  name: string;
  label: string;
  area: string;
  lat: number;
  lon: number;
  svgX: number;
  svgY: number;
  baseTemp: number;
  color: string;
  dotColor: string;
}

const SITE_META: SiteMeta[] = [
  {
    name: "Site_Alpha",
    label: "Anand Vihar",
    area: "East Delhi",
    lat: 28.6469,
    lon: 77.3164,
    svgX: 520,
    svgY: 230,
    baseTemp: 34,
    color: "#22d3ee",
    dotColor: "#06b6d4",
  },
  {
    name: "Site_Beta",
    label: "ITO Junction",
    area: "Central Delhi",
    lat: 28.6289,
    lon: 77.2411,
    svgX: 350,
    svgY: 280,
    baseTemp: 33,
    color: "#a78bfa",
    dotColor: "#8b5cf6",
  },
  {
    name: "Site_Gamma",
    label: "Dwarka Sector 8",
    area: "South-West Delhi",
    lat: 28.5921,
    lon: 77.046,
    svgX: 130,
    svgY: 370,
    baseTemp: 32,
    color: "#f472b6",
    dotColor: "#ec4899",
  },
];

// Delhi boundary approximation (simplified polygon)
const DELHI_BOUNDARY =
  "M 300,30 L 380,25 L 440,50 L 510,60 L 560,100 L 590,160 L 600,220 L 580,300 L 560,350 L 530,400 L 490,440 L 440,470 L 380,480 L 320,475 L 260,450 L 200,420 L 160,380 L 120,330 L 90,270 L 80,210 L 90,150 L 120,100 L 170,60 L 230,40 Z";

// Yamuna River path
const YAMUNA_RIVER =
  "M 520,40 Q 510,80 500,120 Q 490,160 480,190 Q 460,230 440,270 Q 420,310 410,350 Q 400,390 390,430 Q 385,460 380,490";

// Major roads
const RING_ROAD =
  "M 250,150 Q 300,130 370,140 Q 440,150 480,200 Q 510,260 490,330 Q 460,390 400,410 Q 330,420 270,390 Q 220,350 210,280 Q 210,210 250,150 Z";

const OUTER_RING =
  "M 200,90 Q 280,70 380,80 Q 480,100 540,170 Q 570,250 550,350 Q 510,430 420,460 Q 320,470 230,430 Q 160,380 140,290 Q 130,200 200,90 Z";

export function DelhiMap({ sites }: { sites: SiteState[] }) {
  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-600/20 rounded-lg">
            <Satellite size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Delhi NCR — Monitoring Sites
            </h2>
            <p className="text-xs text-gray-400">
              Real-time sensor locations across Delhi with live AQI overlay •
              CPCB Standards
            </p>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-300">
              Delhi Site Map
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-8 h-[2px] bg-yellow-600/60 inline-block" />{" "}
              Ring Road
            </span>
            <span className="flex items-center gap-1">
              <span className="w-8 h-[2px] bg-blue-500/60 inline-block" />{" "}
              Yamuna River
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />{" "}
              Monitoring Site
            </span>
          </div>
        </div>

        <div className="relative bg-gray-950 p-4">
          <svg
            viewBox="0 0 680 520"
            className="w-full max-w-3xl mx-auto"
            style={{ filter: "drop-shadow(0 0 20px rgba(16,185,129,0.05))" }}
          >
            <defs>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Pulse animation */}
              <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              {/* River gradient */}
              <linearGradient
                id="riverGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
              {/* Site-specific gradients */}
              {SITE_META.map((m, i) => (
                <radialGradient
                  key={i}
                  id={`siteGlow${i}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor={m.dotColor} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={m.dotColor} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {/* Background grid */}
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1f2937"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="680" height="520" fill="url(#grid)" />

            {/* Delhi Outer Ring Road */}
            <path
              d={OUTER_RING}
              fill="none"
              stroke="#854d0e"
              strokeWidth="1"
              strokeDasharray="8 4"
              opacity="0.3"
            />

            {/* Delhi Boundary */}
            <path
              d={DELHI_BOUNDARY}
              fill="#064e3b"
              fillOpacity="0.08"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Inner Ring Road */}
            <path
              d={RING_ROAD}
              fill="none"
              stroke="#ca8a04"
              strokeWidth="1.2"
              strokeDasharray="6 3"
              opacity="0.4"
            />

            {/* Yamuna River */}
            <path
              d={YAMUNA_RIVER}
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={YAMUNA_RIVER}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Area Labels */}
            {[
              { x: 190, y: 200, text: "North Delhi" },
              { x: 340, y: 200, text: "Central Delhi" },
              { x: 200, y: 370, text: "South Delhi" },
              { x: 450, y: 160, text: "North-East" },
              { x: 280, y: 420, text: "South-West" },
              { x: 480, y: 350, text: "Noida →" },
              { x: 100, y: 200, text: "← Gurgaon" },
            ].map((lbl, i) => (
              <text
                key={i}
                x={lbl.x}
                y={lbl.y}
                fill="#4b5563"
                fontSize="11"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {lbl.text}
              </text>
            ))}

            {/* Yamuna Label */}
            <text
              x="465"
              y="220"
              fill="#3b82f6"
              fontSize="10"
              fontFamily="sans-serif"
              opacity="0.7"
              transform="rotate(-75 465 220)"
            >
              Yamuna River
            </text>

            {/* Monitoring Sites */}
            {SITE_META.map((meta, idx) => {
              const site = sites.find((s) => s.name === meta.name);
              const currentAQI =
                site && site.aqiHistory.length > 0
                  ? site.aqiHistory[site.aqiHistory.length - 1]
                  : 0;
              const aqiColor = getAQIColor(currentAQI);

              return (
                <g key={meta.name}>
                  {/* Pulse ring */}
                  <circle
                    cx={meta.svgX}
                    cy={meta.svgY}
                    r="30"
                    fill={`url(#siteGlow${idx})`}
                  >
                    <animate
                      attributeName="r"
                      values="20;35;20"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.2;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* AQI ring */}
                  {currentAQI > 0 && (
                    <circle
                      cx={meta.svgX}
                      cy={meta.svgY}
                      r="18"
                      fill="none"
                      stroke={aqiColor}
                      strokeWidth="2"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="r"
                        values="18;24;18"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.7;0.2;0.7"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Site dot */}
                  <circle
                    cx={meta.svgX}
                    cy={meta.svgY}
                    r="8"
                    fill={meta.dotColor}
                    stroke="#111827"
                    strokeWidth="2"
                    filter="url(#glow)"
                  />

                  {/* Inner dot */}
                  <circle
                    cx={meta.svgX}
                    cy={meta.svgY}
                    r="3"
                    fill="white"
                    opacity="0.8"
                  />

                  {/* Label box */}
                  <rect
                    x={meta.svgX + 14}
                    y={meta.svgY - 28}
                    width="130"
                    height="56"
                    rx="6"
                    fill="#111827"
                    fillOpacity="0.92"
                    stroke={meta.dotColor}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                  {/* Site name */}
                  <text
                    x={meta.svgX + 22}
                    y={meta.svgY - 13}
                    fill={meta.color}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {meta.name.replace("_", " ")}
                  </text>
                  {/* Location */}
                  <text
                    x={meta.svgX + 22}
                    y={meta.svgY + 1}
                    fill="#9ca3af"
                    fontSize="9"
                    fontFamily="sans-serif"
                  >
                    📍 {meta.label}
                  </text>
                  {/* AQI value */}
                  <text
                    x={meta.svgX + 22}
                    y={meta.svgY + 18}
                    fill={currentAQI > 0 ? aqiColor : "#6b7280"}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    AQI: {currentAQI > 0 ? currentAQI.toFixed(0) : "—"}
                  </text>

                  {/* Connector line */}
                  <line
                    x1={meta.svgX + 8}
                    y1={meta.svgY}
                    x2={meta.svgX + 14}
                    y2={meta.svgY}
                    stroke={meta.dotColor}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                </g>
              );
            })}

            {/* Delhi label */}
            <text
              x="340"
              y="500"
              fill="#6b7280"
              fontSize="12"
              fontFamily="sans-serif"
              textAnchor="middle"
              fontWeight="bold"
            >
              NCT OF DELHI — Government AI Air Quality Monitoring Network
            </text>

            {/* Compass */}
            <g transform="translate(620, 60)">
              <circle
                r="22"
                fill="#111827"
                stroke="#374151"
                strokeWidth="1"
              />
              <text
                y="-8"
                fill="#d1d5db"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                N
              </text>
              <polygon
                points="0,-16 -4,-6 4,-6"
                fill="#ef4444"
                opacity="0.8"
              />
              <polygon points="0,16 -4,6 4,6" fill="#6b7280" opacity="0.6" />
              <text
                y="16"
                fill="#6b7280"
                fontSize="7"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                S
              </text>
              <text
                x="12"
                y="2"
                fill="#6b7280"
                fontSize="7"
                textAnchor="middle"
              >
                E
              </text>
              <text
                x="-12"
                y="2"
                fill="#6b7280"
                fontSize="7"
                textAnchor="middle"
              >
                W
              </text>
            </g>

            {/* Scale bar */}
            <g transform="translate(50, 490)">
              <line
                x1="0"
                y1="0"
                x2="80"
                y2="0"
                stroke="#6b7280"
                strokeWidth="1.5"
              />
              <line
                x1="0"
                y1="-4"
                x2="0"
                y2="4"
                stroke="#6b7280"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="-4"
                x2="80"
                y2="4"
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text x="40" y="12" fill="#6b7280" fontSize="8" textAnchor="middle">
                ~10 km
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Environmental Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SITE_META.map((meta) => {
          const site = sites.find((s) => s.name === meta.name);
          const log = site?.latestLog;

          // Generate plausible environmental data
          const temp = log
            ? meta.baseTemp + Math.sin(Date.now() / 50000) * 3
            : meta.baseTemp;
          const humidity = log ? log.humidity : 45;
          const windSpeed = log ? log.wind : 3.5;

          const currentAQI =
            site && site.aqiHistory.length > 0
              ? site.aqiHistory[site.aqiHistory.length - 1]
              : 0;

          return (
            <div
              key={meta.name}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              style={{ borderTopColor: meta.dotColor, borderTopWidth: "2px" }}
            >
              {/* Site Header */}
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: meta.dotColor }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {meta.name.replace("_", " ")}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {meta.label}, {meta.area}
                      </p>
                    </div>
                  </div>
                  {currentAQI > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        color: getAQIColor(currentAQI),
                        backgroundColor: getAQIColor(currentAQI) + "18",
                      }}
                    >
                      {getAQICategory(currentAQI)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* GPS Coordinates */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Navigation
                      size={13}
                      className="text-emerald-400"
                    />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      GPS Location
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500">Latitude</p>
                      <p className="text-sm font-mono font-bold text-emerald-400">
                        {meta.lat.toFixed(4)}° N
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Longitude</p>
                      <p className="text-sm font-mono font-bold text-emerald-400">
                        {meta.lon.toFixed(4)}° E
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5 font-mono">
                    Elev: ~220m ASL • Zone: UTC+5:30
                  </p>
                </div>

                {/* Environmental Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <EnvironmentMetric
                    icon={<Thermometer size={14} />}
                    label="Temp"
                    value={`${temp.toFixed(1)}°C`}
                    subtext={
                      temp > 35
                        ? "Hot"
                        : temp > 28
                        ? "Warm"
                        : "Mild"
                    }
                    color={
                      temp > 38
                        ? "text-red-400"
                        : temp > 33
                        ? "text-orange-400"
                        : "text-yellow-400"
                    }
                    bgColor={
                      temp > 38
                        ? "bg-red-950/30"
                        : temp > 33
                        ? "bg-orange-950/30"
                        : "bg-yellow-950/30"
                    }
                  />
                  <EnvironmentMetric
                    icon={<Droplets size={14} />}
                    label="Humidity"
                    value={`${humidity.toFixed(0)}%`}
                    subtext={
                      humidity > 60
                        ? "Humid"
                        : humidity > 40
                        ? "Normal"
                        : "Dry"
                    }
                    color="text-blue-400"
                    bgColor="bg-blue-950/30"
                  />
                  <EnvironmentMetric
                    icon={<Wind size={14} />}
                    label="Wind"
                    value={`${windSpeed.toFixed(1)}`}
                    subtext="m/s"
                    color="text-teal-400"
                    bgColor="bg-teal-950/30"
                  />
                </div>

                {/* Additional weather info */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800">
                  <span className="flex items-center gap-1">
                    <CloudRain size={10} />
                    Precip: 0%
                  </span>
                  <span>
                    Visibility:{" "}
                    {currentAQI > 200
                      ? "Poor"
                      : currentAQI > 100
                      ? "Moderate"
                      : "Good"}
                  </span>
                  <span>UV Index: {temp > 35 ? "High" : "Moderate"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Legend & Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Monitoring Network Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {SITE_META.map((meta) => (
            <div
              key={meta.name}
              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: meta.dotColor }}
                />
                <span className="font-semibold text-gray-200">
                  {meta.name.replace("_", " ")}
                </span>
              </div>
              <div className="space-y-1 text-gray-400">
                <p>
                  <span className="text-gray-500">Location:</span>{" "}
                  {meta.label}
                </p>
                <p>
                  <span className="text-gray-500">Region:</span> {meta.area}
                </p>
                <p className="font-mono text-[10px]">
                  <span className="text-gray-500">GPS:</span> {meta.lat}°N,{" "}
                  {meta.lon}°E
                </p>
                <p>
                  <span className="text-gray-500">Sensors:</span> PM2.5, PM10,
                  NO₂, CO, Accelerometer
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnvironmentMetric({
  icon,
  label,
  value,
  subtext,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-2.5 text-center`}>
      <div className={`${color} flex justify-center mb-1`}>{icon}</div>
      <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-500">{subtext}</p>
    </div>
  );
}
