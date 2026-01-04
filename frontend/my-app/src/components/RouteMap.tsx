'use client';

import { useEffect, useRef, useState } from 'react';
import { OrderDetail } from '@/types/api';

interface RouteMapProps {
  order: OrderDetail;
  isOpen: boolean;
  onClose: () => void;
}

export default function RouteMap({ order, isOpen, onClose }: RouteMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Dynamically load Leaflet only in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;
      
      // Store L in a way we can access it
      (window as any).Leaflet = L;
      setLeafletLoaded(true);
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !isOpen || !mapContainerRef.current) return;
    
    const L = (window as any).Leaflet;
    if (!L) return;

    // Fix for default marker icons in Next.js
    const createIcon = (color: string, number: number) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${number}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const stops = order.stops || [];

    // Clear existing markers and polyline
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (stops.length === 0) {
      // Center on a default location if no stops
      map.setView([39.8283, -98.5795], 4);
      return;
    }

    // Sort stops by sequence
    const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);

    // Create markers and collect coordinates
    const latlngs: any[] = [];
    const bounds: any[] = [];

    sortedStops.forEach((stop, index) => {
      const latlng: any = [stop.latitude, stop.longitude];
      latlngs.push(latlng);
      bounds.push(latlng);

      // Determine color based on stop type
      const isPickup = stop.stopType === 'PICKUP';
      const color = isPickup ? '#10b981' : '#ef4444'; // green for pickup, red for delivery
      const icon = createIcon(color, index + 1);

      // Create marker with sequence number
      const marker = L.marker(latlng, { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>${isPickup ? 'Pickup' : 'Delivery'} #${index + 1}</strong><br/>
            ${stop.address}<br/>
            ${stop.city ? `${stop.city}, ${stop.state || ''}` : ''}<br/>
            ${stop.plannedTime ? new Date(stop.plannedTime).toLocaleString() : 'TBD'}
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Draw polyline connecting all stops
    if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        smoothFactor: 1,
      }).addTo(map);
    }

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      });
    }

    // Cleanup function
    return () => {
      // Clear markers and polyline when modal closes
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    };
  }, [isOpen, order, leafletLoaded]);

  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full md:w-4/5 md:h-4/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Route Map - Order #{order.reference?.replace('ORD-', '') || order.id}
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <div className="text-sm font-semibold mb-2">Legend</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                <span>Pickup Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                <span>Delivery Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-500"></div>
                <span>Route</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

