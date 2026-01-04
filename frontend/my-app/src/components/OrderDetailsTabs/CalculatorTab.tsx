'use client';

import { useState } from 'react';
import { OrderDetail } from '@/types/api';
import { apiClient } from '@/lib/api';

interface CalculatorTabProps {
  order: OrderDetail;
  onRateUpdated?: () => void;
}

export default function CalculatorTab({ order, onRateUpdated }: CalculatorTabProps) {
  const [baseCost, setBaseCost] = useState('');
  const [miles, setMiles] = useState(order.miles?.toString() || '');
  const [margin, setMargin] = useState('');
  const [accessorials, setAccessorials] = useState<Array<{ name: string; amount: number }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const baseCostNum = parseFloat(baseCost) || 0;
  const marginNum = parseFloat(margin) || 0;
  const accessorialTotal = accessorials.reduce((sum, a) => sum + a.amount, 0);
  const subtotal = baseCostNum + accessorialTotal;
  const finalQuote = subtotal * (1 + marginNum / 100);

  const accessorialOptions = [
    'Chase Car',
    'Chase Car Flat Fee',
    'Chassis Fee',
    'Clean-out / Trailer Washout',
    'Cross Dock Fee',
    'Customs Documentation',
  ];

  const addAccessorial = () => {
    setAccessorials([...accessorials, { name: '', amount: 0 }]);
  };

  const updateAccessorial = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...accessorials];
    updated[index] = { ...updated[index], [field]: value };
    setAccessorials(updated);
  };

  const removeAccessorial = (index: number) => {
    setAccessorials(accessorials.filter((_, i) => i !== index));
  };

  const handleSubmitQuote = async () => {
    if (finalQuote <= 0) {
      setError('Quote must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      
      await apiClient.updateOrderRate(order.id, finalQuote);
      
      setSuccess(true);
      // Call callback to refresh order details
      if (onRateUpdated) {
        onRateUpdated();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rate');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Base Cost */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Base Cost</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Cost ($)</label>
            <input
              type="number"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              placeholder="Enter manually or get live rate"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Miles</label>
            <input
              type="number"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              placeholder="Enter miles"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Accessorial Charges */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Accessorial Charges</h3>
        <div className="space-y-3">
          {accessorials.map((accessorial, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={accessorial.name}
                onChange={(e) => updateAccessorial(index, 'name', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
              >
                <option value="">Select accessorial charge</option>
                {accessorialOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={accessorial.amount || ''}
                onChange={(e) =>
                  updateAccessorial(index, 'amount', parseFloat(e.target.value) || 0)
                }
                placeholder="Amount"
                className="w-32 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              />
              <button
                onClick={() => removeAccessorial(index)}
                className="px-3 py-2 border rounded hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addAccessorial}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Quote Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Quote Summary</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Margin (%)</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              placeholder="Enter margin percentage"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span>Base Cost:</span>
              <span>${baseCostNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Accessorials:</span>
              <span>${accessorialTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Final Quote:</span>
              <span className="text-green-600">${finalQuote.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Quote submitted successfully! Rate updated to ${finalQuote.toFixed(2)}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmitQuote}
        disabled={submitting || finalQuote <= 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : `$ Submit Quote: $${finalQuote.toFixed(2)}`}
      </button>
      {finalQuote <= 0 && (
        <p className="text-sm text-gray-500 text-center">
          Enter values to calculate quote
        </p>
      )}
    </div>
  );
}

