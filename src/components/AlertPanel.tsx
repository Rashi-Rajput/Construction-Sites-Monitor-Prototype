import type { AlertEntry, SiteState } from "../engine";
import { getAQIColor, getAQICategory } from "../engine";
import {
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Droplets,
  Zap,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string; label: string }
> = {
  violation: {
    icon: <AlertTriangle size={14} />,
    color: "text-amber-400",
    bg: "bg-amber-950/50",
    border: "border-amber-900/50",
    label: "VIOLATION",
  },
  tamper: {
    icon: <ShieldAlert size={14} />,
    color: "text-red-400",
    bg: "bg-red-950/50",
    border: "border-red-900/50",
    label: "TAMPER",
  },
  predictive: {
    icon: <TrendingUp size={14} />,
    color: "text-purple-400",
    bg: "bg-purple-950/50",
    border: "border-purple-900/50",
    label: "PREDICTIVE",
  },
  intervention: {
    icon: <Droplets size={14} />,
    color: "text-cyan-400",
    bg: "bg-cyan-950/50",
    border: "border-cyan-900/50",
    label: "INTERVENTION",
  },
  anomaly: {
    icon: <Zap size={14} />,
    color: "text-orange-400",
    bg: "bg-orange-950/50",
    border: "border-orange-900/50",
    label: "ANOMALY",
  },
};

const SITE_NAMES = ["Site_Alpha", "Site_Beta", "Site_Gamma"];
const SITE_COLORS: Record<string, string> = {
  Site_Alpha: "#22d3ee",
  Site_Beta: "#a78bfa",
  Site_Gamma: "#f472b6",
};

export function AlertPanel({
  alerts,
  role,
  loggedSite,
  sites,
}: {
  alerts: AlertEntry[];
  role: "gov" | "site";
  loggedSite?: string;
  sites: SiteState[];
}) {
  if (role === "gov") {
    return <GovAlertView alerts={alerts} sites={sites} />;
  }
  const mySite = sites.find((s) => s.name === loggedSite);
  const myAlerts = alerts.filter((a) => a.site === loggedSite);
  return <SiteAlertView alerts={myAlerts} site={mySite} siteName={loggedSite || ""} />;
}

// ──────────────────────────────────────
// GOVERNMENT VIEW — 3 separate site boxes, NO corrective measures
// ──────────────────────────────────────
function GovAlertView({
  alerts,
  sites,
}: {
  alerts: AlertEntry[];
  sites: SiteState[];
}) {
  // Overall summary counts
  const totalCounts: Record<string, number> = {};
  for (const a of alerts) {
    totalCounts[a.type] = (totalCounts[a.type] || 0) + 1;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-amber-600/20 rounded-lg">
          <ShieldAlert size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-amber-300">
            Government Alert Dashboard — All Sites
          </h2>
          <p className="text-xs text-gray-400">
            Overview of alerts across all construction sites in Delhi NCR
          </p>
        </div>
      </div>

      {/* Fine Structure */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Fine Structure (CPCB Revised)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">1st Violation</p>
            <p className="text-amber-400 font-bold">⚠ Warning (₹0)</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">2nd Violation</p>
            <p className="text-amber-400 font-bold">⚠ Warning (₹0)</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">3rd+ Violation</p>
            <p className="text-red-400 font-bold">₹200 per event</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">3rd+ Tamper</p>
            <p className="text-red-400 font-bold">₹500 per event</p>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <div key={key} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
            <div className={`flex items-center gap-1.5 ${cfg.color} mb-1`}>
              {cfg.icon}
              <span className="text-[10px] font-semibold uppercase">{cfg.label}</span>
            </div>
            <p className={`text-2xl font-black ${cfg.color}`}>
              {totalCounts[key] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* 3 Site Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SITE_NAMES.map((siteName) => {
          const siteAlerts = [...alerts.filter((a) => a.site === siteName)].reverse();
          const site = sites.find((s) => s.name === siteName);
          const siteColor = SITE_COLORS[siteName] || "#9ca3af";

          // Per-site counts
          const counts: Record<string, number> = {};
          for (const a of siteAlerts) {
            counts[a.type] = (counts[a.type] || 0) + 1;
          }

          return (
            <div
              key={siteName}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col"
            >
              {/* Site Box Header */}
              <div
                className="px-4 py-3 border-b border-gray-800 flex items-center justify-between"
                style={{ borderLeftWidth: 4, borderLeftColor: siteColor }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: siteColor }}
                  />
                  <h3 className="text-sm font-bold text-white">
                    {siteName.replace("_", " ")}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-amber-400">
                    V: {site?.violations || 0}
                  </span>
                  <span className="text-red-400">
                    T: {site?.tamperEvents || 0}
                  </span>
                  <span className="text-red-300 font-bold">
                    ₹{(site?.totalFine || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mini counts row */}
              <div className="grid grid-cols-5 gap-1 p-2">
                {Object.entries(typeConfig).map(([key, cfg]) => (
                  <div key={key} className="text-center">
                    <div className={`${cfg.color} text-[9px] font-semibold`}>
                      {cfg.label.slice(0, 4)}
                    </div>
                    <div className={`${cfg.color} text-sm font-black`}>
                      {counts[key] || 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert List (no corrective measures) */}
              <div className="flex-1 max-h-[400px] overflow-y-auto divide-y divide-gray-800/50">
                {siteAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs">
                    No alerts yet
                  </div>
                ) : (
                  siteAlerts.map((alert, i) => {
                    const cfg = typeConfig[alert.type] || typeConfig.violation;
                    return (
                      <div key={i} className="px-3 py-2 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`text-[9px] font-bold uppercase ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <span className="text-[9px] text-gray-600">
                                {alert.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-snug">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// SITE VIEW — Corrective measures + Predicted AQI
// ──────────────────────────────────────
function SiteAlertView({
  alerts,
  site,
  siteName,
}: {
  alerts: AlertEntry[];
  site?: SiteState;
  siteName: string;
}) {
  const reversed = [...alerts].reverse();

  // Per-type counts
  const counts: Record<string, number> = {};
  for (const a of alerts) {
    counts[a.type] = (counts[a.type] || 0) + 1;
  }

  const currentAQI =
    site && site.aqiHistory.length > 0
      ? site.aqiHistory[site.aqiHistory.length - 1]
      : null;

  const predictedAQI = site?.predictedAQI ?? null;

  return (
    <div className="space-y-4">
      {/* Site Header */}
      <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-cyan-600/20 rounded-lg">
          <ShieldAlert size={20} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-cyan-300">
            Alerts for {siteName.replace("_", " ")}
          </h2>
          <p className="text-xs text-cyan-400/60">
            Showing alerts with corrective measures for your site
          </p>
        </div>
      </div>

      {/* Predicted AQI Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Next Predicted AQI</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current AQI */}
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
              Current AQI
            </p>
            {currentAQI !== null ? (
              <>
                <p
                  className="text-4xl font-black"
                  style={{ color: getAQIColor(currentAQI) }}
                >
                  {currentAQI.toFixed(0)}
                </p>
                <p
                  className="text-xs mt-1 font-semibold"
                  style={{ color: getAQIColor(currentAQI) }}
                >
                  {getAQICategory(currentAQI)}
                </p>
              </>
            ) : (
              <p className="text-2xl text-gray-600 font-bold">—</p>
            )}
          </div>

          {/* Arrow + Predicted */}
          <div className="bg-gray-800/50 rounded-xl p-4 text-center relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden sm:block">
              <div className="bg-gray-700 rounded-full p-1.5">
                <ArrowRight size={14} className="text-purple-400" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
              Predicted Next AQI
            </p>
            {predictedAQI !== null ? (
              <>
                <p
                  className="text-4xl font-black"
                  style={{ color: getAQIColor(predictedAQI) }}
                >
                  {predictedAQI.toFixed(0)}
                </p>
                <p
                  className="text-xs mt-1 font-semibold"
                  style={{ color: getAQIColor(predictedAQI) }}
                >
                  {getAQICategory(predictedAQI)}
                </p>
                {predictedAQI > 250 && (
                  <div className="mt-2 text-[10px] bg-red-950/50 text-red-400 rounded-lg px-2 py-1 inline-block">
                    ⚠ Danger threshold may be breached
                  </div>
                )}
                {predictedAQI > (currentAQI || 0) ? (
                  <div className="mt-1 text-[10px] text-red-400">
                    ↑ Rising trend — take preemptive action
                  </div>
                ) : (
                  <div className="mt-1 text-[10px] text-emerald-400">
                    ↓ Improving trend
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl text-gray-600 font-bold">—</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Waiting for enough data points...
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fine Structure */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Fine Structure (CPCB Revised)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">1st Violation</p>
            <p className="text-amber-400 font-bold">⚠ Warning (₹0)</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">2nd Violation</p>
            <p className="text-amber-400 font-bold">⚠ Warning (₹0)</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">3rd+ Violation</p>
            <p className="text-red-400 font-bold">₹200 per event</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">3rd+ Tamper</p>
            <p className="text-red-400 font-bold">₹500 per event</p>
          </div>
        </div>
      </div>

      {/* Summary Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <div key={key} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
            <div className={`flex items-center gap-1.5 ${cfg.color} mb-1`}>
              {cfg.icon}
              <span className="text-[10px] font-semibold uppercase">{cfg.label}</span>
            </div>
            <p className={`text-2xl font-black ${cfg.color}`}>
              {counts[key] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Alert Feed with Corrective Measures */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300">
            Alert Feed — {siteName.replace("_", " ")} ({alerts.length} total) — With Corrective Measures
          </h3>
        </div>
        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800/50">
          {reversed.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No alerts yet. Start the simulation to see alerts appear here.
            </div>
          ) : (
            reversed.map((alert, i) => (
              <AlertRowWithCorrective key={i} alert={alert} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AlertRowWithCorrective({ alert }: { alert: AlertEntry }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[alert.type] || typeConfig.violation;
  const hasCorrective = alert.corrective && alert.corrective.length > 0;

  return (
    <div className="hover:bg-gray-800/30 transition-colors">
      <div
        className={`px-4 py-3 ${hasCorrective ? "cursor-pointer" : ""}`}
        onClick={() => hasCorrective && setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold uppercase ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-[10px] text-gray-600">{alert.time}</span>
            </div>
            <p className="text-xs text-gray-300">{alert.message}</p>
          </div>
          {hasCorrective && (
            <button className={`mt-1 ${cfg.color} shrink-0`}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {expanded && hasCorrective && (
        <div className="px-4 pb-3 pl-11">
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 space-y-2">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={10} />
              Corrective Measures
            </p>
            {alert.corrective!.map((action, j) => (
              <div
                key={j}
                className="flex items-start gap-2 text-xs text-gray-300"
              >
                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
