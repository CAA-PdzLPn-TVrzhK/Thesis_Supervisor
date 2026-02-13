import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const newSupervisorsService = {
  getAll: () => client.get(ENDPOINTS.NEW_SUPERVISORS).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.NEW_SUPERVISORS}?id=eq.${id}`).then(res => res.data?.[0]),
  
  create: (data) => client.post(ENDPOINTS.NEW_SUPERVISORS, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.NEW_SUPERVISORS}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.NEW_SUPERVISORS}?id=eq.${id}`),
  
  deleteMany: (ids) => Promise.all(ids.map(id => client.delete(`${ENDPOINTS.NEW_SUPERVISORS}?id=eq.${id}`))),
};
