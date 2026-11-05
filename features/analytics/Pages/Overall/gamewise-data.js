// Load the raw per-game rows once; both comparison popups derive their series
// from this shared batch. A failed game should not hide the successful ones.
export async function loadGameWiseRows(games, query, get) {
  const entries = await Promise.all(games.map(async (game) => {
    try {
      const response = await get(`stackoverflow/${query || "AI"}/${game.id}`);
      return [game.id, {
        rows: Array.isArray(response.data) ? response.data : [],
        error: "",
      }];
    } catch {
      return [game.id, { rows: [], error: "Unable to load data" }];
    }
  }));

  return {
    rows: Object.fromEntries(entries),
    error: entries.some(([, entry]) => entry.error)
      ? "Some game wise data could not be loaded."
      : "",
  };
}
