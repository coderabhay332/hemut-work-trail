import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Freight Marketplace API',
      version: '1.0.0',
      description: 'Production-ready REST API for a freight marketplace/quoting system',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Customer UUID',
            },
            name: {
              type: 'string',
              description: 'Customer name',
            },
            email: {
              type: 'string',
              format: 'email',
              nullable: true,
              description: 'Customer email',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Order UUID',
            },
            customerId: {
              type: 'string',
              format: 'uuid',
              description: 'Customer UUID',
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'QUOTED', 'CONFIRMED'],
              description: 'Order status',
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Order notes',
            },
            routeGeometry: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'number',
                },
              },
              description: 'Route geometry as polyline array [[lat, lng], ...]',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            customer: {
              $ref: '#/components/schemas/Customer',
            },
            stops: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Stop',
              },
            },
          },
        },
        Stop: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Stop UUID',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
              description: 'Order UUID',
            },
            sequence: {
              type: 'integer',
              minimum: 1,
              description: 'Stop sequence number (1, 2, 3, ...)',
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              description: 'Latitude coordinate',
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              description: 'Longitude coordinate',
            },
            plannedTime: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Planned arrival time',
            },
            address: {
              type: 'string',
              description: 'Stop address',
            },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['customerId', 'stops'],
          properties: {
            customerId: {
              type: 'string',
              format: 'uuid',
              description: 'Customer UUID',
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'QUOTED', 'CONFIRMED'],
              default: 'DRAFT',
              description: 'Order status',
            },
            notes: {
              type: 'string',
              description: 'Order notes',
            },
            routeGeometry: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'number',
                },
              },
              description: 'Optional route geometry (auto-calculated if not provided)',
            },
            stops: {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/components/schemas/StopInput',
              },
            },
          },
        },
        StopInput: {
          type: 'object',
          required: ['sequence', 'latitude', 'longitude', 'address'],
          properties: {
            sequence: {
              type: 'integer',
              minimum: 1,
              description: 'Stop sequence number',
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
            },
            plannedTime: {
              type: 'string',
              format: 'date-time',
              description: 'Planned arrival time',
            },
            address: {
              type: 'string',
              minLength: 1,
            },
          },
        },
        UpdateStopsRequest: {
          type: 'object',
          required: ['stops'],
          properties: {
            stops: {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/components/schemas/StopInput',
              },
            },
          },
        },
        OrderListResponse: {
          type: 'object',
          properties: {
            orders: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Order',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                },
                limit: {
                  type: 'integer',
                },
                total: {
                  type: 'integer',
                },
                totalPages: {
                  type: 'integer',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Customers',
        description: 'Customer search endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoint',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

