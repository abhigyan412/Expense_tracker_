"use client";

import { useState, useCallback, useEffect } from "react";
import { getSummary } from "@/lib/api";

export default function useSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getSummary());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is the intended shape of this hook
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
