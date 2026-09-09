import { useCallback, useEffect, useState } from "react";
import type { Config } from "backend/schema";
import { fetchConfig } from "../api/client";

interface UseConfigResult {
  config: Config | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useConfig(): UseConfigResult {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchConfig()
      .then((data) => {
        if (cancelled) return;
        setConfig(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "設定の取得に失敗しました",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  return { config, loading, error, reload };
}
