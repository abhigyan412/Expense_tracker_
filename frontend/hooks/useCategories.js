"use client";

import { useState, useCallback, useEffect } from "react";
import { getCategories, createCategory } from "@/lib/api";

export default function useCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getCategories());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (name) => {
    await createCategory(name);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is the intended shape of this hook
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, create };
}
