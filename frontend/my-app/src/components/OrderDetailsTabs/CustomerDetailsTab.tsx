import { CustomerDetail } from '@/types/api';

interface CustomerDetailsTabProps {
  customer: CustomerDetail | null;
  loading: boolean;
}

export default function CustomerDetailsTab({
  customer,
  loading,
}: CustomerDetailsTabProps) {
  if (loading) {
    return <div className="text-gray-500">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="text-gray-500">Customer details not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Primary Contact */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">PRIMARY CONTACT</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">CONTACT NAME:</span>
            <span className="ml-2 font-medium">
              {customer.primaryContact.name || customer.name}
            </span>
            {customer.primaryContact.name && (
              <span className="ml-2 text-gray-500">({customer.name})</span>
            )}
          </div>
          <div>
            <span className="text-gray-600">TITLE:</span>
            <span className="ml-2 font-medium">Logistics Manager</span>
          </div>
          <div>
            <span className="text-gray-600">PHONE:</span>
            <span className="ml-2 font-medium">
              {customer.primaryContact.phone || customer.phone || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">EMAIL:</span>
            <span className="ml-2 font-medium">
              {customer.primaryContact.email || customer.email || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Billing & Payment */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">BILLING & PAYMENT</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">PAYMENT TERMS:</span>
            <span className="ml-2 font-medium">Net 30</span>
          </div>
          <div>
            <span className="text-gray-600">CREDIT LIMIT:</span>
            <span className="ml-2 font-medium">
              ${customer.metrics.totalSpend.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">ACCOUNT MANAGER:</span>
            <span className="ml-2 font-medium">John Smith</span>
          </div>
          <div>
            <span className="text-gray-600">BILLING EMAIL:</span>
            <span className="ml-2 font-medium">
              {customer.email || 'billing@example.com'}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">CUSTOMER METRICS</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Total Loads (YTD):</span>
            <span className="ml-2 font-medium">{customer.metrics.totalOrders}</span>
          </div>
          <div>
            <span className="text-gray-600">Active Orders:</span>
            <span className="ml-2 font-medium">{customer.metrics.activeOrders}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Spend:</span>
            <span className="ml-2 font-medium">
              ${customer.metrics.totalSpend.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Avg Payment Days:</span>
            <span className="ml-2 font-medium">28</span>
          </div>
        </div>
      </div>
    </div>
  );
}

