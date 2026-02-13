import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const thesesService = {
  getAll: () => client.get(ENDPOINTS.THESES).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.THESES}?id=eq.${id}`).then(res => res.data?.[0]),
  
  create: (data) => client.post(ENDPOINTS.THESES, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.THESES}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.THESES}?id=eq.${id}`),
};
