import prisma from '../prisma/client';
import { toCustomerDetailDTO } from '../dto/customer.dto';

export class CustomerService {
  /**
   * Search customers by name (case-insensitive partial match)
   * Limited to 10 results
   */
  async searchCustomers(query: string) {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    return customers;
  }

  /**
   * Get customer details with metrics
   * Returns frontend-ready data with computed metrics
   */
  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!customer) {
      return null;
    }

    // Transform to frontend-ready DTO
    return toCustomerDetailDTO(customer);
  }
}

export const customerService = new CustomerService();

