import {
  fetchResources,
  fetchResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../api/resourceApi';

export const resourceService = {
  list: fetchResources,
  getById: fetchResourceById,
  create: createResource,
  update: updateResource,
  delete: deleteResource,
};
