import { sustainabilityScore, getGrade, getAQIColor } from "../engine";
import type { SiteState } from "../engine";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FileText, Award, AlertTriangle, Shield, TrendingDown, Trophy, Medal } from "lucide-react";

const COLORS = ["#22d3ee", "#a78bfa", "#f472b6"];

const SITE_COLORS: Record<string, string> = {
  Site_Alpha: "#22d3ee",
  Site_Beta: "#a78bfa",
  Site_Gamma: "#f472b6",
};

export function ESGReport({
  sites,
  allSites,
  role,
}: {
  sites: SiteState[];
  allSites: SiteState[];
  role: "gov" | "site";
}) {
  // Calculate rankings from ALL sites
  const rankings = [...allSites]
    .map((site) => ({
      name: site.name,
      score: sustainabilityScore(site),
      avgAQI:
        site.aqiHistory.length > 0
          ? site.aqiHistory.reduce((a, b) => a + b, 0) / site.aqiHistory.length
          : 0,
      violations: site.violations,
      tamperEvents: site.tamperEvents,
      totalFine: site.totalFine,
      grade: getGrade(
        site.aqiHistory.length > 0
          ? site.aqiHistory.reduce((a, b) => a + b, 0) / site.aqiHistory.length
          : 0
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const rankIcons = [
    <Trophy key="t" size={20} className="text-yellow-400" />,
    <Medal key="m" size={20} className="text-gray-300" />,
    <Medal key="b" size={20} className="text-amber-600" />,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <FileText size={32} className="text-emerald-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-white">
          Government Compliance & ESG Report
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          CPCB Standards • Regulatory Fines Assessment • Sustainability Scoring
        </p>
        {role === "site" && (
          <p className="text-xs text-cyan-400 mt-1">
            Showing report for your site only
          </p>
        )}
      </div>

      {/* ─── SITE RANKINGS ─── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-amber-950/30 to-gray-900">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Site Rankings — Sustainability Leaderboard
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ranked by sustainability score (higher is better)
          </p>
        </div>

        <div className="p-4">
          {rankings.length > 0 && rankings[0].score > 0 ? (
            <div className="space-y-3">
              {rankings.map((r, idx) => {
                const siteColor = SITE_COLORS[r.name] || "#9ca3af";
                const isCurrentSite = sites.some((s) => s.name === r.name);
                return (
                  <div
                    key={r.name}
                    className={`flex items-center gap-4 bg-gray-800/50 rounded-xl p-4 border transition-all ${
                      isCurrentSite && role === "site"
                        ? "border-cyan-700 ring-1 ring-cyan-700/30"
                        : "border-gray-700/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 shrink-0">
                      {idx < 3 ? (
                        rankIcons[idx]
                      ) : (
                        <span className="text-lg font-bold text-gray-400">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Site Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: siteColor }}
                        />
                        <h4 className="font-bold text-white text-sm">
                          {r.name.replace("_", " ")}
                        </h4>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            color: getAQIColor(r.avgAQI),
                            backgroundColor: getAQIColor(r.avgAQI) + "18",
                          }}
                        >
                          Grade {r.grade}
                        </span>
                        {isCurrentSite && role === "site" && (
                          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full">
                            YOUR SITE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400">
                        <span>Avg AQI: <strong className="text-gray-300">{r.avgAQI.toFixed(1)}</strong></span>
                        <span>Violations: <strong className="text-amber-400">{r.violations}</strong></span>
                        <span>Tamper: <strong className="text-red-400">{r.tamperEvents}</strong></span>
                        <span>Fines: <strong className="text-red-400">₹{r.totalFine.toLocaleString()}</strong></span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black" style={{
                        color: r.score > 70 ? "#22c55e" : r.score > 40 ? "#eab308" : "#ef4444",
                      }}>
                        {r.score.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-gray-500">/ 100</p>
                    </div>

                    {/* Score Bar */}
                    <div className="w-24 shrink-0 hidden sm:block">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(0, Math.min(100, r.score))}%`,
                            backgroundColor:
                              r.score > 70 ? "#22c55e" : r.score > 40 ? "#eab308" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Start the simulation to see site rankings
            </div>
          )}
        </div>
      </div>

      {/* Per-Site Reports */}
      {sites.map((site) => {
        const idx = allSites.findIndex((s) => s.name === site.name);
        const avg =
          site.aqiHistory.length > 0
            ? site.aqiHistory.reduce((a, b) => a + b, 0) /
              site.aqiHistory.length
            : 0;
        const score = sustainabilityScore(site);
        const grade = getGrade(avg);
        const gradeColor = getAQIColor(avg);

        // Find ranking position
        const rankPos = rankings.findIndex((r) => r.name === site.name) + 1;

        const chartData = site.aqiHistory.map((aqi, i) => ({
          t: i,
          aqi: Math.round(aqi * 100) / 100,
        }));

        return (
          <div
            key={site.name}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
          >
            {/* Report Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {site.name.replace("_", " ")} — ESG Report
                  </h3>
                  <p className="text-xs text-gray-400">
                    Site Area: {site.area.toFixed(0)} m² • Rank: #{rankPos} of {allSites.length}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {rankPos > 0 && rankPos <= 3 && (
                    <div className="text-center">
                      {rankIcons[rankPos - 1]}
                      <p className="text-[9px] text-gray-400">Rank #{rankPos}</p>
                    </div>
                  )}
                  <div
                    className="text-3xl font-black px-4 py-1 rounded-lg"
                    style={{
                      color: gradeColor,
                      backgroundColor: gradeColor + "15",
                    }}
                  >
                    {grade}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <MetricCard
                  icon={<TrendingDown size={16} />}
                  label="Average AQI"
                  value={avg.toFixed(1)}
                  color="text-blue-400"
                />
                <MetricCard
                  icon={<AlertTriangle size={16} />}
                  label="Violations"
                  value={site.violations.toString()}
                  color="text-amber-400"
                />
                <MetricCard
                  icon={<Shield size={16} />}
                  label="Tamper Events"
                  value={site.tamperEvents.toString()}
                  color="text-red-400"
                />
                <MetricCard
                  icon={<Award size={16} />}
                  label="Sustainability"
                  value={`${score.toFixed(1)}/100`}
                  color="text-emerald-400"
                />
                <div className="bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-red-400/70 uppercase">
                    Total Fines
                  </p>
                  <p className="text-lg font-black text-red-400">
                    ₹{site.totalFine.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Fine breakdown */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Fine Breakdown
                </h5>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Warnings (no fine)</p>
                    <p className="text-amber-400 font-bold">
                      {Math.min(2, site.violations)} violation{Math.min(2, site.violations) !== 1 ? "s" : ""} + {Math.min(2, site.tamperEvents)} tamper
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Violation Fines (₹200 each)</p>
                    <p className="text-red-400 font-bold">
                      {Math.max(0, site.violations - 2)} × ₹200 = ₹{Math.max(0, site.violations - 2) * 200}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tamper Fines (₹500 each)</p>
                    <p className="text-red-400 font-bold">
                      {Math.max(0, site.tamperEvents - 2)} × ₹500 = ₹{Math.max(0, site.tamperEvents - 2) * 500}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tamper Warning */}
              {site.tamperEvents > 0 && (
                <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 flex items-center gap-2">
                  <Shield size={16} className="text-red-400" />
                  <p className="text-xs text-red-300 font-medium">
                    ⚠ WARNING: Sensor Tampering Detected ({site.tamperEvents}{" "}
                    events). Site Subject to Manual Inspection.
                  </p>
                </div>
              )}

              {/* AQI Trend Chart */}
              {chartData.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                    Complete AQI Trend
                  </h4>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="t"
                          stroke="#6b7280"
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          tick={{ fontSize: 10 }}
                          domain={[0, 500]}
                        />
                        <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" />
                        <ReferenceLine y={250} stroke="#ef4444" strokeDasharray="4 4" />
                        <Line
                          type="monotone"
                          dataKey="aqi"
                          stroke={COLORS[idx >= 0 ? idx : 0]}
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Sustainability Score Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    Sustainability Score
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {score.toFixed(1)} / 100
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, score))}%`,
                      backgroundColor:
                        score > 70
                          ? "#22c55e"
                          : score > 40
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Formula: 100 − (avg_aqi/5) − (violations × 0.5) − (tamper_events × 5)
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
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
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
