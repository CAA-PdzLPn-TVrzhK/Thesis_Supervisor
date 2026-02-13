import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const milestonesService = {
  getAll: () => client.get(ENDPOINTS.MILESTONES).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.MILESTONES}?id=eq.${id}`).then(res => res.data?.[0]),
  
  create: (data) => client.post(ENDPOINTS.MILESTONES, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.MILESTONES}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.MILESTONES}?id=eq.${id}`),
};
