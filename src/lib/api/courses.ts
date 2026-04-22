import { createServerClient } from '@/lib/api';

export const getCourses = async () => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/courses');

  if (error) throw new Error('Failed to fetch courses');
  return data;
};

export const getCourseById = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/courses/{id}', {
    params: { path: { id } },
  });

  if (error) throw new Error('Failed to fetch course');
  return data;
};

export const getCourseStudents = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/courses/{id}/students', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch students');
  return data;
};

export const getCourseTeachers = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/courses/{id}/teachers', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch teachers');
  return data;
};
