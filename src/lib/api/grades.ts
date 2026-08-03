import { createServerClient } from '@/lib/api';

export const getCourseGrades = async (courseId: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/courses/{courseId}/grades', {
    params: { path: { courseId } },
  });
  if (error) throw new Error('Failed to fetch course grades');
  return data;
};
