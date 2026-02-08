// YeboMart Admin API Client
const API_URL = import.meta.env.VITE_API_URL || 'https://api.yebomart.com';

class AdminApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('yebomart_admin_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('yebomart_admin_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('yebomart_admin_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
      const json = await response.json();
      if (!response.ok) return { error: json.message || 'Request failed' };
      // API wraps responses in { success, data }
      return { data: json.data };
    } catch {
      return { error: 'Network error' };
    }
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ accessToken: string; admin: any }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Map to expected format
    if (result.data) {
      return {
        data: {
          token: result.data.accessToken,
          user: result.data.admin,
        },
      };
    }
    return { error: result.error };
  }

  // Shops
  async getShops(params?: { page?: number; limit?: number; search?: string }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request<{ shops: any[]; total: number }>(`/api/admin/shops${query}`);
  }

  async getShop(id: string) {
    return this.request<any>(`/api/admin/shops/${id}`);
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request<{ users: any[]; total: number }>(`/api/admin/users${query}`);
  }

  // Subscriptions
  async getSubscriptions() {
    return this.request<any[]>('/api/admin/subscriptions');
  }

  async updateSubscription(shopId: string, data: { tier: string; expiresAt?: string }) {
    return this.request<any>(`/api/admin/subscriptions/${shopId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getDashboard() {
    return this.request<{
      totalShops: number;
      activeShops: number;
      totalRevenue: number;
      newShopsToday: number;
    }>('/api/admin/dashboard');
  }

  async getAnalytics(period: 'day' | 'week' | 'month') {
    return this.request<any>(`/api/admin/analytics?period=${period}`);
  }

  // Health
  async health() {
    return this.request<any>('/health');
  }
}

export const adminApi = new AdminApiClient();
export default adminApi;
