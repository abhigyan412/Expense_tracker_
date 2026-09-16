"use client";

import { useState, useCallback, useEffect } from "react";
import { getExpenses, createExpense } from "@/lib/api";

export default function useExpenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getExpenses());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (expense) => {
    await createExpense(expense);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is the intended shape of this hook
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, create };
}
