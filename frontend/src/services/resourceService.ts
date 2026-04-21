import {
  createResource,
  deleteResource,
  fetchResourceById,
  fetchResources,
  updateResource,
} from '../api/resourcesApi';
import type { ResourceQueryFilters, ResourceUpsertRequest } from '../api/types';

export const resourceService = {
  list: (filters?: ResourceQueryFilters) => fetchResources(filters),
  getById: (id: string) => fetchResourceById(id),
  create: (payload: ResourceUpsertRequest) => createResource(payload),
  update: (id: string, payload: ResourceUpsertRequest) => updateResource(id, payload),
  delete: (id: string) => deleteResource(id),
};
