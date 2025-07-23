/**
 * Base Timing API endpoints documentation
 */

module.exports = {
  '/api/base-timing/upload': {
    post: {
      summary: 'Upload base timing data',
      description: 'Upload a CSV file containing base prayer timing data (admin only)',
      tags: ['BaseTiming'],
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
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'CSV file containing base timing data'
                }
              },
              required: ['file']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Base timing data uploaded successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BaseTimingUploadResponse'
              }
            }
          }
        },
        '400': {
          description: 'Invalid file format or data',
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
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};