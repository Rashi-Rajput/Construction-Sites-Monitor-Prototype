import { useState } from "react";
import { BarChart3, Shield, Lock, User, AlertCircle } from "lucide-react";

interface LoginProps {
  onLogin: (role: "gov" | "site", siteName?: string) => void;
}

const CREDENTIALS: Record<string, { password: string; role: "gov" | "site"; siteName?: string }> = {
  GOV: { password: "GOV@123", role: "gov" },
  Site_Alpha: { password: "alpha@123", role: "site", siteName: "Site_Alpha" },
  Site_Beta: { password: "beta@123", role: "site", siteName: "Site_Beta" },
  Site_Gamma: { password: "gamma@123", role: "site", siteName: "Site_Gamma" },
};

export function LoginPage({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cred = CREDENTIALS[username];
    if (cred && cred.password === password) {
      setError("");
      onLogin(cred.role, cred.siteName);
    } else {
      setError("Invalid credentials. Please try again.");
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-gray-700 rounded-full"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Government Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600/20 border-2 border-emerald-500/30 rounded-2xl mb-4">
            <BarChart3 size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Delhi Construction Sites Monitor
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Air Quality Monitoring System — Delhi NCR
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield size={12} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-widest">
              Secure Access Portal
            </span>
            <Shield size={12} className="text-emerald-500" />
          </div>
        </div>

        {/* Login Card */}
        <div
          key={shakeKey}
          className={`bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl ${
            error ? "animate-[shake_0.5s_ease-in-out]" : ""
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Site Name / User ID
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. GOV, Site_Alpha, Site_Beta..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Lock size={14} />
              Authenticate & Login
            </button>
          </form>
        </div>

        {/* Credentials Help */}
        <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
            Authorized Credentials
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-gray-300 font-semibold">Government</span>
              </div>
              <span className="font-mono text-gray-500">GOV / GOV@123</span>
            </div>
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="text-gray-300 font-semibold">Site Alpha</span>
              </div>
              <span className="font-mono text-gray-500">
                Site_Alpha / alpha@123
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-gray-300 font-semibold">Site Beta</span>
              </div>
              <span className="font-mono text-gray-500">
                Site_Beta / beta@123
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full" />
                <span className="text-gray-300 font-semibold">Site Gamma</span>
              </div>
              <span className="font-mono text-gray-500">
                Site_Gamma / gamma@123
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-4">
          © 2024 CPCB — Central Pollution Control Board • Ministry of Environment
        </p>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
