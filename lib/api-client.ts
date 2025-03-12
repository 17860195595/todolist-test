import { UserSettings, UpdateUserRequest, ChangePasswordRequest } from '@/app/types/user';

class ApiClient {
  private token: string;

  constructor() {
    // 从 localStorage 获取 token
    this.token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || ''
      : '';
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  }

  // 用户设置相关
  async getSettings() {
    return this.request<UserSettings>('/user/settings');
  }

  async updateSettings(settings: Partial<UserSettings>) {
    return this.request<UserSettings>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // 待办事项相关
  async getTodos(params: {
    showCompleted?: boolean;
    sortBy?: 'createdAt' | 'priority' | 'category';
    sortOrder?: 'asc' | 'desc';
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    return this.request<any[]>(`/todos?${searchParams.toString()}`);
  }

  async createTodo(todo: {
    text: string;
    priority: string;
    category: string;
  }) {
    return this.request<any>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(id: string, todo: {
    text?: string;
    completed?: boolean;
    priority?: string;
    category?: string;
  }) {
    return this.request<any>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  }

  async deleteTodo(id: string) {
    return this.request<{ message: string }>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  // 用户资料相关
  async getProfile() {
    return this.request<any>('/user/profile');
  }

  async updateProfile(profile: UpdateUserRequest) {
    return this.request<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async changePassword(passwords: ChangePasswordRequest) {
    return this.request<{ message: string }>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(passwords),
    });
  }
}

export const apiClient = new ApiClient(); 