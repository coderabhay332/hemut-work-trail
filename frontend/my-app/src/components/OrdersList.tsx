'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { OrderListItem, OrdersListResponse } from '@/types/api';

interface OrdersListProps {
  onOrderSelect: (orderId: string) => void;
  selectedOrderId: string | null;
  searchQuery: string;
  sortOption: 'newest' | 'oldest' | 'shortest' | 'longest';
}

export default function OrdersList({
  onOrderSelect,
  selectedOrderId,
  searchQuery,
  sortOption,
}: OrdersListProps) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<OrdersListResponse['meta'] | null>(null);
  const limit = 10;

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getOrders({
        query: searchQuery || undefined,
        page,
        limit,
        sort: sortOption,
      });
      setOrders(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setOrders([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortOption]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, sortOption]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No orders found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => onOrderSelect(order.id)}
            className={`
              p-4 border-b cursor-pointer transition-colors relative
              ${selectedOrderId === order.id ? 'border-l-4 bg-yellow-highlight border-yellow-400' : 'hover:bg-gray-50'}
            `}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedOrderId === order.id}
                onChange={() => onOrderSelect(order.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                    Order
                  </span>
                  <span className="font-semibold text-gray-900">
                    #{order.reference?.replace('ORD-', '') || order.id}
                  </span>
                  <span className="text-gray-700 font-medium ml-1">{order.customerName}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-700 mb-3 font-medium">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {order.origin
                    ? `${order.origin.city.toUpperCase()}, ${order.origin.state}`
                    : 'UNKNOWN'}{' '}
                  →{' '}
                  {order.destination
                    ? `${order.destination.city.toUpperCase()}, ${order.destination.state}`
                    : 'UNKNOWN'}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    {order.equipmentType || 'Van'} / {order.commodity}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {order.rate ? `$${order.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$ TBD'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(order.pickupDate)} →{' '}
                    {order.deliveryDate ? formatDate(order.deliveryDate) : 'Delivery TBD'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {order.stopsSummary.pickups} Pickup → {order.stopsSummary.deliveries} Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {order.miles ? `${order.miles} mi` : 'TBD'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    {order.weightLbs ? `${order.weightLbs.toLocaleString()} lbs` : 'TBD'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {meta && (
        <div className="border-t p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={limit}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white text-gray-900"
              disabled
            >
              <option value={10}>10</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, meta.total)} of{' '}
            {meta.total} loads.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900"
            >
              &lt;
            </button>
            <span className="text-sm text-gray-900">
              Page {page} of {Math.ceil(meta.total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(meta.total / limit)}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

