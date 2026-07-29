let XLSX = null;
async function loadXLSX() {
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
}

function normalizeRow(row) {
  const clean = {};
  for (const key in row) {
    clean[key.trim().toLowerCase()] = row[key];
  }
  return clean;
}

function findValue(row, patterns) {
  for (const key in row) {
    if (patterns.some((p) => p.test(key))) {
      const val = row[key];
      if (val !== "" && val !== undefined && val !== null) return val;
    }
  }
  return "";
}

function mapPlatform(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("ps5") || s.includes("playstation 5")) return "PlayStation 5";
  if (s.includes("ps4") || s.includes("playstation 4")) return "PlayStation 4";
  if (s.includes("xbox series")) return "Xbox Series X|S";
  if (s.includes("xbox")) return "Xbox One";
  if (s.includes("switch")) return "Nintendo Switch";
  if (s.includes("mobile") || s.includes("ios") || s.includes("android")) return "Mobile";
  if (s) return "PC";
  return "PC";
}

function mapStatus(statusRaw, abandonedRaw) {
  if (String(abandonedRaw).trim().toLowerCase() === "yes") return "Dropped";
  const s = String(statusRaw || "").toLowerCase();
  if (s.includes("complet")) return "Finished";
  if (s.includes("progress")) return "Playing";
  if (s.includes("drop") || s.includes("abandon")) return "Dropped";
  return "Backlog";
}

function mapProgress(progressRaw, status) {
  const n = parseFloat(progressRaw);
  if (!isNaN(n)) return n <= 1 ? Math.round(n * 100) : Math.round(n);
  return status === "Finished" ? 100 : 0;
}

function mapHours(raw) {
  const n = parseFloat(String(raw || "").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? "" : String(n);
}

function mapAchievements(raw) {
  if (raw instanceof Date) return ""; // bad source data, e.g. a misentered date
  const s = String(raw ?? "").trim();
  return s;
}

function mapReleaseYear(raw) {
  if (raw instanceof Date) return String(raw.getFullYear());
  const n = parseFloat(raw);
  if (!isNaN(n) && n > 1900 && n < 2100) return String(Math.floor(n));
  return "";
}

function rowToGame(rawRow) {
  const row = normalizeRow(rawRow);

  const title = String(
    findValue(row, [/^game\b/, /^title\b/, /^name\b/]) || ""
  ).trim();
  if (!title) return null;

  const genreRaw = String(findValue(row, [/genre/]) || "");
  const genres = genreRaw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const statusRaw = findValue(row, [/^status\b/]);
  const abandonedRaw = findValue(row, [/abandon/]);
  const status = mapStatus(statusRaw, abandonedRaw);

  const progressRaw = findValue(row, [/^progress\s*$/]);
  const progress = mapProgress(progressRaw, status);

  const hoursRaw = findValue(row, [/hours/]);
  const achievementsRaw = findValue(row, [/achievement/]);
  const releasedRaw = findValue(row, [/^released/]);
  const platformRaw = findValue(row, [/^platform/]);

  return {
    title,
    category: genres[0] || "Uncategorized",
    genres,
    platform: mapPlatform(platformRaw),
    status,
    progress,
    rating: 0,
    playtime: mapHours(hoursRaw),
    achievements: mapAchievements(achievementsRaw),
    releaseYear: mapReleaseYear(releasedRaw),
    coverImage: "",
    description: "",
    sessionLog: [],
  };
}

export async function getSheetNames(arrayBuffer) {
  const XLSX = await loadXLSX();
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  return wb.SheetNames;
}

export async function parseSpreadsheet(arrayBuffer, sheetName) {
  const XLSX = await loadXLSX();
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const name = sheetName || wb.SheetNames[0];
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows.map(rowToGame).filter(Boolean);
}
