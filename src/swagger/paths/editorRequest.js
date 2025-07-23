/**
 * Editor Request API endpoints documentation
 */

module.exports = {
  '/api/editorRequest/assigned-mosques': {
    get: {
      summary: 'Get assigned mosques for editor',
      description: 'Retrieve the list of mosques assigned to the authenticated editor',
      tags: ['EditorRequest'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'List of assigned mosques retrieved successfully',
          content: {
            'application/json': {
              schema: {
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
                      $ref: '#/components/schemas/Mosque'
                    }
                  }
                }
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