// Admin related schemas

module.exports = {
  // Update User Role Request
  UpdateUserRoleRequest: {
    type: 'object',
    properties: {
      role: {
        type: 'string',
        enum: ['user', 'editor', 'admin'],
        description: 'New role for the user',
        example: 'editor'
      }
    },
    required: ['role']
  },

  // Update User Status Request
  UpdateUserStatusRequest: {
    type: 'object',
    properties: {
      isActive: {
        type: 'boolean',
        description: 'User active status',
        example: true
      },
      isBlocked: {
        type: 'boolean',
        description: 'User blocked status',
        example: false
      },
      blockedReason: {
        type: 'string',
        description: 'Reason for blocking (required if isBlocked is true)',
        example: 'Violation of terms of service'
      }
    },
    required: ['isActive', 'isBlocked']
  },

  // Update User Mosques Request
  UpdateUserMosquesRequest: {
    type: 'object',
    properties: {
      assignedMosques: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectId'
        },
        description: 'Array of mosque IDs to assign to the user',
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
      }
    },
    required: ['assignedMosques']
  },

  // Admin Action Response
  AdminActionResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'User updated successfully'
      },
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/UserProfile'
          },
          actionPerformed: {
            type: 'string',
            description: 'Description of the action performed',
            example: 'Role updated from user to editor'
          },
          performedBy: {
            $ref: '#/components/schemas/ObjectId'
          },
          performedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  },

  // Editor List Response
  EditorListResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Editors retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          editors: {
            type: 'array',
            items: {
              allOf: [
                { $ref: '#/components/schemas/UserProfile' },
                {
                  type: 'object',
                  properties: {
                    assignedMosqueCount: {
                      type: 'integer',
                      description: 'Number of mosques assigned to this editor',
                      example: 3
                    },
                    lastActivity: {
                      type: 'string',
                      format: 'date-time',
                      nullable: true,
                      description: 'Last activity timestamp'
                    }
                  }
                }
              ]
            }
          },
          totalEditors: {
            type: 'integer',
            example: 25
          }
        }
      }
    }
  },

  // User Statistics Response
  UserStatsResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'User statistics retrieved successfully'
      },
      data: {
        $ref: '#/components/schemas/UserStats'
      }
    }
  }
};