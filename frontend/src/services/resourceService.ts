import { fetchResources, fetchResourceById, createResource, updateResource, deleteResource } from '../api/resourcesApi';

export const resourceService = {
  list: fetchResources,
  getById: fetchResourceById,
  create: createResource,
  update: updateResource,
  delete: deleteResource,
};
