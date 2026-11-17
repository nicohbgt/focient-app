import { useState, useMemo, useCallback } from 'react';
import type { CapacityStatus } from '@focient/contracts';

/**
 * FoCient Capacity State Store
 *
 * Tracks daily workload vs limit and manages reschedule advisory modal visibility.
 */
export function useCapacityStore(defaultCapacityMinutes = 480) {
  const [allocatedMinutes, setAllocatedMinutes] = useState(0);
  const [capacityMinutes, setCapacityMinutes] = useState(defaultCapacityMinutes);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const percentage = Math.min(
    100,
    Math.round((allocatedMinutes / Math.max(1, capacityMinutes)) * 100)
  );

  const status: CapacityStatus = useMemo(() => {
    if (percentage < 50) return 'LIGHT';
    if (percentage <= 75) return 'OPTIMAL';
    if (percentage <= 90) return 'NEAR_CAPACITY';
    return 'OVERLOAD';
  }, [percentage]);

  const handleOverloadDetected = useCallback(() => {
    setIsAlertOpen(true);
  }, []);

  const dismissAlert = useCallback(() => {
    setIsAlertOpen(false);
  }, []);

  return {
    allocatedMinutes,
    capacityMinutes,
    percentage,
    status,
    isAlertOpen,
    setAllocatedMinutes,
    setCapacityMinutes,
    handleOverloadDetected,
    dismissAlert,
  };
}
