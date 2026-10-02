import type { TestGenerationJobResponse } from '@/lib/api/testGeneration';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTestGeneration } from './useTestGeneration';

vi.mock('@/lib/api/testGeneration', () => ({
  startTestGeneration: vi.fn(),
  getTestGenerationJob: vi.fn(),
}));

const api = await import('@/lib/api/testGeneration');
const startMock = vi.mocked(api.startTestGeneration);
const getJobMock = vi.mocked(api.getTestGenerationJob);

const request = {
  language: 'PYTHON' as const,
  taskDescription: 'Add two numbers.',
  referenceSolution: 'def add(a, b):\n    return a + b\n',
};

const job = (
  status: TestGenerationJobResponse['status'],
  iterations = 0,
): TestGenerationJobResponse => ({
  id: 7,
  status,
  iterations: Array.from({ length: iterations }, (_, i) => ({
    iterationNo: i,
    promptType: 'GENERATE',
  })),
  finalTestContent: status === 'SUCCEEDED' ? 'def test_a():\n    assert True\n' : undefined,
});

/** Advances fake time by one poll interval and lets the pending promise chain settle. */
const tick = async (ms = 2000) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe('useTestGeneration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    startMock.mockReset();
    getJobMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle', () => {
    const { result } = renderHook(() => useTestGeneration());

    expect(result.current.status).toBe('IDLE');
    expect(result.current.isRunning).toBe(false);
    expect(startMock).not.toHaveBeenCalled();
  });

  it('polls until the job succeeds, then stops polling', async () => {
    startMock.mockResolvedValue(7);
    getJobMock
      .mockResolvedValueOnce(job('RUNNING', 1))
      .mockResolvedValueOnce(job('RUNNING', 2))
      .mockResolvedValueOnce(job('SUCCEEDED', 2));
    const { result } = renderHook(() => useTestGeneration());

    await act(async () => {
      await result.current.start(request);
    });
    expect(startMock).toHaveBeenCalledWith(request);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.status).toBe('PENDING');

    await tick();
    expect(result.current.status).toBe('RUNNING');
    expect(result.current.job?.iterations).toHaveLength(1);

    await tick();
    await tick();
    expect(result.current.status).toBe('SUCCEEDED');
    expect(result.current.isRunning).toBe(false);
    expect(result.current.job?.finalTestContent).toContain('def test_a');

    await tick();
    await tick();
    expect(getJobMock).toHaveBeenCalledTimes(3);
  });

  it('stops polling when the job fails', async () => {
    startMock.mockResolvedValue(7);
    getJobMock.mockResolvedValue({ ...job('FAILED'), errorMessage: 'No valid test file' });
    const { result } = renderHook(() => useTestGeneration());

    await act(async () => {
      await result.current.start(request);
    });
    await tick();
    await tick();

    expect(result.current.status).toBe('FAILED');
    expect(result.current.job?.errorMessage).toBe('No valid test file');
    expect(getJobMock).toHaveBeenCalledTimes(1);
  });

  it('stops polling on unmount', async () => {
    startMock.mockResolvedValue(7);
    getJobMock.mockResolvedValue(job('RUNNING'));
    const { result, unmount } = renderHook(() => useTestGeneration());

    await act(async () => {
      await result.current.start(request);
    });
    await tick();
    expect(getJobMock).toHaveBeenCalledTimes(1);

    unmount();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(getJobMock).toHaveBeenCalledTimes(1);
  });

  it('exposes the error when the job cannot be started', async () => {
    startMock.mockRejectedValue(new Error('A test generation job is already running'));
    const { result } = renderHook(() => useTestGeneration());

    await act(async () => {
      await result.current.start(request);
    });

    expect(result.current.error).toBe('A test generation job is already running');
    expect(result.current.isRunning).toBe(false);
    expect(result.current.status).toBe('IDLE');
    await tick();
    expect(getJobMock).not.toHaveBeenCalled();
  });
});
