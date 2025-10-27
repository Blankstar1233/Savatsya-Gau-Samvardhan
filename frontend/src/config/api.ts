const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
    CHECK_EMAIL: (email: string) => `${API_BASE_URL}/api/auth/check-email/${email}`,
  },
  USER: {
    ME: `${API_BASE_URL}/api/user/me`,
    PROFILE: `${API_BASE_URL}/api/user/profile`,
    AVATAR: `${API_BASE_URL}/api/user/avatar`,
    ADDRESSES: `${API_BASE_URL}/api/user/addresses`,
    ADDRESS: (id: string) => `${API_BASE_URL}/api/user/addresses/${id}`,
    PREFERENCES: `${API_BASE_URL}/api/user/preferences`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/user/account`,
  },
  ORDERS: `${API_BASE_URL}/api/orders`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  NEWSLETTER: {
    SUBSCRIBE: `${API_BASE_URL}/api/newsletter/subscribe`,
    UNSUBSCRIBE: `${API_BASE_URL}/api/newsletter/unsubscribe`,
  },
  WEBHOOKS: `${API_BASE_URL}/api/webhooks`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
