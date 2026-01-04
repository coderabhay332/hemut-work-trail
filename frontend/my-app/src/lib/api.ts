/**
 * API client for backend endpoints
 * All data fetching happens here - frontend only renders what backend provides
 */

import {
  OrdersListResponse,
  OrderDetail,
  CustomerDetail,
  Customer,
  CreateOrderRequest,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Is the server running?');
      }
      throw err;
    }
  }

  // GET /orders
  async getOrders(params?: {
    query?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<OrdersListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    // Always send sort parameter (default to 'newest' if not provided)
    searchParams.set('sort', params?.sort || 'newest');

    const queryString = searchParams.toString();
    return this.fetch<OrdersListResponse>(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  // GET /orders/:id
  async getOrderById(id: string): Promise<OrderDetail> {
    return this.fetch<OrderDetail>(`/orders/${id}`);
  }

  // GET /customers/:id
  async getCustomerById(id: string): Promise<CustomerDetail> {
    return this.fetch<CustomerDetail>(`/customers/${id}`);
  }

  // GET /customers?query=
  async searchCustomers(query: string): Promise<Customer[]> {
    if (!query || query.trim().length === 0) {
      // Backend requires query parameter, return empty array if empty
      return [];
    }
    return this.fetch<Customer[]>(`/customers?query=${encodeURIComponent(query)}`);
  }

  // POST /orders
  async createOrder(data: CreateOrderRequest): Promise<{ id: string }> {
    return this.fetch<{ id: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

