/**
 * Official Meeqat API endpoints documentation
 */

module.exports = {
  '/api/official-meeqat': {
    get: {
      summary: 'Get all official Meeqats',
      description: 'Retrieve a list of all official Meeqats (admin only)',
      tags: ['OfficialMeeqat'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'List of official Meeqats retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OfficialMeeqatListResponse'
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
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    },
    post: {
      summary: 'Create official Meeqat',
      description: 'Create a new official Meeqat by uploading a CSV file (admin only)',
      tags: ['OfficialMeeqat'],
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/CreateOfficialMeeqatRequest'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Official Meeqat created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OfficialMeeqatResponse'
              }
            }
          }
        },
        '400': {
          description: 'Invalid request or file format',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'Invalid CSV format or missing required columns'
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
        '429': {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'Too many upload requests. Please try again later.'
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
  
  '/api/official-meeqat/{id}': {
    get: {
      summary: 'Get official Meeqat by ID',
      description: 'Retrieve a specific official Meeqat by its ID',
      tags: ['OfficialMeeqat'],
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
          description: 'ID of the official Meeqat',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: 'Official Meeqat retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OfficialMeeqatResponse'
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
    put: {
      summary: 'Update official Meeqat',
      description: 'Update an existing official Meeqat (admin only)',
      tags: ['OfficialMeeqat'],
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
          description: 'ID of the official Meeqat',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/UpdateOfficialMeeqatRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Official Meeqat updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OfficialMeeqatResponse'
              }
            }
          }
        },
        '400': {
          description: 'Invalid request or file format',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
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
        '429': {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'Too many upload requests. Please try again later.'
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