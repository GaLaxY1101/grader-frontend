'use client';

import {
  getTestGenerationJob,
  startTestGeneration,
  type StartTestGenerationRequest,
  type TestGenerationJobResponse,
  type TestGenerationStatus,
} from '@/lib/api/testGeneration';
import { useCallback, useEffect, useRef, useState } from 'react';

const TERMINAL: ReadonlyArray<TestGenerationStatus> = ['SUCCEEDED', 'FAILED'];

export const isTerminalStatus = (status: TestGenerationStatus | undefined): boolean =>
  status != null && TERMINAL.includes(status);

interface UseTestGenerationOptions {
  /** Poll interval while the job is pending or running. */
  intervalMs?: number;
}

/**
 * Starts an AI test generation job and polls it until it reaches SUCCEEDED or FAILED.
 * Polling uses a setTimeout chain (never overlapping requests) and stops on unmount.
 */
export const useTestGeneration = ({ intervalMs = 2000 }: UseTestGenerationOptions = {}) => {
  const [jobId, setJobId] = useState<number | null>(null);
  const [job, setJob] = useState<TestGenerationJobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const start = useCallback(async (request: StartTestGenerationRequest): Promise<void> => {
    setIsStarting(true);
    setError(null);
    setJob(null);
    setJobId(null);
    try {
      const id = await startTestGeneration(request);
      if (mountedRef.current) setJobId(id);
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : 'Failed to start');
    } finally {
      if (mountedRef.current) setIsStarting(false);
    }
  }, []);

  useEffect(() => {
    if (jobId == null) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const current = await getTestGenerationJob(jobId);
        if (cancelled) return;
        setJob(current);
        if (isTerminalStatus(current.status)) return;
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load status');
        return;
      }
      timer = setTimeout(poll, intervalMs);
    };

    timer = setTimeout(poll, intervalMs);
    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [jobId, intervalMs]);

  const status: TestGenerationStatus | 'IDLE' =
    job?.status ?? (isStarting || jobId != null ? 'PENDING' : 'IDLE');
  const isRunning =
    error == null && (isStarting || (jobId != null && !isTerminalStatus(job?.status)));

  return { start, status, job, error, isRunning };
};
