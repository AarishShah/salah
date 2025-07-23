/**
 * Admin API endpoints documentation
 */

module.exports = {
  '/api/admin/all': {
    get: {
      summary: 'Get all users',
      description: 'Retrieve a list of all users in the system (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Items per page'
        },
        {
          in: 'query',
          name: 'role',
          schema: {
            type: 'string',
            enum: ['user', 'editor', 'admin']
          },
          description: 'Filter by user role'
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['active', 'blocked']
          },
          description: 'Filter by user status'
        }
      ],
      responses: {
        '200': {
          description: 'List of users retrieved successfully',
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
                      $ref: '#/components/schemas/UserListItem'
                    }
                  },
                  meta: {
                    $ref: '#/components/schemas/PaginationMeta'
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
  },
  
  '/api/admin/stats': {
    get: {
      summary: 'Get user statistics',
      description: 'Retrieve statistics about users in the system (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'User statistics retrieved successfully',
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
                    $ref: '#/components/schemas/UserStats'
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
  },
  
  '/api/admin/editors': {
    get: {
      summary: 'Get all editors',
      description: 'Retrieve a list of all users with editor role (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Items per page'
        }
      ],
      responses: {
        '200': {
          description: 'List of editors retrieved successfully',
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
                      $ref: '#/components/schemas/UserListItem'
                    }
                  },
                  meta: {
                    $ref: '#/components/schemas/PaginationMeta'
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
  },
  
  '/api/admin/editor-requests': {
    get: {
      summary: 'Get all editor requests',
      description: 'Retrieve a list of all editor role requests (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected']
          },
          description: 'Filter by request status'
        },
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Items per page'
        }
      ],
      responses: {
        '200': {
          description: 'List of editor requests retrieved successfully',
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
                      $ref: '#/components/schemas/EditorRequestWithUser'
                    }
                  },
                  meta: {
                    $ref: '#/components/schemas/PaginationMeta'
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
  },
  
  '/api/admin/editor-requests/{requestId}': {
    put: {
      summary: 'Handle an editor request',
      description: 'Approve or reject an editor role request (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'requestId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the editor request',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/HandleEditorRequest'
            },
            example: {
              action: 'approve',
              reviewNotes: 'Approved after verification of credentials'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Editor request handled successfully',
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
  
  '/api/admin/{userId}': {
    get: {
      summary: 'Get a user by ID',
      description: 'Retrieve detailed information about a specific user (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the user',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: 'User data retrieved successfully',
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
                    $ref: '#/components/schemas/UserProfile'
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
        '404': {
          $ref: '#/components/responses/NotFoundError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/admin/{userId}/role': {
    put: {
      summary: 'Update user role',
      description: 'Change the role of a specific user (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the user',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserRoleRequest'
            },
            example: {
              role: 'editor'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'User role updated successfully',
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
  
  '/api/admin/{userId}/status': {
    put: {
      summary: 'Update user status',
      description: 'Change the active/blocked status of a specific user (admin only)',
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the user',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserStatusRequest'
            },
            example: {
              isActive: true,
              isBlocked: false
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'User status updated successfully',
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
  
  '/api/admin/{userId}/mosques': {
    put: {
      summary: "Update user's mosques",
      description: "Update the list of mosques assigned to an editor (admin only)",
      tags: ['Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the user',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserMosquesRequest'
            },
            example: {
              assignedMosques: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
            }
          }
        }
      },
      responses: {
        '200': {
          description: "User's mosques updated successfully",
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
  }
};