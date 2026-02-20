import type { LogEntry } from "../engine";
import { getAQIColor } from "../engine";
import { Database } from "lucide-react";

export function DatabaseLogs({ logs }: { logs: LogEntry[] }) {
  const reversed = [...logs].reverse();

  return (
    <div className="space-y-4">
      {/* Schema Display */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-gray-300">
            SQLite Table Schema
          </h3>
        </div>
        <div className="bg-black/50 rounded-lg p-3 font-mono text-xs text-emerald-400">
          CREATE TABLE logs(time TEXT, site TEXT, pm25 REAL, pm10 REAL, no2 REAL, co REAL, aqi REAL, risk REAL, anomaly INTEGER, tamper INTEGER, total_fines REAL, grade TEXT)
        </div>
        <p className="text-[10px] text-gray-500 mt-2">
          Total records: {logs.length} • Showing latest 200
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                {[
                  "Time",
                  "Site",
                  "PM2.5",
                  "PM10",
                  "NO₂",
                  "CO",
                  "AQI",
                  "Risk",
                  "Anomaly",
                  "Tamper",
                  "Fines",
                  "Grade",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-gray-400 font-semibold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {reversed.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    No data yet. Start the simulation.
                  </td>
                </tr>
              ) : (
                reversed.map((log, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap font-mono">
                      {log.time}
                    </td>
                    <td className="px-3 py-2 text-gray-200 font-medium">
                      {log.site}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        log.pm25 > 60 ? "text-red-400" : "text-gray-300"
                      }`}
                    >
                      {log.pm25.toFixed(1)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        log.pm10 > 100 ? "text-red-400" : "text-gray-300"
                      }`}
                    >
                      {log.pm10.toFixed(1)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        log.no2 > 80 ? "text-red-400" : "text-gray-300"
                      }`}
                    >
                      {log.no2.toFixed(1)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        log.co > 2 ? "text-red-400" : "text-gray-300"
                      }`}
                    >
                      {log.co.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="font-bold font-mono"
                        style={{ color: getAQIColor(log.aqi) }}
                      >
                        {log.aqi.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-300">
                      {(log.risk * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-2">
                      {log.anomaly ? (
                        <span className="text-orange-400 font-bold">⚡ Yes</span>
                      ) : (
                        <span className="text-gray-600">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {log.tamper ? (
                        <span className="text-red-400 font-bold">⚠ Yes</span>
                      ) : (
                        <span className="text-gray-600">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-red-400 font-mono font-bold">
                      ₹{log.totalFines.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="font-bold"
                        style={{ color: getAQIColor(log.aqi) }}
                      >
                        {log.grade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
