import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';

export class CustomerController {
  /**
   * GET /customers?query=
   * Search customers
   */
  async searchCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query as { query?: string };

      if (!query || query.trim().length === 0) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const customers = await customerService.searchCustomers(query);
      res.status(200).json(customers);
    } catch (error: any) {
      console.error('Error searching customers:', error.message);
      res.status(500).json({ error: 'Failed to search customers', message: error.message });
    }
  }

  /**
   * GET /customers/:id
   * Get customer details with contact info and metrics
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.status(200).json(customer);
    } catch (error: any) {
      console.error('Error fetching customer:', error.message);
      res.status(500).json({ error: 'Failed to fetch customer', message: error.message });
    }
  }
}

export const customerController = new CustomerController();

