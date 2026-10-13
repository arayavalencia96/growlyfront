import { useCallback, useEffect, useRef, useState } from "react";
import { integrationService } from "./integration.service";
import type { LinkedAllocationState } from "./allocation.types";
import { getErrorMessage } from "@/utils/error.utils";

export function useCashyContributionBudget(enabled: boolean) {
  const [state, setState] = useState<LinkedAllocationState>();
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const alive = useRef(false);
  const inFlight = useRef(false);
  const reload = useCallback(async () => {
    if (!enabled || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setState(undefined);
    setError("");
    try {
      const response = await integrationService.allocation();
      if (alive.current) setState(response.result);
    } catch (failure) {
      if (alive.current) setError(getErrorMessage(failure));
    } finally {
      inFlight.current = false;
      if (alive.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    alive.current = true;
    const initial = window.setTimeout(() => void reload(), 0);
    return () => {
      alive.current = false;
      window.clearTimeout(initial);
    };
  }, [reload]);
  return { state, loading, error };
}
