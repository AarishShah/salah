/**
 * Meeqat Configuration related schemas
 */

module.exports = {
  // Meeqat configuration model
  MeeqatConfig: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      mosqueId: {
        $ref: '#/components/schemas/ObjectId',
        description: 'ID of the mosque this configuration belongs to'
      },
      name: {
        type: 'string',
        description: 'Name of the configuration',
        example: 'Ramadan 2024 Configuration'
      },
      description: {
        type: 'string',
        description: 'Description of the configuration',
        example: 'Special prayer timing adjustments for Ramadan'
      },
      adjustments: {
        type: 'object',
        properties: {
          fajr: {
            type: 'integer',
            description: 'Adjustment in minutes for Fajr prayer',
            example: 5
          },
          sunrise: {
            type: 'integer',
            description: 'Adjustment in minutes for Sunrise',
            example: 0
          },
          dhuhr: {
            type: 'integer',
            description: 'Adjustment in minutes for Dhuhr prayer',
            example: 10
          },
          asr: {
            type: 'integer',
            description: 'Adjustment in minutes for Asr prayer',
            example: 5
          },
          maghrib: {
            type: 'integer',
            description: 'Adjustment in minutes for Maghrib prayer',
            example: 0
          },
          isha: {
            type: 'integer',
            description: 'Adjustment in minutes for Isha prayer',
            example: 15
          }
        }
      },
      isActive: {
        type: 'boolean',
        description: 'Whether this configuration is currently active',
        example: true
      },
      createdBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who created this configuration'
      },
      updatedBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who last updated this configuration'
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'mosqueId', 'name', 'adjustments', 'isActive', 'createdBy']
  },
  
  // Create meeqat configuration request
  CreateMeeqatConfigRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
        description: 'Name of the configuration',
        example: 'Ramadan 2024 Configuration'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Description of the configuration',
        example: 'Special prayer timing adjustments for Ramadan'
      },
      adjustments: {
        type: 'object',
        properties: {
          fajr: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Fajr prayer',
            example: 5
          },
          sunrise: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Sunrise',
            example: 0
          },
          dhuhr: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Dhuhr prayer',
            example: 10
          },
          asr: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Asr prayer',
            example: 5
          },
          maghrib: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Maghrib prayer',
            example: 0
          },
          isha: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Isha prayer',
            example: 15
          }
        },
        required: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
      },
      isActive: {
        type: 'boolean',
        description: 'Whether this configuration should be active',
        example: true
      }
    },
    required: ['name', 'adjustments']
  },
  
  // Update meeqat configuration request
  UpdateMeeqatConfigRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
        description: 'Name of the configuration',
        example: 'Updated Ramadan Configuration'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Description of the configuration',
        example: 'Updated prayer timing adjustments for Ramadan'
      },
      adjustments: {
        type: 'object',
        properties: {
          fajr: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Fajr prayer',
            example: 10
          },
          sunrise: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Sunrise',
            example: 0
          },
          dhuhr: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Dhuhr prayer',
            example: 15
          },
          asr: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Asr prayer',
            example: 10
          },
          maghrib: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Maghrib prayer',
            example: 0
          },
          isha: {
            type: 'integer',
            minimum: -60,
            maximum: 60,
            description: 'Adjustment in minutes for Isha prayer',
            example: 20
          }
        }
      },
      isActive: {
        type: 'boolean',
        description: 'Whether this configuration should be active',
        example: true
      }
    },
    minProperties: 1
  },
  
  // Meeqat configuration response
  MeeqatConfigResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/MeeqatConfig'
      }
    },
    required: ['status', 'data']
  }
};