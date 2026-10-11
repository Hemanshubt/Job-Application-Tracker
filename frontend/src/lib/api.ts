import axios from 'axios';
import { supabase, isLiveSupabase } from './supabase';
import {
  Application,
  Interview,
  Recruiter,
  Task,
  ApplicationNote,
  ActivityLog,
  AnalyticsSummary,
  UserProfile,
  ApplicationStatus,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Supabase JWT token or demo token
api.interceptors.request.use(async (config) => {
  try {
    if (isLiveSupabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        return config;
      }
    }

    // In demo / local dev mode, retrieve token from localStorage or send demo-token
    const localToken = localStorage.getItem('demo_token') || 'demo-token';
    config.headers.Authorization = `Bearer ${localToken}`;
  } catch (err) {
    console.warn('[API Interceptor] Error retrieving session token:', err);
    config.headers.Authorization = 'Bearer demo-token';
  }
  return config;
});

// Applications API
export const applicationsApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    location_type?: string;
    job_type?: string;
    sort_by?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<{
      success: boolean;
      data: { applications: Application[]; total: number; page: number; limit: number };
    }>('/applications', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Application }>(`/applications/${id}`);
    return res.data.data;
  },

  create: async (payload: Partial<Application>) => {
    const res = await api.post<{ success: boolean; data: Application }>('/applications', payload);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<Application>) => {
    const res = await api.put<{ success: boolean; data: Application }>(`/applications/${id}`, payload);
    return res.data.data;
  },

  updateStatus: async (id: string, status: ApplicationStatus) => {
    const res = await api.patch<{ success: boolean; data: Application }>(`/applications/${id}/status`, { status });
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/applications/${id}`);
    return res.data;
  },
};

// Interviews API
export const interviewsApi = {
  list: async (applicationId?: string) => {
    const res = await api.get<{ success: boolean; data: Interview[] }>('/interviews', {
      params: { application_id: applicationId },
    });
    return res.data.data;
  },

  getUpcoming: async (limit: number = 5) => {
    const res = await api.get<{ success: boolean; data: Interview[] }>('/interviews/upcoming', {
      params: { limit },
    });
    return res.data.data;
  },

  create: async (payload: Partial<Interview>) => {
    const res = await api.post<{ success: boolean; data: Interview }>('/interviews', payload);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<Interview>) => {
    const res = await api.put<{ success: boolean; data: Interview }>(`/interviews/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean }>(`/interviews/${id}`);
    return res.data;
  },
};

// Recruiters API
export const recruitersApi = {
  list: async (applicationId?: string) => {
    const res = await api.get<{ success: boolean; data: Recruiter[] }>('/recruiters', {
      params: { application_id: applicationId },
    });
    return res.data.data;
  },

  create: async (payload: Partial<Recruiter>) => {
    const res = await api.post<{ success: boolean; data: Recruiter }>('/recruiters', payload);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<Recruiter>) => {
    const res = await api.put<{ success: boolean; data: Recruiter }>(`/recruiters/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean }>(`/recruiters/${id}`);
    return res.data;
  },
};

// Tasks API
export const tasksApi = {
  list: async (params?: { applicationId?: string; isCompleted?: boolean }) => {
    const res = await api.get<{ success: boolean; data: Task[] }>('/tasks', {
      params: {
        application_id: params?.applicationId,
        is_completed: params?.isCompleted,
      },
    });
    return res.data.data;
  },

  create: async (payload: Partial<Task>) => {
    const res = await api.post<{ success: boolean; data: Task }>('/tasks', payload);
    return res.data.data;
  },

  toggle: async (id: string) => {
    const res = await api.patch<{ success: boolean; data: Task }>(`/tasks/${id}/toggle`);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<Task>) => {
    const res = await api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean }>(`/tasks/${id}`);
    return res.data;
  },
};

// Notes API
export const notesApi = {
  list: async (applicationId: string) => {
    const res = await api.get<{ success: boolean; data: ApplicationNote[] }>('/notes', {
      params: { application_id: applicationId },
    });
    return res.data.data;
  },

  create: async (applicationId: string, content: string) => {
    const res = await api.post<{ success: boolean; data: ApplicationNote }>('/notes', {
      application_id: applicationId,
      content,
    });
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean }>(`/notes/${id}`);
    return res.data;
  },
};

// Activity API
export const activityApi = {
  list: async (limit: number = 20, applicationId?: string) => {
    const res = await api.get<{ success: boolean; data: ActivityLog[] }>('/activity', {
      params: { limit, application_id: applicationId },
    });
    return res.data.data;
  },
};

// Analytics API
export const analyticsApi = {
  getSummary: async () => {
    const res = await api.get<{ success: boolean; data: AnalyticsSummary }>('/analytics');
    return res.data.data;
  },
};

// Profile API
export const profileApi = {
  get: async () => {
    const res = await api.get<{ success: boolean; data: UserProfile }>('/profile');
    return res.data.data;
  },

  update: async (payload: Partial<UserProfile>) => {
    const res = await api.put<{ success: boolean; data: UserProfile }>('/profile', payload);
    return res.data.data;
  },
};

export default api;
