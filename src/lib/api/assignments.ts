import { createServerClient } from '@/lib/api';

export const getAssignmentsByCourse = async (courseId: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/courses/{courseId}/assignments', {
    params: { path: { courseId } },
  });
  if (error) throw new Error('Failed to fetch assignments');
  return data;
};

export const getAssignmentById = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/assignments/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch assignment');
  return data;
};
