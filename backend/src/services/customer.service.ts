import prisma from '../prisma/client';
import { toCustomerDetailDTO } from '../dto/customer.dto';
import { cacheService } from './cache.service';

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
    const cacheKey = `customer:${id}`;

    // Try to get from cache
    if (cacheService.isAvailable()) {
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    }

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
    const result = toCustomerDetailDTO(customer);

    // Cache for 10 minutes (600 seconds)
    if (cacheService.isAvailable()) {
      await cacheService.set(cacheKey, result, 600);
    }

    return result;
  }
}

export const customerService = new CustomerService();

