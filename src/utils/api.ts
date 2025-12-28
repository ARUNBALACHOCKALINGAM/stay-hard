import { auth } from '../firebaseConfig';
import { API_URL } from './config';

export const apiClient = {
  async getAuthHeaders() {
    // Prefer locally-stored backend JWT (from local signup/signin).
    const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (localToken) {
      return {
        'Authorization': `Bearer ${localToken}`,
        'Content-Type': 'application/json',
      };
    }

    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    return {
      'Authorization': `Bearer ${token ?? ''}`,
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

  async patch(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
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