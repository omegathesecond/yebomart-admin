// YeboMart Admin API Client
const API_URL = import.meta.env.VITE_API_URL || 'https://api.yebomart.com';

// Serialize list params into a query string, dropping empty values and the
// "all" sentinel so we never send `?search=&role=all` (the server treats those
// as no-filter, but omitting them keeps URLs clean and avoids edge cases).
function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    if (value === 'all') continue;
    qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

class AdminApiClient {
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  // Register a handler invoked when an *authenticated* request comes back 401
  // (expired/invalid 24h admin JWT). AuthContext wires this to logout so the
  // app tears down the stale session and redirects to /login, instead of
  // silently showing "Request failed" on every page while still appearing
  // logged in.
  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

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
      // A 401 on a request that carried a token means the session expired or
      // was revoked. Clear it and notify the app so it redirects to /login —
      // otherwise the user stays "logged in" while every page errors out.
      // (Guarded on `token` so a failed login, which 401s without a token,
      // surfaces its own error message instead of being treated as expiry.)
      if (response.status === 401 && token) {
        this.clearToken();
        this.onUnauthorized?.();
        return { error: 'Session expired. Please log in again.' };
      }
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
    // Validate response has required fields
    if (result.data?.accessToken && result.data?.admin) {
      return {
        data: {
          token: result.data.accessToken,
          user: result.data.admin,
        },
      };
    }
    return { error: result.error || 'Invalid login response' };
  }

  // Profile (authenticated admin's own account — Settings page)
  async getProfile() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>('/api/admin/profile');
  }

  async updateProfile(payload: { name?: string; email?: string }) {
    return this.request<{
      id: string;
      email: string;
      name: string;
      role: string;
    }>('/api/admin/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.request<null>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Shops
  async getShops(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const query = buildQuery(params);
    return this.request<{ shops: any[]; total: number }>(`/api/admin/shops${query}`);
  }

  async getShop(id: string) {
    return this.request<any>(`/api/admin/shops/${id}`);
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const query = buildQuery(params);
    return this.request<{ users: any[]; total: number }>(`/api/admin/users${query}`);
  }

  async getUserDetail(userId: string, days: number = 30) {
    return this.request<any>(`/api/admin/users/${userId}?days=${days}`);
  }

  // Shop status breakdown (formerly "subscriptions" — tiers were removed;
  // returns one entry per shop status with a count).
  async getSubscriptions() {
    return this.request<{ status: string; _count: number }[]>('/api/admin/subscriptions');
  }

  async updateShopStatus(shopId: string, status: 'active' | 'suspended') {
    return this.request<any>(`/api/admin/shops/${shopId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteShop(shopId: string) {
    return this.request<void>(`/api/admin/shops/${shopId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getDashboard() {
    return this.request<{
      totalShops: number;
      activeShops: number;
      totalRevenue: number;
      newShopsToday: number;
      chartData: { name: string; shops: number; revenue: number }[];
      recentActivity: {
        id: string;
        type: string;
        message: string;
        shopName: string;
        timestamp: string;
      }[];
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
