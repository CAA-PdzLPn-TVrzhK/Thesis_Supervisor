import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const newStudentsService = {
  getAll: () => client.get(ENDPOINTS.NEW_STUDENTS).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.NEW_STUDENTS}?id=eq.${id}`).then(res => res.data?.[0]),
  
  create: (data) => client.post(ENDPOINTS.NEW_STUDENTS, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.NEW_STUDENTS}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.NEW_STUDENTS}?id=eq.${id}`),
  
  deleteMany: (ids) => Promise.all(ids.map(id => client.delete(`${ENDPOINTS.NEW_STUDENTS}?id=eq.${id}`))),
};
