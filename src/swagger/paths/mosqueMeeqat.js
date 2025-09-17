/**
 * Mosque Meeqat API endpoints documentation
 */

module.exports = {
  '/api/mosqueMeeqat/{mosqueId}': {
    get: {
      summary: 'Get mosque Meeqat',
      description: 'Retrieve the Meeqat for a specific mosque with optional date range and format filtering',
      tags: ['MosqueMeeqat'],
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
        },
        {
          name: 'startDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Start date for filtering (YYYY-MM-DD)'
        },
        {
          name: 'endDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'End date for filtering (YYYY-MM-DD)'
        },
        {
          name: 'timeFormat',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['12h', '24h', 'original'],
            default: '12h'
          },
          description: 'Time format for display'
        }
      ],
      responses: {
        '200': {
          description: 'Mosque Meeqat retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueMeeqatResponse'
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
    },
    patch: {
      summary: 'Update mosque Meeqat',
      description: 'Update the Meeqat for a specific mosque (editor/admin only)',
      tags: ['MosqueMeeqat'],
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
              $ref: '#/components/schemas/UpdateMosqueMeeqatRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Mosque Meeqat updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueMeeqatResponse'
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
      summary: 'Delete mosque Meeqat',
      description: 'Delete the Meeqat for a specific mosque (editor/admin only)',
      tags: ['MosqueMeeqat'],
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
          description: 'Mosque Meeqat deleted successfully',
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

  '/api/mosqueMeeqat/generate/{mosqueId}': {
    post: {
      summary: 'Generate mosque Meeqat',
      description: 'Generate a new Meeqat for a specific mosque (editor/admin only)',
      tags: ['MosqueMeeqat'],
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
              $ref: '#/components/schemas/GenerateMosqueMeeqatRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Mosque Meeqat generated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueMeeqatResponse'
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

  '/api/mosqueMeeqat/approve/{mosqueId}': {
    patch: {
      summary: 'Approve mosque Meeqat',
      description: 'Approve or unapprove the Meeqat for a specific mosque (editor/admin only)',
      tags: ['MosqueMeeqat'],
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
              $ref: '#/components/schemas/ApproveMosqueMeeqatRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Mosque Meeqat approval status updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueMeeqatResponse'
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

  '/api/mosqueMeeqat/{mosqueId}/download-html': {
    get: {
      summary: 'Download mosque Meeqat HTML',
      description: 'Download the HTML content of the Meeqat for a specific mosque with optional filtering',
      tags: ['MosqueMeeqat'],
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
        },
        {
          name: 'startDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Start date for filtering (YYYY-MM-DD)'
        },
        {
          name: 'endDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'End date for filtering (YYYY-MM-DD)'
        },
        {
          name: 'timeFormat',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['12h', '24h', 'original'],
            default: '12h'
          },
          description: 'Time format for display'
        }
      ],
      responses: {
        '200': {
          description: 'Mosque Meeqat HTML file downloaded successfully',
          content: {
            'text/html': {
              schema: {
                type: 'string',
                format: 'binary'
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
  }
};