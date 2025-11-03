import { auth } from '../firebaseConfig';
import { API_URL } from './config';

export const apiClient = {
  async getAuthHeaders() {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  async get(endpoint: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },

  async delete(endpoint: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },
};