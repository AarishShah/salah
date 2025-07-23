/**
 * Mosque Meeqat related schemas
 */

module.exports = {
  // Mosque Meeqat model
  MosqueMeeqat: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      mosqueId: {
        $ref: '#/components/schemas/ObjectId',
        description: 'ID of the mosque this Meeqat belongs to'
      },
      content: {
        type: 'string',
        description: 'Meeqat content in HTML format',
        example: '<div class="meeqat-content">...</div>'
      },
      isApproved: {
        type: 'boolean',
        description: 'Whether this Meeqat is approved',
        example: true
      },
      approvedBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who approved this Meeqat',
        nullable: true
      },
      approvedAt: {
        $ref: '#/components/schemas/DateTimeString',
        nullable: true
      },
      createdBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who created this Meeqat'
      },
      updatedBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who last updated this Meeqat',
        nullable: true
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'mosqueId', 'content', 'isApproved', 'createdBy']
  },
  
  // Generate Mosque Meeqat request
  GenerateMosqueMeeqatRequest: {
    type: 'object',
    properties: {
      template: {
        type: 'string',
        enum: ['default', 'simple', 'detailed'],
        description: 'Template to use for generation',
        example: 'default'
      },
      language: {
        type: 'string',
        enum: ['en', 'ur'],
        description: 'Language for the Meeqat content',
        example: 'en'
      },
      includeMap: {
        type: 'boolean',
        description: 'Whether to include a map in the Meeqat',
        example: true
      }
    }
  },
  
  // Update Mosque Meeqat request
  UpdateMosqueMeeqatRequest: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'Meeqat content in HTML format',
        example: '<div class="meeqat-content">...</div>'
      }
    },
    required: ['content']
  },
  
  // Approve Mosque Meeqat request
  ApproveMosqueMeeqatRequest: {
    type: 'object',
    properties: {
      approve: {
        type: 'boolean',
        description: 'Whether to approve or unapprove the Meeqat',
        example: true
      }
    },
    required: ['approve']
  },
  
  // Mosque Meeqat response
  MosqueMeeqatResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/MosqueMeeqat'
      }
    },
    required: ['status', 'data']
  },
  
  // Mosque Meeqat HTML response
  MosqueMeeqatHTMLResponse: {
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
          html: {
            type: 'string',
            description: 'HTML content of the Meeqat',
            example: '<div class="meeqat-content">...</div>'
          },
          mosqueId: {
            $ref: '#/components/schemas/ObjectId'
          },
          mosqueName: {
            type: 'string',
            example: 'Masjid Al-Noor'
          }
        }
      }
    },
    required: ['status', 'data']
  }
};