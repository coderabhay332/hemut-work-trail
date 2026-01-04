'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Customer, CreateOrderRequest } from '@/types/api';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateOrderRequest>({
    customerId: '',
    stops: [
      {
        sequence: 1,
        latitude: 0,
        longitude: 0,
        address: '',
        stopType: 'PICKUP',
      },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      // Search with empty string might not work, so we'll handle it gracefully
      try {
        const results = await apiClient.searchCustomers('a');
        setCustomers(results);
      } catch {
        // If search fails, set empty array
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.customerId) {
      setError('Customer is required');
      return;
    }

    if (formData.stops.length === 0) {
      setError('At least one stop is required');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createOrder(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        customerId: '',
        stops: [
          {
            sequence: 1,
            latitude: 0,
            longitude: 0,
            address: '',
            stopType: 'PICKUP',
          },
        ],
        weightLbs: undefined,
        miles: undefined,
        rate: undefined,
        commodity: undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        {
          sequence: formData.stops.length + 1,
          latitude: 0,
          longitude: 0,
          address: '',
          stopType: formData.stops[formData.stops.length - 1]?.stopType === 'PICKUP' ? 'DELIVERY' : 'PICKUP',
        },
      ],
    });
  };

  const updateStop = (index: number, field: string, value: any) => {
    const updated = [...formData.stops];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, stops: updated });
  };

  const removeStop = (index: number) => {
    if (formData.stops.length > 1) {
      const updated = formData.stops.filter((_, i) => i !== index);
      // Re-sequence
      updated.forEach((stop, i) => {
        stop.sequence = i + 1;
      });
      setFormData({ ...formData, stops: updated });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">+ Create New Order</h2>
            <p className="text-sm text-gray-600">
              Manually create a new order with pickup and delivery details
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData({
                  customerId: '',
                  stops: [
                    {
                      sequence: 1,
                      latitude: 0,
                      longitude: 0,
                      address: '',
                      stopType: 'PICKUP',
                    },
                  ],
                  weightLbs: undefined,
                  miles: undefined,
                  rate: undefined,
                  commodity: undefined,
                });
                setError(null);
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Clear All Fields
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Order Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Order Info</h3>
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                disabled={loadingCustomers}
              >
                <option value="">
                  {loadingCustomers ? 'Loading customers...' : 'Select customer'}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Equipment Type
              </label>
              <input
                type="text"
                value={formData.equipmentType || ''}
                onChange={(e) =>
                  setFormData({ ...formData, equipmentType: e.target.value })
                }
                placeholder="Search equipment types..."
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Stops */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Stops</h3>
              <button
                type="button"
                onClick={addStop}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                + Add Stop
              </button>
            </div>

            {formData.stops.map((stop, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Stop #{stop.sequence}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Type: {stop.stopType === 'PICKUP' ? 'Pickup (PU)' : 'Delivery (DL)'}
                    </span>
                    {formData.stops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={stop.address.split(',')[0] || ''}
                      onChange={(e) => {
                        const parts = stop.address.split(',');
                        parts[0] = e.target.value;
                        updateStop(index, 'address', parts.join(','));
                      }}
                      placeholder="Enter location name"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Type
                    </label>
                    <select
                      value={stop.stopType}
                      onChange={(e) =>
                        updateStop(index, 'stopType', e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
                    >
                      <option value="PICKUP">Pickup</option>
                      <option value="DELIVERY">Delivery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={stop.address}
                    onChange={(e) => updateStop(index, 'address', e.target.value)}
                    placeholder="Enter street address"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={stop.city || ''}
                      onChange={(e) => updateStop(index, 'city', e.target.value)}
                      placeholder="Enter city"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={stop.state || ''}
                      onChange={(e) => updateStop(index, 'state', e.target.value)}
                      placeholder="XX"
                      maxLength={2}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Scheduled Arrival (Early) *
                    </label>
                    <input
                      type="datetime-local"
                      onChange={(e) => {
                        if (e.target.value) {
                          updateStop(index, 'plannedTime', new Date(e.target.value).toISOString());
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Scheduled Arrival (Late) *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shipment Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Shipment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weightLbs || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weightLbs: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Miles
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.miles || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      miles: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Commodity
                </label>
                <input
                  type="text"
                  value={formData.commodity || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, commodity: e.target.value })
                  }
                  placeholder="Enter commodity"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

