import { createServerClient } from '@/lib/api';

interface GetUsersParams {
  query?: string;
  page?: number;
  size?: number;
}

export const getUsers = async ({ query, page = 0, size = 20 }: GetUsersParams = {}) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/v1/users', {
    params: { query: { query, page, size } },
  });
  if (error) throw new Error('Failed to fetch users');
  return data;
};

export const getUserEmails = async () => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/v1/users/emails');
  if (error) throw new Error('Failed to fetch user emails');
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
