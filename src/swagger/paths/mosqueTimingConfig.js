/**
 * Mosque Timing Configuration API endpoints documentation
 */

module.exports = {
  '/api/timing-config/mosque/{mosqueId}': {
    get: {
      summary: 'Get timing configuration for a mosque',
      description: 'Retrieve the prayer timing configuration for a specific mosque (editor/admin only)',
      tags: ['MosqueTimingConfig'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: 'Timing configuration retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueTimingConfigResponse'
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
    },
    post: {
      summary: 'Create or update timing configuration',
      description: 'Create or update the prayer timing configuration for a specific mosque (editor/admin only)',
      tags: ['MosqueTimingConfig'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/MosqueTimingConfigRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Timing configuration created or updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueTimingConfigResponse'
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
  
  '/api/timing-config/mosque/{mosqueId}/generate': {
    post: {
      summary: 'Generate prayer timings',
      description: 'Generate prayer timings for a specific mosque based on its configuration (editor/admin only)',
      tags: ['MosqueTimingConfig'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/GenerateTimingsRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Prayer timings generated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GenerateTimingsResponse'
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
          description: 'Mosque or configuration not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'Mosque timing configuration not found'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/timing-config/mosque/{mosqueId}/preview': {
    post: {
      summary: 'Preview prayer timings',
      description: 'Preview prayer timings for a specific date without saving them (editor/admin only)',
      tags: ['MosqueTimingConfig'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PreviewTimingsRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Prayer timings preview generated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PreviewTimingsResponse'
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
  }
};