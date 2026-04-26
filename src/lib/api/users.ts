import { createServerClient } from '@/lib/api';

export const getUsers = async () => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/v1/users');
  if (error) throw new Error('Failed to fetch users');
  return data;
};

export const getUserById = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/v1/users/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch user');
  return data;
};
