'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { OrderDetail } from '@/types/api';

// Dynamically import RouteMap to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading map...</div>,
});

interface LoadDetailsTabProps {
  order: OrderDetail;
}

export default function LoadDetailsTab({ order }: LoadDetailsTabProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const formatDateTimeRange = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    // Add 3 hours for end time (typical window)
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 3);
    const endTimeStr = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr}, ${timeStr} - ${endTimeStr} CST`;
  };

  const getZipCode = (address: string) => {
    const match = address.match(/\d{5}/);
    return match ? match[0] : null;
  };

  const stops = order.stops || [];
  const pickupStops = stops.filter((s) => s.stopType === 'PICKUP');
  const deliveryStops = stops.filter((s) => s.stopType === 'DELIVERY');

  return (
    <div className="space-y-6">
      {/* View Map Button */}
      {order.stops && order.stops.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsMapOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            View on Map
          </button>
        </div>
      )}

      {/* Route Map Modal */}
      <RouteMap order={order} isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      {/* Pickup Locations */}
      {pickupStops.map((stop, index) => {
        const locationName = stop.address.split(',')[0]?.trim().toUpperCase() || 'PICKUP';
        const zipCode = getZipCode(stop.address);
        return (
          <div key={stop.id} className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{locationName}</h3>
              </div>
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                Pickup - Live
              </span>
            </div>
            <div className="space-y-1 text-sm ml-12">
              <div className="font-medium text-gray-900">{stop.address}</div>
              {stop.city && stop.state && (
                <div className="text-gray-600">
                  {stop.city}, {stop.state}
                  {zipCode && `, ${zipCode}`}
                </div>
              )}
              <div className="text-gray-600">
                {formatDateTimeRange(stop.plannedTime)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Delivery Locations */}
      {deliveryStops.map((stop, index) => {
        const locationName = stop.address.split(',')[0]?.trim().toUpperCase() || 'DELIVERY';
        const zipCode = getZipCode(stop.address);
        return (
          <div key={stop.id} className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {pickupStops.length + index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{locationName}</h3>
              </div>
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                Dropoff - Live
              </span>
            </div>
            <div className="space-y-1 text-sm ml-12">
              <div className="font-medium text-gray-900">{stop.address}</div>
              {stop.city && stop.state && (
                <div className="text-gray-600">
                  {stop.city}, {stop.state}
                  {zipCode && `, ${zipCode}`}
                </div>
              )}
              <div className="text-gray-600">
                {formatDateTimeRange(stop.plannedTime)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Load Information */}
      <div className="border border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-gray-900">LOAD INFORMATION</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Weight:</span>
            <span className="ml-2 font-medium text-gray-900">
              {order.weightLbs ? `${order.weightLbs.toLocaleString()} lbs` : 'TBD'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Excessive Transit:</span>
            <span className="ml-2 font-medium text-gray-900">No</span>
          </div>
          <div>
            <span className="text-gray-600">Trailer Type:</span>
            <span className="ml-2 font-medium text-gray-900">{order.equipmentType || 'Not Specified'}</span>
          </div>
          <div>
            <span className="text-gray-600">Weekend Pickup:</span>
            <span className="ml-2 font-medium text-gray-900">
              {order.flags?.weekendPickup ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Team Driver:</span>
            <span className="ml-2 font-medium text-gray-900">No</span>
          </div>
          <div>
            <span className="text-gray-600">Hazmat:</span>
            <span className="ml-2 font-medium text-gray-900">
              {order.flags?.hazmat ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Miles:</span>
            <span className="ml-2 font-medium text-gray-900">{order.miles || 'TBD'}</span>
          </div>
          <div>
            <span className="text-gray-600">Rate:</span>
            <span className="ml-2 font-medium text-gray-900">
              {order.rate ? `$${order.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'TBD'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Commodity:</span>
            <span className="ml-2 font-medium text-gray-900">{order.commodity || 'Not Specified'}</span>
          </div>
          <div>
            <span className="text-gray-600">Stops:</span>
            <span className="ml-2 font-medium text-gray-900">{stops.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Special Requirements:</span>
            <span className="ml-2 font-medium text-gray-900">
              {order.notes || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Accessorials:</span>
            <span className="ml-2 font-medium text-gray-900">
              {order.flags?.driverAssist ? 'DRIVER_ASSIST' : 'None'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Required Endorsements:</span>
            <span className="ml-2 font-medium text-gray-400">
              (empty field)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

