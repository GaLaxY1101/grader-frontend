import { createServerClient } from '@/lib/api';

export const getGroups = async () => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/groups');
  if (error) throw new Error('Failed to fetch groups');
  return data;
};

export const getGroupById = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/groups/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch group');
  return data;
};
