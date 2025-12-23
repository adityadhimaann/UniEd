import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

// Request cache to prevent duplicate requests
const requestCache = new Map<string, { promise: Promise<any>; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

// Rate limit tracking
const rateLimitState = {
  isRateLimited: false,
  retryAfter: 0,
  backoffMultiplier: 1,
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token and handle deduplication
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check if we're rate limited
    if (rateLimitState.isRateLimited && Date.now() < rateLimitState.retryAfter) {
      const waitTime = rateLimitState.retryAfter - Date.now();
      console.warn(`⏳ Rate limited - waiting ${Math.ceil(waitTime / 1000)}s before retry`);
      return Promise.reject(new Error(`Rate limited. Retry after ${Math.ceil(waitTime / 1000)}s`));
    }
    
    // Request deduplication for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached request:', cacheKey);
        return Promise.reject({ 
          __CACHED__: true, 
          promise: cached.promise 
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and rate limit handling
api.interceptors.response.use(
  (response) => {
    // Reset rate limit state on successful request
    if (rateLimitState.isRateLimited) {
      rateLimitState.isRateLimited = false;
      rateLimitState.backoffMultiplier = 1;
      console.log('✅ Rate limit cleared');
    }
    
    // Cache GET requests
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        promise: Promise.resolve(response),
        timestamp: Date.now(),
      });
      
      // Clean up old cache entries
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, CACHE_DURATION);
    }
    
    return response;
  },
  async (error) => {
    // Handle cached request
    if (error.__CACHED__) {
      return error.promise;
    }
    
    const originalRequest = error.config;
    
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const waitTime = retryAfter 
        ? parseInt(retryAfter) * 1000 
        : Math.min(30000, 5000 * rateLimitState.backoffMultiplier); // Max 30s
      
      rateLimitState.isRateLimited = true;
      rateLimitState.retryAfter = Date.now() + waitTime;
      rateLimitState.backoffMultiplier *= 2;
      
      console.warn(`⚠️ Rate limited (429) - backing off for ${Math.ceil(waitTime / 1000)}s`);
      
      // Don't auto-retry, let the application handle it
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('edu_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
