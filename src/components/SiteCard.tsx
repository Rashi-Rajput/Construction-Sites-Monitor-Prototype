import { getAQIColor, getAQICategory } from "../engine";
import type { SiteState } from "../engine";
import {
  Droplets,
  Wind,
  AlertTriangle,
  Shield,
  TrendingUp,
} from "lucide-react";

export function SiteCard({ site }: { site: SiteState }) {
  const log = site.latestLog;
  const currentAQI =
    site.aqiHistory.length > 0
      ? site.aqiHistory[site.aqiHistory.length - 1]
      : 0;
  const aqiColor = getAQIColor(currentAQI);
  const category = getAQICategory(currentAQI);
  const grade = log?.grade || "—";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: aqiColor }}
          />
          <h3 className="font-bold text-sm text-white">{site.name}</h3>
        </div>
        <div
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: aqiColor + "22",
            color: aqiColor,
          }}
        >
          Grade {grade}
        </div>
      </div>

      {/* AQI Display */}
      <div className="flex items-end gap-3 mb-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Current AQI
          </p>
          <p className="text-3xl font-black" style={{ color: aqiColor }}>
            {currentAQI.toFixed(0)}
          </p>
        </div>
        <div className="pb-1">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: aqiColor + "22",
              color: aqiColor,
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <StatBox
          icon={<AlertTriangle size={12} />}
          label="Violations"
          value={site.violations.toString()}
          color="text-amber-400"
        />
        <StatBox
          icon={<Shield size={12} />}
          label="Tamper Events"
          value={site.tamperEvents.toString()}
          color="text-red-400"
        />
        <StatBox
          icon={<Droplets size={12} />}
          label="Interventions"
          value={site.interventions.toString()}
          color="text-cyan-400"
        />
        <StatBox
          icon={<TrendingUp size={12} />}
          label="Risk"
          value={log ? (log.risk * 100).toFixed(0) + "%" : "—"}
          color="text-purple-400"
        />
      </div>

      {/* Fine & Status */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <div>
          <p className="text-[10px] text-gray-500">Total Fines</p>
          <p className="text-sm font-bold text-red-400">
            ₹{site.totalFine.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {site.waterSpray && (
            <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full">
              <Droplets size={10} />
              Spray ON
            </span>
          )}
          {log && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Wind size={10} />
              {log.wind} m/s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg px-3 py-2">
      <div className={`flex items-center gap-1 ${color} mb-0.5`}>
        {icon}
        <span className="text-[10px] text-gray-400">{label}</span>
      </div>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
