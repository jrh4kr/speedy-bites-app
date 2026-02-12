// API Configuration - frontend will call the local API server by default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Helper to get stored token
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Helper to set token
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Helper to clear auth data
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Generic fetch wrapper with auth and error handling
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

// API Endpoints (to be connected to Laravel backend)
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: RegisterData) =>
    apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
  
  refreshAuthToken: (refreshToken: string) =>
    apiFetch<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
  
  // Menu
  getCategories: async () => {
    const data = await apiFetch<any[]>('/categories');
    return data.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: cat.image_url || '',
      itemCount: cat.item_count || 0,
    })) as Category[];
  },
  
  getMenuItems: async (categoryId?: string) => {
    const data = await apiFetch<any[]>(categoryId ? `/menu?category=${categoryId}` : '/menu');
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      image: item.image_url || '',
      image_url: item.image_url || '', // Keep both for compatibility
      category: item.category_name || '',
      categoryId: item.category_id || '',
      is_available: item.is_available !== false,
      isAvailable: item.is_available !== false,
      isFeatured: item.is_featured === true,
      is_featured: item.is_featured === true,
      rating: item.rating ? Number(item.rating) : undefined,
    })) as MenuItem[];
  },
  
  getMenuItem: async (id: string) => {
    // Fetch all menu items and find the one with matching ID
    // (backend doesn't have /menu/:id endpoint yet)
    const allItems = await apiFetch<any[]>('/menu');
    const item = allItems.find(i => i.id === id);
    
    if (!item) {
      throw new Error('Menu item not found');
    }
    
    return {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      image: item.image_url || '',
      image_url: item.image_url || '',
      category: item.category_name || '',
      categoryId: item.category_id || '',
      isAvailable: item.is_available !== false,
      isFeatured: item.is_featured === true,
      rating: item.rating ? Number(item.rating) : undefined,
    } as MenuItem;
  },
  
  getFeaturedItems: async () => {
    const data = await apiFetch<any[]>('/menu/featured');
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      image: item.image_url || '',
      image_url: item.image_url || '',
      category: item.category_name || '',
      categoryId: item.category_id || '',
      isAvailable: item.is_available !== false,
      isFeatured: item.is_featured === true,
      rating: item.rating ? Number(item.rating) : undefined,
    })) as MenuItem[];
  },
  
  // Cart
  getCart: () => apiFetch<Cart>('/cart'),
  addToCart: (itemId: string, quantity: number, options?: CartItemOptions) =>
    apiFetch<Cart>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, quantity, options }),
    }),
  updateCartItem: (cartItemId: string, quantity: number) =>
    apiFetch<Cart>(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (cartItemId: string) =>
    apiFetch<Cart>(`/cart/${cartItemId}`, { method: 'DELETE' }),
  clearCart: () => apiFetch<void>('/cart/clear', { method: 'DELETE' }),
  
  // Promo Codes
  validatePromoCode: async (code: string, subtotal: number) => {
    const data = await apiFetch<any>('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
    return {
      code: data.code,
      discountAmount: Number(data.discount_amount) || 0,
      discountType: data.discount_type,
    };
  },
  
  // Orders
  createOrder: (data: CreateOrderData) =>
    apiFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrders: () => apiFetch<Order[]>('/orders'),
  getOrder: (id: string) => apiFetch<Order>(`/orders/${id}`),
  
  // Profile
  getProfile: () => apiFetch<User>('/profile'),
  updateProfile: (data: Partial<User>) =>
    apiFetch<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Promos
  getPromos: () => apiFetch<Promo[]>('/promos'),
  validatePromo: (code: string) => apiFetch<Promo>(`/promos/validate/${code}`),
  
  // Auth helpers
  setAuthToken,
  clearAuth,
};

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  rating?: number;
  options?: MenuItemOption[];
}

export interface MenuItemOption {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  choices: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  options?: CartItemOptions;
  totalPrice: number;
}

export interface CartItemOptions {
  [optionId: string]: string | string[];
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
}

export interface CreateOrderData {
  address: Address;
  paymentMethod: 'cash' | 'mpesa';
  notes?: string;
  promoCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  estimatedDelivery?: string;
  driver?: {
    name: string;
    phone: string;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'on_the_way' | 'delivered' | 'cancelled';

export interface Promo {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  expiresAt: string;
}
