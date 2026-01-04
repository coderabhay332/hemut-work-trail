'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { OrderDetail, CustomerDetail } from '@/types/api';
import LoadDetailsTab from './OrderDetailsTabs/LoadDetailsTab';
import CustomerDetailsTab from './OrderDetailsTabs/CustomerDetailsTab';
import LaneHistoryTab from './OrderDetailsTabs/LaneHistoryTab';
import CalculatorTab from './OrderDetailsTabs/CalculatorTab';

interface OrderDetailsProps {
  orderId: string | null;
  onClose: () => void;
}

type Tab = 'load-details' | 'customer-details' | 'lane-history' | 'calculator';

export default function OrderDetails({ orderId, onClose }: OrderDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('load-details');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      setOrder(null);
      setCustomer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (order && activeTab === 'customer-details') {
      loadCustomerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, activeTab]);

  const loadOrderDetails = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const orderData = await apiClient.getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async () => {
    if (!order?.customerId) return;
    try {
      const customerData = await apiClient.getCustomerById(order.customerId);
      setCustomer(customerData);
    } catch (err) {
      console.error('Failed to load customer details:', err);
      setCustomer(null);
    }
  };

  if (!orderId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Select an order to view details</div>
      </div>
    );
  }

  if (loading && !order) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'load-details', label: 'Load Details' },
    { id: 'customer-details', label: 'Customer Details' },
    { id: 'lane-history', label: 'Lane History' },
    { id: 'calculator', label: 'Calculator' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{order.customerName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrderDetails()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium"
          >
            Edit Details
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-3 text-sm font-medium transition-colors border-b-2
              ${
                activeTab === tab.id
                  ? 'text-gray-900 bg-yellow-highlight border-yellow-400'
                  : 'bg-white text-gray-600 hover:text-gray-900 border-transparent'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'load-details' && <LoadDetailsTab order={order} />}
        {activeTab === 'customer-details' && (
          <CustomerDetailsTab customer={customer} loading={!customer} />
        )}
        {activeTab === 'lane-history' && <LaneHistoryTab orderId={orderId} />}
        {activeTab === 'calculator' && <CalculatorTab order={order} />}
      </div>
    </div>
  );
}

