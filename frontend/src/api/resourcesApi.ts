import { apiClient } from './client';
import type { Resource, ResourceQueryFilters, ResourceUpsertRequest } from './types';

export async function fetchResources(filters?: ResourceQueryFilters): Promise<Resource[]> {
  const { data } = await apiClient.get<Resource[]>('/resources', { params: filters });
  return data;
}

export async function fetchResourceById(id: string): Promise<Resource> {
  const { data } = await apiClient.get<Resource>(`/resources/${id}`);
  return data;
}

export async function createResource(payload: ResourceUpsertRequest): Promise<Resource> {
  const { data } = await apiClient.post<Resource>('/resources', payload);
  return data;
}

export async function updateResource(
  id: string,
  payload: ResourceUpsertRequest,
): Promise<Resource> {
  const { data } = await apiClient.put<Resource>(`/resources/${id}`, payload);
  return data;
}

export async function deleteResource(id: string): Promise<void> {
  await apiClient.delete(`/resources/${id}`);
}
