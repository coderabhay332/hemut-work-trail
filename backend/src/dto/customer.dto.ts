/**
 * Data Transfer Objects for Customer API responses
 */

import { Customer } from '@prisma/client';

export interface CustomerDetailDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  primaryContact: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  billingInfo: {
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  metrics: {
    totalOrders: number;
    activeOrders: number;
    totalSpend: number; // Can be computed or static
    averageOrderValue: number;
  };
  createdAt: string;
}

/**
 * Transform customer to detail DTO
 */
export function toCustomerDetailDTO(
  customer: Customer & {
    _count?: { orders: number };
    orders?: Array<{ status: string }>;
  }
): CustomerDetailDTO {
  const primaryContact = (customer.primaryContact as any) || {};
  const billingAddress = (customer.billingAddress as any) || {};
  
  const totalOrders = customer._count?.orders || customer.orders?.length || 0;
  const activeOrders =
    customer.orders?.filter((o) => o.status !== 'DRAFT').length || 0;
  
  // Static metrics (can be enhanced with actual calculations)
  const totalSpend = totalOrders * 1500; // Placeholder calculation
  const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
  
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    primaryContact: {
      name: primaryContact.name || null,
      email: primaryContact.email || customer.email || null,
      phone: primaryContact.phone || customer.phone || null,
    },
    billingInfo: {
      street: billingAddress.street || null,
      city: billingAddress.city || null,
      state: billingAddress.state || null,
      zip: billingAddress.zip || null,
    },
    metrics: {
      totalOrders,
      activeOrders,
      totalSpend,
      averageOrderValue,
    },
    createdAt: customer.createdAt.toISOString(),
  };
}

