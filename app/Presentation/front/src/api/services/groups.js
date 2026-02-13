import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const groupsService = {
  getAll: () => client.get(ENDPOINTS.GROUPS).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.GROUPS}?id=eq.${id}`).then(res => res.data?.[0]),
  
  getBySupervisor: (supervisorId) => client.get(`${ENDPOINTS.GROUPS}?supervisor_id=eq.${supervisorId}`).then(res => res.data),
  
  create: (data) => client.post(ENDPOINTS.GROUPS, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.GROUPS}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.GROUPS}?id=eq.${id}`),
  
  deleteMany: (ids) => Promise.all(ids.map(id => client.delete(`${ENDPOINTS.GROUPS}?id=eq.${id}`))),
  
  updateSupervisor: (supervisorId, data) => client.patch(`${ENDPOINTS.GROUPS}?supervisor_id=eq.${supervisorId}`, data),
};
