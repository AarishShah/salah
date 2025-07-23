/**
 * Official Meeqat related schemas
 */

module.exports = {
  // Official Meeqat model
  OfficialMeeqat: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      name: {
        type: 'string',
        description: 'Name of the official Meeqat',
        example: 'Standard Meeqat 2024'
      },
      description: {
        type: 'string',
        description: 'Description of the official Meeqat',
        example: 'Standard Meeqat configuration for 2024'
      },
      content: {
        type: 'string',
        description: 'Meeqat content in HTML format',
        example: '<div class="meeqat-content">...</div>'
      },
      isActive: {
        type: 'boolean',
        description: 'Whether this Meeqat is active',
        example: true
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
    required: ['_id', 'name', 'content', 'isActive', 'createdBy']
  },
  
  // Official Meeqat response
  OfficialMeeqatResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/OfficialMeeqat'
      }
    },
    required: ['status', 'data']
  },
  
  // Official Meeqat list response
  OfficialMeeqatListResponse: {
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
          $ref: '#/components/schemas/OfficialMeeqat'
        }
      }
    },
    required: ['status', 'data']
  },
  
  // Create Official Meeqat request
  CreateOfficialMeeqatRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the official Meeqat',
        example: 'Standard Meeqat 2024'
      },
      description: {
        type: 'string',
        description: 'Description of the official Meeqat',
        example: 'Standard Meeqat configuration for 2024'
      },
      isActive: {
        type: 'boolean',
        description: 'Whether this Meeqat should be active',
        example: true
      },
      csvFile: {
        type: 'string',
        format: 'binary',
        description: 'CSV file containing Meeqat data'
      }
    },
    required: ['name', 'csvFile']
  },
  
  // Update Official Meeqat request
  UpdateOfficialMeeqatRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the official Meeqat',
        example: 'Updated Standard Meeqat 2024'
      },
      description: {
        type: 'string',
        description: 'Description of the official Meeqat',
        example: 'Updated standard Meeqat configuration for 2024'
      },
      isActive: {
        type: 'boolean',
        description: 'Whether this Meeqat should be active',
        example: true
      },
      csvFile: {
        type: 'string',
        format: 'binary',
        description: 'CSV file containing updated Meeqat data'
      }
    }
  }
};