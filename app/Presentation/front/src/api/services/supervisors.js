import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const supervisorsService = {
  getAll: () => client.get(ENDPOINTS.SUPERVISORS).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.SUPERVISORS}?id=eq.${id}`).then(res => res.data?.[0]),
  
  create: (data) => client.post(ENDPOINTS.SUPERVISORS, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.SUPERVISORS}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.SUPERVISORS}?id=eq.${id}`),
  
  deleteMany: (ids) => Promise.all(ids.map(id => client.delete(`${ENDPOINTS.SUPERVISORS}?id=eq.${id}`))),
};
