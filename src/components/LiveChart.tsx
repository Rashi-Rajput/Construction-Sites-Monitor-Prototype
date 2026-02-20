import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { SiteState } from "../engine";

const WINDOW = 50;
const COLORS = ["#22d3ee", "#a78bfa", "#f472b6"];

export function LiveChart({
  sites,
  tick,
}: {
  sites: SiteState[];
  tick: number;
}) {
  const start = Math.max(0, tick - WINDOW);
  const len = Math.min(WINDOW, tick);

  const data = [];
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    const point: Record<string, number> = { time: idx };
    for (const site of sites) {
      const siteIdx = idx;
      if (siteIdx < site.aqiHistory.length) {
        point[site.name] = Math.round(site.aqiHistory[siteIdx] * 100) / 100;
      }
    }
    data.push(point);
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
        Press "Start" to begin monitoring...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="time"
          stroke="#6b7280"
          tick={{ fontSize: 11 }}
          label={{ value: "Time (Hours)", position: "insideBottom", offset: -2, fill: "#9ca3af", fontSize: 11 }}
        />
        <YAxis
          stroke="#6b7280"
          domain={[0, 500]}
          tick={{ fontSize: 11 }}
          label={{ value: "AQI", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine
          y={100}
          stroke="#eab308"
          strokeDasharray="6 4"
          label={{ value: "Moderate", fill: "#eab308", fontSize: 10, position: "right" }}
        />
        <ReferenceLine
          y={250}
          stroke="#ef4444"
          strokeDasharray="6 4"
          label={{ value: "Danger", fill: "#ef4444", fontSize: 10, position: "right" }}
        />
        {sites.map((site, i) => (
          <Line
            key={site.name}
            type="monotone"
            dataKey={site.name}
            stroke={COLORS[i]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
