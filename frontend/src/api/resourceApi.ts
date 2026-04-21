import { apiClient } from './client';
import type { Resource } from './types';

export interface ResourceFilters {
  type?: string;
  capacityMin?: number;
  capacityMax?: number;
  location?: string;
  status?: string;
  search?: string;
}

export async function fetchResources(filters?: ResourceFilters): Promise<Resource[]> {
  const { data } = await apiClient.get<Resource[]>('/resources', { params: filters });
  return data;
}

export async function fetchResourceById(id: number): Promise<Resource> {
  const { data } = await apiClient.get<Resource>(`/resources/${id}`);
  return data;
}

export async function createResource(
  resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Resource> {
  const { data } = await apiClient.post<Resource>('/resources', resource);
  return data;
}

export async function updateResource(id: number, resource: Partial<Resource>): Promise<Resource> {
  const { data } = await apiClient.put<Resource>(`/resources/${id}`, resource);
  return data;
}

export async function deleteResource(id: number): Promise<void> {
  await apiClient.delete(`/resources/${id}`);
}
