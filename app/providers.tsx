"use client";

import { useState, type ReactNode } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useServerInsertedHTML } from "next/navigation";

const theme = createTheme({
  typography: {
    fontFamily: "var(--app-font-family)",
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "analytics", prepend: true });
    cache.compat = true;
    const insert = cache.insert;
    let names: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined)
        names.push(serialized.name);
      return insert(...args);
    };
    return {
      cache,
      flush: () => {
        const inserted = names;
        names = [];
        return inserted;
      },
    };
  });
  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;
    const styles = names
      .map((name) => cache.inserted[name])
      .filter((value) => typeof value === "string")
      .join("");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
