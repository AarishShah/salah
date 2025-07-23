/**
 * Meeqat Configuration API endpoints documentation
 */

module.exports = {
  '/api/meeqat-config/{mosqueId}': {
    get: {
      summary: 'Get meeqat configuration for a mosque',
      description: 'Retrieve the meeqat configuration for a specific mosque (editor/admin only)',
      tags: ['MeeqatConfig'],
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
          description: 'Meeqat configuration retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MeeqatConfigResponse'
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
    patch: {
      summary: 'Update meeqat configuration for a mosque',
      description: 'Update the meeqat configuration for a specific mosque (editor/admin only)',
      tags: ['MeeqatConfig'],
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
              $ref: '#/components/schemas/UpdateMeeqatConfigRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Meeqat configuration updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MeeqatConfigResponse'
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
    },
    delete: {
      summary: 'Delete meeqat configuration for a mosque',
      description: 'Delete the meeqat configuration for a specific mosque (editor/admin only)',
      tags: ['MeeqatConfig'],
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
          description: 'Meeqat configuration deleted successfully',
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
  },
  
  '/api/meeqat-config/create/{mosqueId}': {
    post: {
      summary: 'Create meeqat configuration for a mosque',
      description: 'Create a new meeqat configuration for a specific mosque (editor/admin only)',
      tags: ['MeeqatConfig'],
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
              $ref: '#/components/schemas/CreateMeeqatConfigRequest'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Meeqat configuration created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MeeqatConfigResponse'
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
        '409': {
          description: 'Configuration already exists for this mosque',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'A configuration already exists for this mosque'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};