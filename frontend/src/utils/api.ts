const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }

    let backendMessage: string | undefined;
    try {
      const errBody = await response.json();
      backendMessage = errBody?.error?.message;
    } catch {
      // body wasn't JSON; fall through to default message
    }
    throw new ApiError(
      response.status,
      backendMessage || `HTTP error! status: ${response.status}`,
    );
  }
  
try{

  const data = await response.json();
  return data;
} catch (error) {
  return ;
}
}

export const api = {
  // Categories
  getCategories: (params?: { lang?: string; include_counts?: string; active_only?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.include_counts) queryParams.append('include_counts', params.include_counts);
    if (params?.active_only) queryParams.append('active_only', params.active_only);
    const query = queryParams.toString();
    return fetchApi<{ categories: any[] }>(`/categories${query ? `?${query}` : ''}`);
  },

  getCategoryBySlug: (slug: string, params?: { lang?: string; include_children?: string; include_texts?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.include_children) queryParams.append('include_children', params.include_children);
    if (params?.include_texts) queryParams.append('include_texts', params.include_texts);
    const query = queryParams.toString();
    return fetchApi<any>(`/categories/${slug}${query ? `?${query}` : ''}`);
  },

  // News
  getNews: (params?: { page?: number; limit?: number; lang?: string; sort?: string; order?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return fetchApi<{ news: any[]; pagination: any }>(`/news${query ? `?${query}` : ''}`);
  },

  getNewsById: (id: string, params?: { lang?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    const query = queryParams.toString();
    return fetchApi<any>(`/news/${id}${query ? `?${query}` : ''}`);
  },

  createNews: (data: any) => {
    return fetchApi<any>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNews: (id: string, data: any) => {
    return fetchApi<any>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteNews: (id: string) => {
    return fetchApi<void>(`/news/${id}`, {
      method: 'DELETE',
    });
  },

  // Timeline
  getTimelinePeriods: (params?: { lang?: string; include_events?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.include_events) queryParams.append('include_events', params.include_events);
    const query = queryParams.toString();
    return fetchApi<{ periods: any[] }>(`/timeline/periods${query ? `?${query}` : ''}`);
  },

  getTimelineEvents: (params?: { period_id?: string; category?: string; lang?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.period_id) queryParams.append('period_id', params.period_id);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.lang) queryParams.append('lang', params.lang);
    const query = queryParams.toString();
    return fetchApi<{ events: any[] }>(`/timeline/events${query ? `?${query}` : ''}`);
  },


  // Karchag - Main Categories
  getKarchagMainCategories: (params?: { is_active?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    const query = queryParams.toString();
    return fetchApi<{ categories: any[] }>(`/karchag/main-categories${query ? `?${query}` : ''}`);
  },

  getKarchagMainCategoryById: (id: string) => {
    return fetchApi<any>(`/karchag/main-categories/${id}`);
  },

  createKarchagMainCategory: (data: any) => {
    return fetchApi<any>('/karchag/main-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateKarchagMainCategory: (id: string, data: any) => {
    return fetchApi<any>(`/karchag/main-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteKarchagMainCategory: (id: string) => {
    return fetchApi<void>(`/karchag/main-categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Karchag - Sub Categories
  getKarchagSubCategories: (params?: { main_category_id?: string; is_active?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.main_category_id) queryParams.append('main_category_id', params.main_category_id);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return fetchApi<{ categories: any[] }>(`/karchag/sub-categories${query ? `?${query}` : ''}`);
  },

  getKarchagSubCategoryById: (id: string) => {
    return fetchApi<any>(`/karchag/sub-categories/${id}`);
  },

  createKarchagSubCategory: (data: any) => {
    return fetchApi<any>('/karchag/sub-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateKarchagSubCategory: (id: string, data: any) => {
    return fetchApi<any>(`/karchag/sub-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteKarchagSubCategory: (id: string) => {
    return fetchApi<void>(`/karchag/sub-categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Karchag - Texts
  getKarchagTexts: (params?: { sub_category_id?: string; is_active?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.sub_category_id) queryParams.append('sub_category_id', params.sub_category_id);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    const query = queryParams.toString();
    return fetchApi<{ texts: any[] }>(`/karchag/texts${query ? `?${query}` : ''}`);
  },

  getKarchagTextById: (id: string) => {
    return fetchApi<any>(`/karchag/texts/${id}`);
  },

  createKarchagText: (data: any) => {
    return fetchApi<any>('/karchag/texts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateKarchagText: (id: string, data: any) => {
    return fetchApi<any>(`/karchag/texts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteKarchagText: (id: string) => {
    return fetchApi<void>(`/karchag/texts/${id}`, {
      method: 'DELETE',
    });
  },

  // Karchag - Text Summary
  getKarchagTextSummary: (textId: string) => {
    return fetchApi<any>(`/karchag/texts/${textId}/summary`);
  },

  createOrUpdateKarchagTextSummary: (textId: string, data: any) => {
    return fetchApi<any>(`/karchag/texts/${textId}/summary`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateKarchagTextSummary: (textId: string, data: any) => {
    return fetchApi<any>(`/karchag/texts/${textId}/summary`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteKarchagTextSummary: (textId: string) => {
    return fetchApi<void>(`/karchag/texts/${textId}/summary`, {
      method: 'DELETE',
    });
  },

  // Videos
  getVideos: (params?: { page?: number; limit?: number; lang?: string; search?: string; is_active?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    const query = queryParams.toString();
    return fetchApi<{ videos: any[]; pagination: any }>(`/videos${query ? `?${query}` : ''}`);
  },

  getVideoById: (id: string, params?: { lang?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    const query = queryParams.toString();
    return fetchApi<any>(`/videos/${id}${query ? `?${query}` : ''}`);
  },

  createVideo: (data: any) => {
    return fetchApi<any>('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateVideo: (id: string, data: any) => {
    return fetchApi<any>(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteVideo: (id: string) => {
    return fetchApi<void>(`/videos/${id}`, {
      method: 'DELETE',
    });
  },


  // Timeline Events
  getTimelineEventById: (id: string, params?: { lang?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    const query = queryParams.toString();
    return fetchApi<any>(`/timeline/events/${id}${query ? `?${query}` : ''}`);
  },

  createTimelineEvent: (data: any) => {
    return fetchApi<any>('/timeline/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTimelineEvent: (id: string, data: any) => {
    return fetchApi<any>(`/timeline/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTimelineEvent: (id: string) => {
    return fetchApi<void>(`/timeline/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Audio
  getAudio: (params?: { page?: number; limit?: number; text_id?: string; search?: string; lang?: string; is_active?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.text_id) queryParams.append('text_id', params.text_id);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    const query = queryParams.toString();
    return fetchApi<{ recordings: any[]; pagination: any }>(`/audio${query ? `?${query}` : ''}`);
  },

  getAudioById: (id: string, params?: { lang?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.lang) queryParams.append('lang', params.lang);
    const query = queryParams.toString();
    return fetchApi<any>(`/audio/${id}${query ? `?${query}` : ''}`);
  },

  createAudio: (data: any) => {
    return fetchApi<any>('/audio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAudio: (id: string, data: any) => {
    return fetchApi<any>(`/audio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAudio: (id: string) => {
    return fetchApi<void>(`/audio/${id}`, {
      method: 'DELETE',
    });
  },

  // Category Management
  createCategory: (data: any) => {
    return fetchApi<any>('/categories/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: (id: string, data: any) => {
    return fetchApi<any>(`/categories/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: (id: string) => {
    return fetchApi<void>(`/categories/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin - Users
  getUsers: (params?: { page?: number; limit?: number; role?: string; is_active?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return fetchApi<{ users: any[]; pagination: any }>(`/admin/users${query ? `?${query}` : ''}`);
  },

  createUser: (data: any) => {
    return fetchApi<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: (id: string, data: any) => {
    return fetchApi<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: (id: string) => {
    return fetchApi<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin - Dashboard
  getDashboard: () => {
    return fetchApi<any>('/admin/dashboard');
  },

  // Search
  search: (params?: { q?: string; type?: string; lang?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append('q', params.q);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return fetchApi<{ 
      query: string; 
      results: { 
        texts: { items: any[]; total: number };
        subCategories: { items: any[]; total: number };
        news: { items: any[]; total: number };
        timeline: { items: any[]; total: number };
        audio: { items: any[]; total: number };
      };
      pagination: any;
    }>(`/search${query ? `?${query}` : ''}`);
  },

  // Texts
  getTextById: (id: string) => {
    return fetchApi<any>(`/karchag/texts/${id}`);
  },

  // Text Summary
  getTextSummary: (textId: string) => {
    return fetchApi<any>(`/karchag/texts/${textId}/summary`);
  },

  // File Upload
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number; mime_type: string; key: string }> => {
    const url = `${API_BASE_URL}/upload`;
    const token = getAuthToken();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: HeadersInit = {};
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new ApiError(response.status, error.message || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  },
};

export { ApiError };
export default api;
