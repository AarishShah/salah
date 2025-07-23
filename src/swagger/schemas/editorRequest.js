/**
 * Editor request related schemas
 */

module.exports = {
  // Editor request model
  EditorRequest: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      userId: {
        $ref: '#/components/schemas/ObjectId'
      },
      mosqueIds: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectId'
        },
        description: 'Array of mosque IDs user wants to edit'
      },
      reason: {
        type: 'string',
        example: 'I am the imam of these mosques and would like to manage their prayer timings.'
      },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'pending'
      },
      reviewedBy: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true,
        description: 'Admin who reviewed the request'
      },
      reviewedAt: {
        $ref: '#/components/schemas/DateTimeString',
        nullable: true
      },
      reviewNotes: {
        type: 'string',
        nullable: true,
        example: 'Request approved after verification'
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'userId', 'mosqueIds', 'reason', 'status']
  },

  // Create editor request
  CreateEditorRequest: {
    type: 'object',
    properties: {
      mosqueIds: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectId'
        },
        minItems: 1,
        maxItems: 10,
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
      },
      reason: {
        type: 'string',
        minLength: 20,
        maxLength: 500,
        example: 'I am the imam of these mosques and would like to manage their prayer timings to ensure accuracy for our community.'
      }
    },
    required: ['mosqueIds', 'reason']
  },

  // Editor request with user details (for admin view)
  EditorRequestWithUser: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      user: {
        type: 'object',
        properties: {
          _id: {
            $ref: '#/components/schemas/ObjectId'
          },
          name: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            nullable: true,
            example: '+1234567890'
          }
        }
      },
      mosques: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },
            name: {
              type: 'string',
              example: 'Masjid Al-Noor'
            },
            locality: {
              type: 'string',
              example: 'Karachi'
            }
          }
        }
      },
      reason: {
        type: 'string',
        example: 'I am the imam of these mosques and would like to manage their prayer timings.'
      },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'pending'
      },
      reviewedBy: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true
      },
      reviewedAt: {
        $ref: '#/components/schemas/DateTimeString',
        nullable: true
      },
      reviewNotes: {
        type: 'string',
        nullable: true
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'user', 'mosques', 'reason', 'status']
  },

  // Handle editor request
  HandleEditorRequest: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['approve', 'reject'],
        example: 'approve'
      },
      reviewNotes: {
        type: 'string',
        maxLength: 500,
        example: 'Request approved after verification of credentials'
      }
    },
    required: ['action']
  },

  // Editor request status response
  EditorRequestStatusResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        type: 'object',
        properties: {
          hasRequest: {
            type: 'boolean',
            example: true
          },
          request: {
            $ref: '#/components/schemas/EditorRequest',
            nullable: true
          }
        }
      }
    },
    required: ['status', 'data']
  },

  // Editor request response
  EditorRequestResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Editor request submitted successfully'
      },
      data: {
        $ref: '#/components/schemas/EditorRequest'
      }
    },
    required: ['status', 'data']
  },

  // Editor requests list response
  EditorRequestsListResponse: {
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
      count: {
        type: 'integer',
        example: 5
      }
    },
    required: ['status', 'data', 'count']
  }
};