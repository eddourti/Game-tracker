import { useRef, useState } from "react";
import { getSheetNames, parseSpreadsheet } from "../lib/spreadsheetImport";

export default function BackupPanel({
  games,
  onImportJSON,
  onBulkAdd,
  onUpdateGame,
  onClose,
  syncEnabled,
  syncCode,
  onSwitchSyncCode,
}) {
  const fileRef = useRef(null);
  const sheetFileRef = useRef(null);
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [copied, setCopied] = useState(false);

  const [sheetBuffer, setSheetBuffer] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [previewGames, setPreviewGames] = useState([]);
  const [sheetError, setSheetError] = useState("");
  const [importing, setImporting] = useState(false);

  const [filling, setFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState({ done: 0, total: 0 });

  const missingCoverGames = games.filter((g) => !g.coverImage || !g.description);

  async function fillMissingCovers() {
    const targets = games.filter((g) => !g.coverImage || !g.description);
    if (!targets.length) return;
    setFilling(true);
    setFillProgress({ done: 0, total: targets.length });

    let filled = 0;
    let missed = 0;

    for (let i = 0; i < targets.length; i++) {
      const game = targets[i];
      const needsCover = !game.coverImage;
      const needsDescription = !game.description;
      try {
        const res = await fetch(`/api/games-search?q=${encodeURIComponent(game.title)}`);
        const data = await res.json();
        const top = data.results?.[0];
        if (top) {
          let coverImage = game.coverImage;
          let category = game.category;
          let genres = game.genres;
          let releaseYear = game.releaseYear;
          let description = game.description;
          try {
            const detailRes = await fetch(`/api/game-details?id=${encodeURIComponent(top.id)}`);
            const detail = await detailRes.json();
            if (detailRes.ok) {
              if (needsCover) coverImage = detail.coverImage || top.image || coverImage;
              if (!genres?.length) genres = detail.genres || genres;
              if (!category || category === "Uncategorized") {
                category = detail.genres?.[0] || category;
              }
              if (!releaseYear) {
                releaseYear = detail.released ? detail.released.slice(0, 4) : releaseYear;
              }
              if (needsDescription) description = detail.description || description;
            }
          } catch (e) {
            if (needsCover) coverImage = top.image || coverImage;
          }
          if (coverImage !== game.coverImage || description !== game.description) {
            await onUpdateGame(game.id, {
              coverImage,
              category,
              genres,
              releaseYear,
              description,
            });
            filled++;
          } else {
            missed++;
          }
        } else {
          missed++;
        }
      } catch (e) {
        missed++;
      }
      setFillProgress({ done: i + 1, total: targets.length });
      // Small pause between requests so we're not hammering the search API
      await new Promise((r) => setTimeout(r, 250));
    }

    setFilling(false);
    setMessage(
      `Filled cover art for ${filled} game${filled === 1 ? "" : "s"}` +
        (missed ? `, couldn't find a match for ${missed}.` : ".")
    );
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(games, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSheetFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSheetError("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const buffer = reader.result;
        const names = await getSheetNames(buffer);
        const first = names[0];
        setSheetBuffer(buffer);
        setSheetNames(names);
        setSelectedSheet(first);
        setPreviewGames(await parseSpreadsheet(buffer, first));
      } catch (err) {
        console.error(err);
        setSheetError("Couldn't read that file — make sure it's a .xlsx or .csv.");
        setSheetBuffer(null);
        setSheetNames([]);
        setPreviewGames([]);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  async function handleSheetChange(name) {
    setSelectedSheet(name);
    if (sheetBuffer) {
      setPreviewGames(await parseSpreadsheet(sheetBuffer, name));
    }
  }

  async function handleSheetImport() {
    if (!previewGames.length) return;
    setImporting(true);
    await onBulkAdd(previewGames);
    setImporting(false);
    setMessage(
      `Imported ${previewGames.length} games from "${selectedSheet}". Cover art wasn't in your sheet — open a game and search to auto-fill it.`
    );
    setSheetBuffer(null);
    setSheetNames([]);
    setPreviewGames([]);
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("not an array");
        onImportJSON(data);
        setMessage(`Imported ${data.length} games from backup.`);
      } catch (err) {
        setMessage("That file doesn't look like a valid backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleBulkAdd() {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;
    const parsed = lines.map((title) => ({ title, category: "Uncategorized" }));
    await onBulkAdd(parsed);
    setMessage(`Added ${parsed.length} games. Open each one and use Search to auto-fill its cover art and category.`);
    setBulkText("");
  }

  function copyCode() {
    navigator.clipboard?.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function applyCode() {
    if (!codeInput.trim()) return;
    onSwitchSyncCode(codeInput);
    setCodeInput("");
    setMessage("Switched sync code — your library from that code just loaded.");
  }

  return (
    <div
      className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-ink-800 border border-ink-600 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display font-bold text-lg text-mist-50 mb-1">
          Backup & bulk add
        </h2>

        {missingCoverGames.length > 0 && (
          <div className="mb-5 p-4 bg-ink-900 border border-ink-600 rounded-lg">
            <p className="text-sm text-mist-50 font-semibold mb-1">
              {missingCoverGames.length} game{missingCoverGames.length === 1 ? "" : "s"} missing cover art or story info
            </p>
            <p className="text-xs text-mist-400 mb-3">
              Auto-search each one and fill in whatever's missing — cover
              art, story synopsis, genre, release year. Never overwrites
              anything you've already set. Takes a few seconds per game —
              don't close this while it runs.
            </p>
            <button
              type="button"
              onClick={fillMissingCovers}
              disabled={filling}
              className="w-full px-3 py-2 text-sm font-semibold bg-gold text-ink-950 rounded-lg hover:bg-gold/90 disabled:opacity-60"
            >
              {filling
                ? `Filling in… ${fillProgress.done}/${fillProgress.total}`
                : `Auto-fill ${missingCoverGames.length} games`}
            </button>
          </div>
        )}

        {syncEnabled ? (
          <div className="mb-6 p-4 bg-ink-900 border border-ink-600 rounded-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-400 mb-2">
              Your sync code
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex-1 font-mono text-lg tracking-[0.2em] text-gold bg-gold-soft px-3 py-2 rounded-lg text-center">
                {syncCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="px-3 py-2 text-xs font-semibold bg-ink-700 border border-ink-600 text-mist-50 rounded-lg hover:border-blue shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-mist-400 leading-relaxed mb-3">
              Enter this same code on another device to see this exact
              library there too. It's a shared key, not a password — anyone
              with the code can see this data, so don't share it publicly.
            </p>

            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter a code to switch..."
                className="flex-1 bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 font-mono tracking-wide focus:border-blue outline-none uppercase"
              />
              <button
                type="button"
                onClick={applyCode}
                className="px-3 py-2 text-xs font-semibold bg-ink-700 border border-ink-600 text-mist-50 rounded-lg hover:border-blue shrink-0"
              >
                Switch
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-mist-400 mb-5">
            Your data lives in this browser only. Export a backup now and then
            to avoid losing it if you clear site data or switch browsers.
          </p>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={downloadBackup}
            className="flex-1 px-3 py-2 text-sm font-medium bg-blue text-white rounded-lg hover:bg-blue/90"
          >
            Export backup (.json)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 px-3 py-2 text-sm font-medium bg-ink-700 border border-ink-600 text-mist-50 rounded-lg hover:border-mist-400"
          >
            Restore from file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        <div className="border-t border-ink-600 pt-5 mb-5">
          <label className="block text-xs font-semibold uppercase text-mist-400 mb-2">
            Import from spreadsheet (.xlsx / .csv)
          </label>
          <p className="text-xs text-mist-400 mb-3">
            Upload your own tracking sheet — it auto-detects columns like
            Title, Genre, Platform, Status, Progress, Hours, and
            Achievements. Cover art isn't in most sheets, so open each game
            after and use Search to fill that in.
          </p>

          <button
            type="button"
            onClick={() => sheetFileRef.current?.click()}
            className="w-full px-3 py-2 text-sm font-medium bg-ink-700 border border-ink-600 text-mist-50 rounded-lg hover:border-blue mb-2"
          >
            Choose .xlsx or .csv file
          </button>
          <input
            ref={sheetFileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleSheetFile}
            className="hidden"
          />

          {sheetError && (
            <p className="text-xs text-rust font-mono mb-2">{sheetError}</p>
          )}

          {sheetNames.length > 0 && (
            <div className="mt-3 p-3 bg-ink-900 border border-ink-600 rounded-lg">
              {sheetNames.length > 1 && (
                <div className="mb-3">
                  <label className="block text-[10px] font-semibold uppercase text-mist-400 mb-1">
                    Sheet
                  </label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                  >
                    {sheetNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-xs text-mist-200 mb-2">
                Found <span className="font-semibold text-gold">{previewGames.length}</span> games
                {previewGames.length > 0 && (
                  <>
                    {" "}— e.g. {previewGames.slice(0, 3).map((g) => g.title).join(", ")}
                    {previewGames.length > 3 ? ", …" : ""}
                  </>
                )}
              </p>

              <button
                type="button"
                onClick={handleSheetImport}
                disabled={!previewGames.length || importing}
                className="w-full px-3 py-2 text-sm font-semibold bg-blue text-white rounded-lg hover:bg-blue/90 disabled:opacity-50"
              >
                {importing ? "Importing…" : `Import ${previewGames.length} games`}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-ink-600 pt-5">
          <label className="block text-xs font-semibold uppercase text-mist-400 mb-2">
            Bulk add — one game title per line
          </label>
          <p className="text-xs text-mist-400 mb-2">
            Category isn't set here — open each game afterward and use the
            search box to auto-fill its real category, cover art, and info.
            Paste a list I've filtered from your screenshots here.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"Disco Elysium\nHades\nFactorio"}
            className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 mb-3 focus:border-blue outline-none resize-none font-mono"
          />
          <button
            onClick={handleBulkAdd}
            className="px-4 py-2 text-sm font-medium bg-ink-700 border border-ink-600 text-mist-50 rounded-lg hover:border-blue"
          >
            Add all
          </button>
        </div>

        {message && (
          <p className="mt-4 text-xs text-clear font-mono">{message}</p>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-mist-400 hover:text-mist-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
