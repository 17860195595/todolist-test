export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  createdAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  todoSortBy: 'createdAt' | 'priority' | 'category';
  todoSortOrder: 'asc' | 'desc';
  showCompletedTodos: boolean;
  enableAIAssistant: boolean;
  enableEmailNotification: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
  defaultCategory: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  nickname?: string;
  email: string;
}

export interface AuthResponse {
  user: UserInfo;
  token: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  email?: string;
  avatar?: string;
  settings?: Partial<UserSettings>;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
} 