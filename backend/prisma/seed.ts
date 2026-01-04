/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create 5 customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Acme Logistics',
        email: 'contact@acmelogistics.com',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Global Shipping Co',
        email: 'info@globalshipping.com',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Fast Freight Inc',
        email: 'hello@fastfreight.com',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Metro Transport',
        email: 'support@metrotransport.com',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'City Delivery Services',
        email: 'contact@citydelivery.com',
      },
    }),
  ]);

  console.log(`Created ${customers.length} customers`);

  // Create 3 orders with 2-4 stops each
  const order1 = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      status: 'QUOTED',
      notes: 'Urgent delivery required',
      equipmentType: 'Dry Van',
      commodity: 'Electronics',
      weightLbs: 5000,
      miles: 15.5,
      rate: 1250.00,
      routeGeometry: [
        [40.7128, -74.006], // NYC
        [40.7589, -73.9851], // Times Square
        [40.7505, -73.9934], // Central Park
      ],
      stops: {
        create: [
          {
            sequence: 1,
            latitude: 40.7128,
            longitude: -74.006,
            address: '123 Main St, New York, NY 10001',
            city: 'New York',
            state: 'NY',
            stopType: 'PICKUP',
            plannedTime: new Date('2024-01-15T09:00:00Z'),
          },
          {
            sequence: 2,
            latitude: 40.7589,
            longitude: -73.9851,
            address: '456 Broadway, New York, NY 10013',
            city: 'New York',
            state: 'NY',
            stopType: 'DELIVERY',
            plannedTime: new Date('2024-01-15T10:30:00Z'),
          },
          {
            sequence: 3,
            latitude: 40.7505,
            longitude: -73.9934,
            address: '789 Park Ave, New York, NY 10019',
            city: 'New York',
            state: 'NY',
            stopType: 'DELIVERY',
            plannedTime: new Date('2024-01-15T12:00:00Z'),
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customers[1].id,
      status: 'CONFIRMED',
      notes: 'Fragile items - handle with care',
      equipmentType: 'Refrigerated',
      commodity: 'Food Products',
      weightLbs: 8000,
      miles: 25.3,
      rate: 2100.50,
      routeGeometry: [
        [34.0522, -118.2437], // LA
        [34.0535, -118.2451], // Nearby location
      ],
      stops: {
        create: [
          {
            sequence: 1,
            latitude: 34.0522,
            longitude: -118.2437,
            address: '100 Hollywood Blvd, Los Angeles, CA 90028',
            city: 'Los Angeles',
            state: 'CA',
            stopType: 'PICKUP',
            plannedTime: new Date('2024-01-16T08:00:00Z'),
          },
          {
            sequence: 2,
            latitude: 34.0535,
            longitude: -118.2451,
            address: '200 Sunset Blvd, Los Angeles, CA 90028',
            city: 'Los Angeles',
            state: 'CA',
            stopType: 'DELIVERY',
            plannedTime: new Date('2024-01-16T09:30:00Z'),
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      customerId: customers[2].id,
      status: 'DRAFT',
      notes: 'Multi-stop delivery route',
      equipmentType: 'Flatbed',
      commodity: 'Construction Materials',
      weightLbs: 12000,
      miles: 45.8,
      rate: 3200.75,
      routeGeometry: [
        [41.8781, -87.6298], // Chicago
        [41.8819, -87.6278],
        [41.8848, -87.6324],
        [41.8886, -87.6352],
      ],
      stops: {
        create: [
          {
            sequence: 1,
            latitude: 41.8781,
            longitude: -87.6298,
            address: '300 Michigan Ave, Chicago, IL 60601',
            city: 'Chicago',
            state: 'IL',
            stopType: 'PICKUP',
            plannedTime: new Date('2024-01-17T07:00:00Z'),
          },
          {
            sequence: 2,
            latitude: 41.8819,
            longitude: -87.6278,
            address: '400 State St, Chicago, IL 60605',
            city: 'Chicago',
            state: 'IL',
            stopType: 'DELIVERY',
            plannedTime: new Date('2024-01-17T08:15:00Z'),
          },
          {
            sequence: 3,
            latitude: 41.8848,
            longitude: -87.6324,
            address: '500 Wacker Dr, Chicago, IL 60606',
            city: 'Chicago',
            state: 'IL',
            stopType: 'DELIVERY',
            plannedTime: new Date('2024-01-17T09:30:00Z'),
          },
          {
            sequence: 4,
            latitude: 41.8886,
            longitude: -87.6352,
            address: '600 Lake Shore Dr, Chicago, IL 60611',
            city: 'Chicago',
            state: 'IL',
            stopType: 'DELIVERY',
            plannedTime: new Date('2024-01-17T11:00:00Z'),
          },
        ],
      },
    },
  });

  console.log(`Created 3 orders with stops`);
  console.log(`Order 1: ${order1.id} (3 stops)`);
  console.log(`Order 2: ${order2.id} (2 stops)`);
  console.log(`Order 3: ${order3.id} (4 stops)`);

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

