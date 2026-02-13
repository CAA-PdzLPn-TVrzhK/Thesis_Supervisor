import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const studentsService = {
  getAll: () => client.get(ENDPOINTS.STUDENTS).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.STUDENTS}?id=eq.${id}`).then(res => res.data?.[0]),
  
  create: (data) => client.post(ENDPOINTS.STUDENTS, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.STUDENTS}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.STUDENTS}?id=eq.${id}`),
  
  deleteMany: (ids) => Promise.all(ids.map(id => client.delete(`${ENDPOINTS.STUDENTS}?id=eq.${id}`))),
};
