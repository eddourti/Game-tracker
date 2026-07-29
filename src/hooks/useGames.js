import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured, getSyncCode, setSyncCode } from "../lib/supabase";

const STORAGE_KEY = "game-tracker:games:v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load saved games", e);
    return [];
  }
}

function toRow(game, syncCode) {
  return {
    sync_code: syncCode,
    title: game.title || "",
    platform: game.platform || "PC",
    category: game.category || "Uncategorized",
    status: game.status || "Backlog",
    progress: game.progress || 0,
    rating: game.rating || 0,
    playtime: String(game.playtime ?? ""),
    achievements: game.achievements || "",
    cover_image: game.coverImage || "",
    release_year: game.releaseYear || "",
    description: game.description || "",
    genres: game.genres || [],
    session_log: game.sessionLog || [],
    created_at: game.createdAt || Date.now(),
    updated_at: Date.now(),
  };
}

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    category: row.category,
    status: row.status,
    progress: row.progress,
    rating: row.rating,
    playtime: row.playtime,
    achievements: row.achievements || "",
    coverImage: row.cover_image,
    releaseYear: row.release_year,
    description: row.description,
    genres: row.genres || [],
    sessionLog: row.session_log || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useGames() {
  const [games, setGames] = useState(isSupabaseConfigured ? [] : loadLocal);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [syncCode, setSyncCodeState] = useState(
    isSupabaseConfigured ? getSyncCode() : null
  );

  const loadFromSupabase = useCallback(async (code) => {
    setLoading(true);
    setSaveError(null);
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("sync_code", code)
      .order("updated_at", { ascending: false });
    if (error) {
      console.error(error);
      setSaveError("Couldn't reach the database. Check your Supabase setup.");
    } else {
      setGames((data || []).map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && syncCode) {
      loadFromSupabase(syncCode);
    }
  }, [isSupabaseConfigured, syncCode, loadFromSupabase]);

  // Local (no Supabase) persistence
  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
      if (saveError) setSaveError(null);
    } catch (e) {
      console.error("Failed to save games", e);
      setSaveError(
        "Couldn't save your last change — your browser storage may be full or blocked."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games]);

  const addGame = useCallback(
    async (game) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("games")
          .insert(toRow(game, syncCode))
          .select()
          .single();
        if (error) {
          console.error(error);
          setSaveError("Couldn't save that game to the database.");
          return;
        }
        setGames((prev) => [fromRow(data), ...prev]);
      } else {
        setGames((prev) => [
          {
            id: uid(),
            title: "",
            category: "Uncategorized",
            status: "Backlog",
            progress: 0,
            rating: 0,
            playtime: "",
            achievements: "",
            coverImage: "",
            platform: "PC",
            releaseYear: "",
            description: "",
            genres: [],
            sessionLog: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...game,
          },
          ...prev,
        ]);
      }
    },
    [syncCode]
  );

  const updateGame = useCallback(
    async (id, patch) => {
      if (isSupabaseConfigured) {
        const existing = games.find((g) => g.id === id);
        const merged = { ...existing, ...patch };
        const { data, error } = await supabase
          .from("games")
          .update(toRow(merged, syncCode))
          .eq("id", id)
          .eq("sync_code", syncCode)
          .select()
          .single();
        if (error) {
          console.error(error);
          setSaveError("Couldn't save that change to the database.");
          return;
        }
        setGames((prev) => prev.map((g) => (g.id === id ? fromRow(data) : g)));
      } else {
        setGames((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: Date.now() } : g
          )
        );
      }
    },
    [games, syncCode]
  );

  const deleteGame = useCallback(
    async (id) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("games")
          .delete()
          .eq("id", id)
          .eq("sync_code", syncCode);
        if (error) {
          console.error(error);
          setSaveError("Couldn't delete that game from the database.");
          return;
        }
      }
      setGames((prev) => prev.filter((g) => g.id !== id));
    },
    [syncCode]
  );

  const importGames = useCallback(
    async (incoming, mode = "merge") => {
      if (isSupabaseConfigured) {
        const existingTitles = new Set(
          games.map((g) => g.title.trim().toLowerCase())
        );
        const toInsert = (
          mode === "replace"
            ? incoming
            : incoming.filter(
                (g) => !existingTitles.has((g.title || "").trim().toLowerCase())
              )
        ).map((g) => toRow(g, syncCode));

        if (mode === "replace") {
          await supabase.from("games").delete().eq("sync_code", syncCode);
        }
        if (toInsert.length) {
          const { data, error } = await supabase
            .from("games")
            .insert(toInsert)
            .select();
          if (error) {
            console.error(error);
            setSaveError("Couldn't import into the database.");
            return;
          }
          setGames((prev) =>
            mode === "replace"
              ? (data || []).map(fromRow)
              : [...(data || []).map(fromRow), ...prev]
          );
        }
      } else {
        setGames((prev) => {
          if (mode === "replace") return incoming;
          const existingTitles = new Set(
            prev.map((g) => g.title.trim().toLowerCase())
          );
          const merged = [...prev];
          incoming.forEach((g) => {
            if (!existingTitles.has((g.title || "").trim().toLowerCase())) {
              merged.unshift({ ...g, id: g.id || uid() });
            }
          });
          return merged;
        });
      }
    },
    [games, syncCode]
  );

  const switchSyncCode = useCallback((code) => {
    setSyncCode(code);
    const clean = code.trim().toUpperCase();
    setSyncCodeState(clean);
  }, []);

  return {
    games,
    saveError,
    loading,
    addGame,
    updateGame,
    deleteGame,
    importGames,
    syncEnabled: isSupabaseConfigured,
    syncCode,
    switchSyncCode,
  };
}
