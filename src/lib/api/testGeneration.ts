import { apiClient } from './client';
import type { components } from './types/index';

export type StartTestGenerationRequest = components['schemas']['StartTestGenerationRequest'];
export type TestGenerationJobResponse = components['schemas']['TestGenerationJobResponse'];
export type IterationResponse = components['schemas']['IterationResponse'];
export type TestGenerationStatus = NonNullable<TestGenerationJobResponse['status']>;

/** Backend errors use RFC 7807-style bodies; surface their `detail` when present. */
const errorDetail = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'detail' in error) {
    const detail = (error as { detail: unknown }).detail;
    if (typeof detail === 'string' && detail.trim() !== '') return detail;
  }
  return fallback;
};

/**
 * Starts an AI test generation job. Returns the job id to poll.
 * Throws with the backend message on failure (e.g. a job is already running).
 */
export const startTestGeneration = async (body: StartTestGenerationRequest): Promise<number> => {
  const { data, error } = await apiClient.POST('/api/test-generation', { body });
  if (error != null || data?.jobId == null) {
    throw new Error(errorDetail(error, 'Failed to start test generation'));
  }
  return data.jobId;
};

/**
 * Fetches the current state of a test generation job including its iterations.
 */
export const getTestGenerationJob = async (jobId: number): Promise<TestGenerationJobResponse> => {
  const { data, error } = await apiClient.GET('/api/test-generation/{jobId}', {
    params: { path: { jobId } },
  });
  if (error != null || data == null) {
    throw new Error(errorDetail(error, 'Failed to load test generation status'));
  }
  return data;
};
