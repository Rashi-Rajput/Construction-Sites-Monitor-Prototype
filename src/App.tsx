import { useState, useEffect, useRef, useCallback } from "react";
import {
  createSite,
  updateSite,
  getAQIColor,
  getAQICategory,
} from "./engine";
import type { SiteState, LogEntry, AlertEntry } from "./engine";
import { LiveChart } from "./components/LiveChart";
import { DelhiMap } from "./components/DelhiMap";
import { SiteCard } from "./components/SiteCard";
import { AlertPanel } from "./components/AlertPanel";
import { ESGReport } from "./components/ESGReport";
import { DatabaseLogs } from "./components/DatabaseLogs";
import { LoginPage } from "./components/LoginPage";
import {
  Activity,
  Shield,
  FileText,
  Database,
  Map,
  Play,
  Pause,
  RotateCcw,
  LogOut,
  User,
  BarChart3,
} from "lucide-react";

type TabId = "map" | "dashboard" | "alerts" | "logs" | "esg";

export function App() {
  // ─── AUTH STATE ───
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<"gov" | "site">("gov");
  const [loggedSite, setLoggedSite] = useState<string | undefined>();

  // ─── APP STATE ───
  const [sites, setSites] = useState<SiteState[]>(() => [
    createSite("Site_Alpha"),
    createSite("Site_Beta"),
    createSite("Site_Gamma"),
  ]);
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [allAlerts, setAllAlerts] = useState<AlertEntry[]>([]);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [speed, setSpeed] = useState(10000); // default 10 seconds
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const tickRef = useRef(0);
  const sitesRef = useRef(sites);

  useEffect(() => {
    sitesRef.current = sites;
  }, [sites]);

  const step = useCallback(() => {
    tickRef.current += 1;
    const t = tickRef.current;
    const newSites = [...sitesRef.current];
    const newLogs: LogEntry[] = [];
    const newAlerts: AlertEntry[] = [];

    for (let i = 0; i < newSites.length; i++) {
      const result = updateSite(newSites[i], t);
      newSites[i] = result.site;
      newLogs.push(result.log);
      newAlerts.push(...result.alerts);
    }

    setSites(newSites);
    setTick(t);
    setAllLogs((prev) => [...prev.slice(-200), ...newLogs]);
    setAllAlerts((prev) => [...prev.slice(-100), ...newAlerts]);
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(step, speed);
    return () => clearInterval(interval);
  }, [running, speed, step]);

  const reset = () => {
    setRunning(false);
    tickRef.current = 0;
    setTick(0);
    setSites([
      createSite("Site_Alpha"),
      createSite("Site_Beta"),
      createSite("Site_Gamma"),
    ]);
    setAllLogs([]);
    setAllAlerts([]);
  };

  const handleLogin = (r: "gov" | "site", siteName?: string) => {
    setRole(r);
    setLoggedSite(siteName);
    setLoggedIn(true);
    setActiveTab("map");
    if (r === "site" && siteName) {
      setSiteFilter(siteName);
    } else {
      setSiteFilter("all");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setRole("gov");
    setLoggedSite(undefined);
    setRunning(false);
    reset();
  };

  // ─── LOGIN SCREEN ───
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ─── ROLE-BASED TABS ───
  const allTabs: { id: TabId; label: string; icon: React.ReactNode; govOnly?: boolean }[] = [
    { id: "map", label: "Delhi Map", icon: <Map size={16} /> },
    { id: "dashboard", label: "Live Monitor", icon: <Activity size={16} /> },
    { id: "alerts", label: "Alerts", icon: <Shield size={16} /> },
    { id: "logs", label: "Database", icon: <Database size={16} />, govOnly: true },
    { id: "esg", label: "ESG Reports", icon: <FileText size={16} /> },
  ];

  const tabs = role === "gov"
    ? allTabs
    : allTabs.filter((t) => !t.govOnly);

  // Filter alerts/logs for site users
  const visibleAlerts = role === "site" && loggedSite
    ? allAlerts.filter((a) => a.site === loggedSite)
    : allAlerts;

  const visibleLogs = role === "site" && loggedSite
    ? allLogs.filter((l) => l.site === loggedSite)
    : allLogs;

  // For dashboard: which sites to show
  const dashboardSites = siteFilter === "all"
    ? sites
    : sites.filter((s) => s.name === siteFilter);

  // For ESG: which sites to show
  const esgSites = role === "site" && loggedSite
    ? sites.filter((s) => s.name === loggedSite)
    : sites;

  const avgAQI =
    sites.reduce((s, site) => {
      const h = site.aqiHistory;
      return s + (h.length > 0 ? h[h.length - 1] : 0);
    }, 0) / sites.length;

  const displayName = role === "gov" ? "Government Admin" : loggedSite?.replace("_", " ") || "Site User";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Delhi Construction Sites Monitor
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs bg-gray-800 rounded-lg px-3 py-2">
              <User size={12} className={role === "gov" ? "text-amber-400" : "text-cyan-400"} />
              <span className={role === "gov" ? "text-amber-400" : "text-cyan-400"}>
                {displayName}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Tick: {tick}</span>
              <span className="text-gray-600">|</span>
              <span
                style={{ color: getAQIColor(avgAQI) }}
                className="font-semibold"
              >
                Avg AQI: {avgAQI.toFixed(0)}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">{getAQICategory(avgAQI)}</span>
            </div>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs"
            >
              <option value={20000}>0.5x (20s)</option>
              <option value={10000}>1x (10s)</option>
              <option value={5000}>2x (5s)</option>
              <option value={2000}>5x (2s)</option>
            </select>
            <button
              onClick={() => setRunning(!running)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                running
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-[1400px] mx-auto px-4 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "alerts" && visibleAlerts.length > 0 && (
                <span className="ml-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {visibleAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {activeTab === "map" && <DelhiMap sites={sites} />}
        {activeTab === "dashboard" && (
          <DashboardView
            sites={sites}
            dashboardSites={dashboardSites}
            tick={tick}
            siteFilter={siteFilter}
            setSiteFilter={setSiteFilter}
            role={role}
            loggedSite={loggedSite}
          />
        )}
        {activeTab === "alerts" && (
          <AlertPanel
            alerts={allAlerts}
            role={role}
            loggedSite={loggedSite}
            sites={sites}
          />
        )}
        {activeTab === "logs" && <DatabaseLogs logs={visibleLogs} />}
        {activeTab === "esg" && <ESGReport sites={esgSites} allSites={sites} role={role} />}
      </main>
    </div>
  );
}

function DashboardView({
  sites,
  dashboardSites,
  tick,
  siteFilter,
  setSiteFilter,
  role,
  loggedSite,
}: {
  sites: SiteState[];
  dashboardSites: SiteState[];
  tick: number;
  siteFilter: string;
  setSiteFilter: (v: string) => void;
  role: "gov" | "site";
  loggedSite?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Site Filter Dropdown */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity size={20} className="text-emerald-400" />
          Live Monitor
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">View:</span>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
            disabled={role === "site"}
          >
            {role === "gov" && <option value="all">All Sites</option>}
            {role === "gov" ? (
              sites.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name.replace("_", " ")}
                </option>
              ))
            ) : (
              <option value={loggedSite}>{loggedSite?.replace("_", " ")}</option>
            )}
          </select>
        </div>
      </div>

      {/* Site Cards */}
      <div className={`grid gap-4 ${dashboardSites.length === 1 ? "grid-cols-1 max-w-lg" : "grid-cols-1 md:grid-cols-3"}`}>
        {dashboardSites.map((site) => (
          <SiteCard key={site.name} site={site} />
        ))}
      </div>

      {/* Live AQI Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" />
          Live AQI Trend {siteFilter !== "all" ? `— ${siteFilter.replace("_", " ")}` : "— All Sites"} (Scrolling Window)
        </h3>
        <LiveChart sites={dashboardSites} tick={tick} />
      </div>

      {/* Pollutant Breakdown */}
      <div className={`grid gap-4 ${dashboardSites.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {dashboardSites.map((site) => (
          <PollutantMini key={site.name} site={site} />
        ))}
      </div>
    </div>
  );
}

function PollutantMini({ site }: { site: SiteState }) {
  const log = site.latestLog;
  if (!log) return null;

  const pollutants = [
    { name: "PM2.5", value: log.pm25, limit: 60, unit: "µg/m³" },
    { name: "PM10", value: log.pm10, limit: 100, unit: "µg/m³" },
    { name: "NO₂", value: log.no2, limit: 80, unit: "µg/m³" },
    { name: "CO", value: log.co, limit: 2, unit: "mg/m³" },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-3">{site.name} — Pollutant Levels</h4>
      <div className="space-y-2">
        {pollutants.map((p) => {
          const pct = Math.min(100, (p.value / (p.limit * 2)) * 100);
          const over = p.value > p.limit;
          return (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xs w-12 text-gray-400">{p.name}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    over ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`text-xs w-20 text-right font-mono ${
                  over ? "text-red-400" : "text-gray-300"
                }`}
              >
                {p.value.toFixed(1)} {p.unit}
              </span>
              <span className="text-[10px] text-gray-500 w-16">
                Limit: {p.limit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
