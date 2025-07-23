/**
 * Common schema definitions used across multiple endpoints
 */

module.exports = {
  // Standard success response
  SuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success',
        description: 'Response status indicator'
      },
      message: {
        type: 'string',
        example: 'Operation completed successfully',
        description: 'Human-readable success message'
      },
      data: {
        type: 'object',
        description: 'Response payload (structure varies by endpoint)'
      }
    },
    required: ['status']
  },
  
  // Standard error response
  Error: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['failed'],
        example: 'failed',
        description: 'Error status indicator'
      },
      message: {
        type: 'string',
        example: 'Error message',
        description: 'Human-readable error message'
      },
      code: {
        type: 'string',
        description: 'Error code for client-side error handling',
        example: 'RESOURCE_NOT_FOUND'
      }
    },
    required: ['status', 'message']
  },
  
  // Validation error response
  ValidationError: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['failed'],
        example: 'failed',
        description: 'Error status indicator'
      },
      message: {
        type: 'string',
        example: 'Validation error',
        description: 'Human-readable error message'
      },
      errors: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['Field is required', 'Invalid format'],
        description: 'List of specific validation errors'
      },
      fields: {
        type: 'object',
        description: 'Field-specific validation errors',
        example: {
          email: 'Invalid email format',
          password: 'Password must be at least 8 characters'
        }
      }
    },
    required: ['status', 'message']
  },
  
  // Pagination metadata
  PaginationMeta: {
    type: 'object',
    properties: {
      total: {
        type: 'integer',
        description: 'Total number of items',
        example: 100
      },
      page: {
        type: 'integer',
        description: 'Current page number',
        example: 1
      },
      limit: {
        type: 'integer',
        description: 'Number of items per page',
        example: 10
      },
      pages: {
        type: 'integer',
        description: 'Total number of pages',
        example: 10
      },
      hasNextPage: {
        type: 'boolean',
        description: 'Whether there is a next page',
        example: true
      },
      hasPrevPage: {
        type: 'boolean',
        description: 'Whether there is a previous page',
        example: false
      }
    },
    required: ['total', 'page', 'limit', 'pages']
  },
  
  // Paginated response wrapper
  PaginatedResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        type: 'array',
        items: {
          type: 'object'
        },
        description: 'Array of items (structure varies by endpoint)'
      },
      meta: {
        $ref: '#/components/schemas/PaginationMeta'
      }
    },
    required: ['status', 'data', 'meta']
  },
  
  // MongoDB ObjectId
  ObjectId: {
    type: 'string',
    pattern: '^[0-9a-fA-F]{24}$',
    description: 'MongoDB ObjectId',
    example: '60d21b4667d0d8992e610c85'
  },
  
  // Date-time string
  DateTimeString: {
    type: 'string',
    format: 'date-time',
    description: 'ISO 8601 date-time string',
    example: '2023-07-21T14:30:00Z'
  },
  
  // Coordinates (GeoJSON Point)
  GeoPoint: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: 'array',
        items: {
          type: 'number'
        },
        minItems: 2,
        maxItems: 2,
        description: '[longitude, latitude]',
        example: [73.0479, 33.6844]
      }
    },
    required: ['type', 'coordinates']
  },
  
  // Query parameters for pagination
  PaginationParams: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: 'Page number (1-based)',
        default: 1,
        minimum: 1,
        example: 1
      },
      limit: {
        type: 'integer',
        description: 'Number of items per page',
        default: 10,
        minimum: 1,
        maximum: 100,
        example: 10
      },
      sort: {
        type: 'string',
        description: 'Sort field and direction (prefix with - for descending)',
        example: '-createdAt'
      }
    }
  },
  
  // Role enum
  Role: {
    type: 'string',
    enum: ['user', 'editor', 'admin'],
    description: 'User role defining permissions',
    example: 'user'
  }
};