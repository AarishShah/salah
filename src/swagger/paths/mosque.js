/**
 * Mosque API endpoints documentation
 */

module.exports = {
  '/api/mosque/map/nearby': {
    get: {
      summary: 'Find nearby mosques',
      description: 'Get a list of mosques within a specified radius of given coordinates',
      tags: ['Mosque'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'query',
          name: 'lat',
          required: true,
          schema: {
            type: 'number',
            minimum: -90,
            maximum: 90
          },
          description: 'Latitude coordinate',
          example: 24.8607
        },
        {
          in: 'query',
          name: 'lng',
          required: true,
          schema: {
            type: 'number',
            minimum: -180,
            maximum: 180
          },
          description: 'Longitude coordinate',
          example: 67.0011
        },
        {
          in: 'query',
          name: 'radius',
          required: false,
          schema: {
            type: 'number',
            minimum: 0.1,
            maximum: 50,
            default: 5
          },
          description: 'Search radius in kilometers',
          example: 10
        },
        {
          in: 'query',
          name: 'sect',
          required: false,
          schema: {
            type: 'string',
            enum: ['sunni', 'shia']
          },
          description: 'Filter by Islamic sect'
        }
      ],
      responses: {
        '200': {
          description: 'List of nearby mosques retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueListResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/ValidationError'
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/mosque/search': {
    get: {
      summary: 'Search mosques by name or locality',
      description: 'Search for mosques using text query with optional filters',
      tags: ['Mosque'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'query',
          name: 'q',
          required: true,
          schema: {
            type: 'string',
            minLength: 2
          },
          description: 'Search query for mosque name or locality',
          example: 'Al-Noor'
        },
        {
          in: 'query',
          name: 'locality',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filter by specific locality',
          example: 'Karachi'
        },
        {
          in: 'query',
          name: 'sect',
          required: false,
          schema: {
            type: 'string',
            enum: ['sunni', 'shia']
          },
          description: 'Filter by Islamic sect'
        },
        {
          in: 'query',
          name: 'limit',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Maximum number of results'
        }
      ],
      responses: {
        '200': {
          description: 'Search results retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueListResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/ValidationError'
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/mosque/{id}': {
    get: {
      summary: 'Get mosque details by ID',
      description: 'Retrieve detailed information about a specific mosque',
      tags: ['Mosque'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'Mosque ID',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: 'Mosque details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueResponse'
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '404': {
          $ref: '#/components/responses/NotFoundError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/mosque/editor/{id}/official-meeqat': {
    patch: {
      summary: 'Set official Meeqat for mosque',
      description: 'Set the official Meeqat configuration for a mosque (editor/admin only)',
      tags: ['Mosque'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'Mosque ID',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SetOfficialMeeqatRequest'
            },
            example: {
              officialMeeqatId: '507f1f77bcf86cd799439012'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Official Meeqat set successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/ValidationError'
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError'
        },
        '404': {
          $ref: '#/components/responses/NotFoundError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/mosque/admin/create': {
    post: {
      summary: 'Create new mosque',
      description: 'Create a new mosque entry (admin only)',
      tags: ['Mosque'],
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateMosqueRequest'
            },
            example: {
              name: 'Masjid Al-Noor',
              address: '123 Main Street, Downtown',
              locality: 'Karachi',
              coordinates: {
                longitude: 67.0011,
                latitude: 24.8607
              },
              sect: 'sunni',
              schoolOfThought: 'hanafi'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Mosque created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/ValidationError'
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/mosque/admin/{id}': {
    delete: {
      summary: 'Delete mosque',
      description: 'Soft delete a mosque (admin only)',
      tags: ['Mosque'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'Mosque ID',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: 'Mosque deleted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError'
        },
        '404': {
          $ref: '#/components/responses/NotFoundError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};