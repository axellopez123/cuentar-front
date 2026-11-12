const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://cuentar-back.arwax.pro').replace(/\/+$/, '');
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export class ApiError extends Error {
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cuentar_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If payload is not FormData, set Content-Type to application/json
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Error en la petición al servidor';
    let details: Record<string, unknown> | undefined;

    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
      details = errJson.details;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }

    if (response.status === 401) {
      localStorage.removeItem('cuentar_token');
      // If we are not already on login, dispatch custom event or reload
    }

    throw new ApiError(errorDetail, response.status, details);
  }

  // Empty response (e.g. 204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string):Promise<{ access_token: string }> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.detail || 'Error al iniciar sesión', res.status);
    }
    return res.json();
  },
  register: (data: unknown) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Users
  getUsers: () => request('/users'),
  createUser: (data: unknown) =>
    request('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Cards
  getCards: () => request('/cards'),
  getCard: (id: string) => request(`/cards/${id}`),
  createCard: (data: unknown) =>
    request('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: unknown) =>
    request(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  resetCardPeriod: (id: string) =>
    request(`/cards/${id}/reset-period`, { method: 'POST' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data: unknown) =>
    request('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Transactions
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/transactions${qs}`);
  },
  createExpense: (data: unknown) =>
    request('/transactions/expense', { method: 'POST', body: JSON.stringify(data) }),
  createPayment: (data: unknown) =>
    request('/transactions/payment', { method: 'POST', body: JSON.stringify(data) }),
  uploadAttachments: (txId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return request(`/transactions/${txId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },

  // Dashboard
  getDashboard: (referenceDate?: string) => {
    const qs = referenceDate ? `?reference_date=${referenceDate}` : '';
    return request(`/dashboard${qs}`);
  },

  // Attachment download URL
  getAttachmentDownloadUrl: (attId: string) =>
    `${API_BASE_URL}/attachments/${attId}/download`,
};

