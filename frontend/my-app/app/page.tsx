'use client';

import { useState, useEffect, useCallback } from 'react';
import OrdersList from '@/components/OrdersList';
import OrderDetails from '@/components/OrderDetails';
import CreateOrderModal from '@/components/CreateOrderModal';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'shortest' | 'longest'>('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [orderCounts, setOrderCounts] = useState({
    inbound: 0,
    pending: 0,
    won: 0,
    rejected: 0,
  });

  // Fetch order counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch total count (Inbound = all orders)
        const response = await apiClient.getOrders({
          page: 1,
          limit: 1,
          sort: 'newest',
        });
        setOrderCounts({
          inbound: response.meta.total,
          pending: 0, // TODO: Implement status-based filtering if needed
          won: 0, // TODO: Implement status-based filtering if needed
          rejected: 0, // TODO: Implement status-based filtering if needed
        });
      } catch (err) {
        console.error('Error fetching order counts:', err);
      }
    };

    fetchCounts();
  }, [refreshKey]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleCreateSuccess = () => {
    setRefreshKey((k) => k + 1);
    setSelectedOrderId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-gray-900">
              $
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Freight Marketplace</h1>
              <p className="text-sm text-gray-600">
                Discover, bid, and secure profitable loads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs leading-tight text-gray-600">Inbound</div>
                  <div className="text-lg font-bold leading-tight text-blue-600">{orderCounts.inbound.toLocaleString()}</div>
                </div>
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs leading-tight text-gray-600">Pending</div>
                  <div className="text-lg font-bold leading-tight text-yellow-600">{orderCounts.pending.toLocaleString()}</div>
                </div>
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-left">
                  <div className="text-xs leading-tight text-gray-600">Won</div>
                  <div className="text-lg font-bold leading-tight text-green-600">{orderCounts.won.toLocaleString()}</div>
                </div>
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div className="text-left">
                  <div className="text-xs leading-tight text-gray-600">Rejected</div>
                  <div className="text-lg font-bold leading-tight text-red-600">{orderCounts.rejected.toLocaleString()}</div>
                </div>
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Rate Confirmation
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 items-center">
          <button className="px-4 py-2 rounded-lg font-medium text-gray-900 bg-yellow-highlight border border-yellow-400">
            Inbound Loads {orderCounts.inbound.toLocaleString()}
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
            Outbound Loads 5
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
            $ My Bids 0
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Order
          </button>
          <button 
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* AI Load Ranking */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <label className="text-sm font-medium text-gray-700">AI Load Ranking:</label>
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-900 text-sm">
            <option>Select a driver to rank loads.</option>
          </select>
          <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium">
            1 load s...
          </button>
          <button className="px-3 py-1.5 bg-green-400 text-white rounded-lg text-sm hover:bg-green-500 font-medium">
            $ Gener...
          </button>
          <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 font-medium">
            Find Be...
          </button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:bg-gray-50 font-medium">
            X C..
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loads by ID, origin, destination, shipper..."
              className="w-full border border-gray-300 rounded-lg px-4 pl-10 py-2 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'newest' | 'oldest' | 'shortest' | 'longest')}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 flex items-center gap-2"
          >
            <option value="newest">Date: Newest First</option>
            <option value="oldest">Date: Oldest First</option>
            <option value="shortest">Distance: Shortest</option>
            <option value="longest">Distance: Longest</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Orders List */}
        <div className="w-1/2 border-r bg-white overflow-hidden">
          <OrdersList
            key={refreshKey}
            onOrderSelect={handleOrderSelect}
            selectedOrderId={selectedOrderId}
            searchQuery={debouncedSearchQuery}
            sortOption={sortOption}
          />
        </div>

        {/* Right Panel - Order Details */}
        <div className="w-1/2 bg-white overflow-hidden">
          <OrderDetails
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        </div>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
