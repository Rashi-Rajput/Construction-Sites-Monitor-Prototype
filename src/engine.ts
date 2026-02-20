// ─────────────────────────────────────────────
// CPCB AQI BREAKPOINTS & CONSTANTS
// ─────────────────────────────────────────────

const AQI_BREAKPOINTS: Record<string, number[][]> = {
  PM25: [[0,30,0,50],[30,60,51,100],[60,90,101,200],[90,120,201,300],[120,250,301,400],[250,10000,401,500]],
  PM10: [[0,50,0,50],[50,100,51,100],[100,250,101,200],[250,350,201,300],[350,430,301,400],[430,10000,401,500]],
  NO2:  [[0,40,0,50],[40,80,51,100],[80,180,101,200],[180,280,201,300],[280,400,301,400],[400,10000,401,500]],
  CO:   [[0,1,0,50],[1,2,51,100],[2,10,101,200],[10,17,201,300],[17,34,301,400],[34,10000,401,500]],
};

const LEGAL_LIMITS: Record<string, number> = { PM25: 60, PM10: 100, NO2: 80, CO: 2 };
const BASE_AREA = 1000;

// NEW FINE STRUCTURE
// 1st & 2nd violation → Warning (no fine)
// 3rd+ violation → ₹200 each
const VIOLATION_FINE = 200;
const VIOLATION_WARNING_THRESHOLD = 2; // first 2 are warnings

// Tamper: 1st & 2nd jerk → Warning, 3rd+ → fine
const TAMPER_FINE = 500;
const TAMPER_WARNING_THRESHOLD = 2;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getSubindex(val: number, pollutant: string): number {
  const bp = AQI_BREAKPOINTS[pollutant];
  for (const [cl, ch, il, ih] of bp) {
    if (val >= cl && val <= ch) {
      return ((ih - il) / (ch - cl)) * (val - cl) + il;
    }
  }
  return 500;
}

export function calculateAQI(pm25: number, pm10: number, no2: number, co: number): number {
  return Math.max(
    getSubindex(pm25, "PM25"),
    getSubindex(pm10, "PM10"),
    getSubindex(no2, "NO2"),
    getSubindex(co, "CO")
  );
}

export function getGrade(aqi: number): string {
  if (aqi <= 100) return "A";
  if (aqi <= 200) return "B";
  if (aqi <= 300) return "C";
  return "D";
}

export function getAQICategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#84cc16";
  if (aqi <= 200) return "#eab308";
  if (aqi <= 300) return "#f97316";
  if (aqi <= 400) return "#ef4444";
  return "#7f1d1d";
}

export interface LogEntry {
  time: string;
  site: string;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  aqi: number;
  risk: number;
  anomaly: boolean;
  tamper: boolean;
  totalFines: number;
  grade: string;
  waterSpray: boolean;
  wind: number;
  humidity: number;
}

export interface AlertEntry {
  time: string;
  site: string;
  type: "violation" | "tamper" | "predictive" | "intervention" | "anomaly";
  message: string;
  corrective?: string[];
}

export interface SiteState {
  name: string;
  area: number;
  aqiHistory: number[];
  pm25History: number[];
  pm10History: number[];
  no2History: number[];
  coHistory: number[];
  violations: number;
  tamperEvents: number;
  totalFine: number;
  interventions: number;
  prevAcc: number;
  waterSpray: boolean;
  latestLog: LogEntry | null;
  anomalyCount: number;
  predictedAQI: number | null;
}

export function createSite(name: string): SiteState {
  return {
    name,
    area: rand(800, 5000),
    aqiHistory: [],
    pm25History: [],
    pm10History: [],
    no2History: [],
    coHistory: [],
    violations: 0,
    tamperEvents: 0,
    totalFine: 0,
    interventions: 0,
    prevAcc: 0,
    waterSpray: false,
    latestLog: null,
    anomalyCount: 0,
    predictedAQI: null,
  };
}

function getCorrectiveActions(pm25: number, pm10: number, no2: number, co: number, wind: number): string[] {
  const actions: string[] = [];
  if (pm10 > 150) actions.push("🔧 Activate immediate dust suppression: Spray water/mist cannons on exposed surfaces. Pause all excavation and demolition activities.");
  if (pm10 > 100 && wind > 5) actions.push("🛑 Halt all exposed earth-moving activities due to high wind-driven dust spread. Deploy wind barriers.");
  if (pm10 > 100) actions.push("🧹 Ensure all haul roads are watered every 2 hours. Cover stockpiles with tarpaulin.");
  if (pm25 > 60) actions.push("💨 Deploy fine-mist water sprays in affected zones. Switch to low-emission machinery. Cover fine material storage.");
  if (pm25 > 35) actions.push("🔄 Increase air filtration near worker zones. Use wet-cutting methods for concrete/metal work.");
  if (no2 > 100) actions.push("🚛 Immediately pause non-essential diesel engines and generators. Use electric alternatives where available.");
  if (no2 > 80) actions.push("⛽ Ensure all diesel vehicles meet BS-VI emission norms. Limit idling time to under 3 minutes.");
  if (co > 9) actions.push("🚨 CRITICAL: Turn off all indoor generators immediately. Evacuate enclosed/semi-enclosed areas. Ensure ventilation.");
  if (co > 2) actions.push("🌬️ Increase ventilation in work areas. Monitor worker health for CO exposure symptoms (headache, dizziness).");
  if (actions.length === 0) actions.push("✅ All pollutant levels within CPCB limits. Continue standard monitoring protocol.");
  return actions;
}

export function updateSite(site: SiteState, t: number): { site: SiteState; log: LogEntry; alerts: AlertEntry[] } {
  const alerts: AlertEntry[] = [];
  const hour = t % 24;
  const wind = rand(0.5, 7);
  const humidity = rand(30, 60);

  let pm25 = 40 + 30 * Math.sin(t / 10) + rand(-10, 15);
  let pm10 = 80 + 40 * Math.sin(t / 12) + rand(-15, 20);
  let no2 = 30 + 20 * Math.sin(t / 8) + rand(-5, 10);
  let co = 1.0 + 0.8 * Math.sin(t / 15) + rand(-0.2, 0.5);

  // Rush hour spikes
  if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20)) {
    pm25 += rand(20, 40);
    pm10 += rand(30, 60);
    no2 += rand(15, 30);
    co += rand(0.5, 1.5);
  }

  // Occasional heavy industrial dump
  if (Math.random() < 0.05) {
    pm25 += rand(80, 150);
    pm10 += rand(100, 200);
  }

  // Wind clearing
  pm25 *= Math.max(0.4, 3 / wind);
  pm10 *= Math.max(0.4, 3 / wind);

  // Water spray mitigation
  if (site.waterSpray) {
    pm25 *= 0.5;
    pm10 *= 0.6;
  }

  // Sensor acceleration (tamper detection)
  let acceleration = rand(-2, 2);
  if (Math.random() < 0.03) {
    acceleration += rand(15, 25);
  }

  pm25 = Math.max(0, pm25);
  pm10 = Math.max(0, pm10);
  no2 = Math.max(0, no2);
  co = Math.max(0, co);

  // Normalize by area
  const scale = site.area / BASE_AREA;
  pm25 /= scale;
  pm10 /= scale;
  no2 /= scale;
  co /= scale;
  acceleration /= scale;

  const aqi = calculateAQI(pm25, pm10, no2, co);

  // ─── NEW FINE STRUCTURE ───
  // Violation check
  const isViolation = pm25 > LEGAL_LIMITS.PM25 || pm10 > LEGAL_LIMITS.PM10 || no2 > LEGAL_LIMITS.NO2 || co > LEGAL_LIMITS.CO;
  if (isViolation) {
    site.violations += 1;
    const corrective = getCorrectiveActions(pm25, pm10, no2, co, wind);

    if (site.violations <= VIOLATION_WARNING_THRESHOLD) {
      // Warning only — no fine
      alerts.push({
        time: new Date().toLocaleTimeString(),
        site: site.name,
        type: "violation",
        message: `⚠ WARNING #${site.violations}: Legal limit exceeded — No fine (warning stage)`,
        corrective,
      });
    } else {
      // 3rd+ violation → ₹200 fine
      site.totalFine += VIOLATION_FINE;
      alerts.push({
        time: new Date().toLocaleTimeString(),
        site: site.name,
        type: "violation",
        message: `🚨 Violation #${site.violations}: Legal limit exceeded — Fine: ₹${VIOLATION_FINE} assessed (Total: ₹${site.totalFine})`,
        corrective,
      });
    }
  }

  // Tamper detection (jerk)
  const jerk = Math.abs(acceleration - site.prevAcc);
  let tamper = false;
  if (jerk > 10) {
    tamper = true;
    site.tamperEvents += 1;

    if (site.tamperEvents <= TAMPER_WARNING_THRESHOLD) {
      // Warning only — no fine
      alerts.push({
        time: new Date().toLocaleTimeString(),
        site: site.name,
        type: "tamper",
        message: `⚠ Jerk Detection #${site.tamperEvents}: Sensor movement detected — Warning issued (no fine)`,
        corrective: [
          "🔒 Inspect sensor mounting and physical security immediately.",
          "📹 Review CCTV footage for unauthorized access near sensor area.",
          "🔧 Tighten sensor brackets and re-calibrate accelerometer baseline.",
        ],
      });
    } else {
      // 3rd+ tamper → Fine
      site.totalFine += TAMPER_FINE;
      alerts.push({
        time: new Date().toLocaleTimeString(),
        site: site.name,
        type: "tamper",
        message: `🚨 SECURITY ALERT: Tampering #${site.tamperEvents} detected! Fine: ₹${TAMPER_FINE} assessed (Total: ₹${site.totalFine})`,
        corrective: [
          "🚨 MANDATORY: Site subject to immediate manual inspection by CPCB officials.",
          "🔒 Lock down sensor area. Post security personnel at all sensor locations.",
          "📹 Preserve all CCTV footage for the last 48 hours as evidence.",
          "📋 File incident report with regulatory authority within 24 hours.",
          "⚖️ Repeat offenses may result in site shutdown and criminal prosecution.",
        ],
      });
    }
  }
  site.prevAcc = acceleration;

  // Simple anomaly detection (statistical approach)
  let anomaly = false;
  if (site.aqiHistory.length > 10) {
    const recent = site.aqiHistory.slice(-10);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const std = Math.sqrt(recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length);
    if (Math.abs(aqi - mean) > 2.5 * (std || 1)) {
      anomaly = true;
      site.anomalyCount += 1;
      alerts.push({
        time: new Date().toLocaleTimeString(),
        site: site.name,
        type: "anomaly",
        message: `Anomaly detected — AQI ${aqi.toFixed(0)} deviates significantly from recent trend (mean: ${mean.toFixed(0)})`,
        corrective: [
          "🔍 Verify sensor readings with backup/portable equipment.",
          "📊 Cross-check with nearby monitoring stations for corroboration.",
          "🔧 Run sensor self-diagnostics and recalibrate if needed.",
        ],
      });
    }
  }

  const risk = Math.min(1.0, aqi / 500 + (tamper ? 0.3 : 0) + (anomaly ? 0.2 : 0));

  // Auto intervention
  if (aqi > 250 && !site.waterSpray) {
    site.waterSpray = true;
    site.interventions += 1;
    alerts.push({
      time: new Date().toLocaleTimeString(),
      site: site.name,
      type: "intervention",
      message: "Water spray system ACTIVATED — AQI exceeded 250",
      corrective: [
        "💧 Water mist cannons deployed automatically.",
        "📡 Monitoring system will auto-deactivate when AQI drops below 150.",
        "👷 Notify site supervisor of automated intervention.",
      ],
    });
  }
  if (site.waterSpray && aqi < 150) {
    site.waterSpray = false;
    alerts.push({
      time: new Date().toLocaleTimeString(),
      site: site.name,
      type: "intervention",
      message: "Water spray system DEACTIVATED — AQI dropped below 150",
      corrective: [
        "✅ Air quality returning to acceptable levels.",
        "📋 Log intervention duration and water usage for compliance report.",
      ],
    });
  }

  // Predictive alert (simplified)
  if (site.aqiHistory.length > 5) {
    const last5 = site.aqiHistory.slice(-5);
    const trend = (last5[4] - last5[0]) / 5;
    const predicted = aqi + trend * 5;
    site.predictedAQI = Math.max(0, Math.round(predicted * 100) / 100);
    if (predicted > 250) {
      const corrective = getCorrectiveActions(pm25, pm10, no2, co, wind);
      alerts.push({
        time: new Date().toLocaleTimeString(),
        site: site.name,
        type: "predictive",
        message: `Predicted AQI: ${predicted.toFixed(0)} — Preemptive action recommended`,
        corrective,
      });
    }
  } else {
    site.predictedAQI = null;
  }

  site.aqiHistory.push(aqi);
  site.pm25History.push(pm25);
  site.pm10History.push(pm10);
  site.no2History.push(no2);
  site.coHistory.push(co);

  const grade = getGrade(aqi);

  const log: LogEntry = {
    time: new Date().toLocaleTimeString(),
    site: site.name,
    pm25: Math.round(pm25 * 100) / 100,
    pm10: Math.round(pm10 * 100) / 100,
    no2: Math.round(no2 * 100) / 100,
    co: Math.round(co * 100) / 100,
    aqi: Math.round(aqi * 100) / 100,
    risk: Math.round(risk * 100) / 100,
    anomaly,
    tamper,
    totalFines: site.totalFine,
    grade,
    waterSpray: site.waterSpray,
    wind: Math.round(wind * 10) / 10,
    humidity: Math.round(humidity),
  };

  site.latestLog = log;

  return { site, log, alerts };
}

export function sustainabilityScore(site: SiteState): number {
  if (site.aqiHistory.length === 0) return 100;
  const avg = site.aqiHistory.reduce((a, b) => a + b, 0) / site.aqiHistory.length;
  return Math.max(0, 100 - avg / 5 - site.violations * 0.5 - site.tamperEvents * 5);
}
