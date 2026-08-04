import { createServerClient } from '@/lib/api';

export interface TemplatesQuery {
  query?: string;
  page?: number;
  size?: number;
}

export const getTemplates = async (params: TemplatesQuery = {}) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/templates', {
    params: { query: params },
  });

  if (error) throw new Error('Failed to fetch templates');
  return data;
};

export const getTemplateById = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/templates/{id}', {
    params: { path: { id } },
  });

  if (error) throw new Error('Failed to fetch template');
  return data;
};

export const getTemplateShares = async (id: number) => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/templates/{templateId}/shares', {
    params: { path: { templateId: id } },
  });

  if (error) throw new Error('Failed to fetch template shares');
  return data;
};

export const getCurrentTeacher = async () => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/v1/teachers/me');
  if (error) return null;
  return data ?? null;
};
