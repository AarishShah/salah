/**
 * User related schemas
 */

module.exports = {
  // User profile (public view)
  UserProfile: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      profilePicture: {
        type: 'string',
        format: 'uri',
        nullable: true,
        example: 'https://lh3.googleusercontent.com/a/default-user'
      },
      phone: {
        type: 'string',
        nullable: true,
        example: '+1234567890'
      },
      phoneVerified: {
        type: 'boolean',
        example: false
      },
      language: {
        type: 'string',
        enum: ['en', 'ur'],
        example: 'en'
      },
      role: {
        type: 'string',
        enum: ['user', 'editor', 'admin'],
        example: 'user'
      },
      assignedMosques: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectId'
        },
        description: 'Mosques assigned to editors (empty for regular users)'
      },
      isActive: {
        type: 'boolean',
        example: true
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'email', 'name', 'language', 'role', 'isActive']
  },

  // User profile update request
  UpdateProfileRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 50,
        example: 'John Doe'
      },
      phone: {
        type: 'string',
        pattern: '^\\+?[1-9]\\d{1,14}$',
        example: '+1234567890',
        description: 'Phone number in international format'
      },
      language: {
        type: 'string',
        enum: ['en', 'ur'],
        example: 'en'
      }
    },
    additionalProperties: false
  },

  // User profile response
  UserProfileResponse: {
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
    },
    required: ['status', 'data']
  },

  // User list (admin view)
  UserListItem: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      role: {
        type: 'string',
        enum: ['user', 'editor', 'admin'],
        example: 'user'
      },
      isActive: {
        type: 'boolean',
        example: true
      },
      isBlocked: {
        type: 'boolean',
        example: false
      },
      assignedMosques: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectId'
        }
      },
      lastLoginAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'email', 'name', 'role', 'isActive']
  },

  // User statistics
  UserStats: {
    type: 'object',
    properties: {
      totalUsers: {
        type: 'integer',
        example: 1250
      },
      activeUsers: {
        type: 'integer',
        example: 1180
      },
      blockedUsers: {
        type: 'integer',
        example: 70
      },
      usersByRole: {
        type: 'object',
        properties: {
          user: {
            type: 'integer',
            example: 1100
          },
          editor: {
            type: 'integer',
            example: 140
          },
          admin: {
            type: 'integer',
            example: 10
          }
        }
      },
      recentSignups: {
        type: 'integer',
        description: 'New users in the last 30 days',
        example: 45
      }
    },
    required: ['totalUsers', 'activeUsers', 'blockedUsers', 'usersByRole']
  },

  // Update user role request
  UpdateUserRoleRequest: {
    type: 'object',
    properties: {
      role: {
        type: 'string',
        enum: ['user', 'editor', 'admin'],
        example: 'editor'
      }
    },
    required: ['role']
  },

  // Update user status request
  UpdateUserStatusRequest: {
    type: 'object',
    properties: {
      isActive: {
        type: 'boolean',
        example: true
      },
      isBlocked: {
        type: 'boolean',
        example: false
      },
      blockedReason: {
        type: 'string',
        example: 'Violation of terms of service'
      }
    },
    additionalProperties: false
  },

  // Update user mosques request
  UpdateUserMosquesRequest: {
    type: 'object',
    properties: {
      assignedMosques: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectId'
        },
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
      }
    },
    required: ['assignedMosques']
  },

  // Phone verification response
  PhoneVerificationResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Phone verification status updated'
      },
      data: {
        type: 'object',
        properties: {
          phoneVerified: {
            type: 'boolean',
            example: true
          }
        }
      }
    },
    required: ['status', 'data']
  }
};