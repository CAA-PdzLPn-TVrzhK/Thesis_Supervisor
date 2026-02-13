import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const usersService = {
  getAll: () => client.get(ENDPOINTS.USERS).then(res => res.data),
  
  getById: (id) => client.get(`${ENDPOINTS.USERS}?id=eq.${id}`).then(res => res.data?.[0]),
  
  getByTelegramId: (telegramId) => client.get(`${ENDPOINTS.USERS}?telegram_id=eq.${telegramId}`).then(res => res.data?.[0]),
  
  getByRole: (role) => client.get(`${ENDPOINTS.USERS}?role=eq.${role}`).then(res => res.data),
  
  create: (data) => client.post(ENDPOINTS.USERS, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  update: (id, data) => client.patch(`${ENDPOINTS.USERS}?id=eq.${id}`, data, {
    headers: { Prefer: 'return=representation' }
  }).then(res => Array.isArray(res.data) ? res.data[0] : res.data),
  
  delete: (id) => client.delete(`${ENDPOINTS.USERS}?id=eq.${id}`),
};
