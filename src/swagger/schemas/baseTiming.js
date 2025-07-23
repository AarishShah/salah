/**
 * Base Timing related schemas
 */

module.exports = {
  // Base timing upload response
  BaseTimingUploadResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Base timing data uploaded successfully'
      },
      data: {
        type: 'object',
        properties: {
          recordsProcessed: {
            type: 'integer',
            description: 'Number of records processed',
            example: 365
          },
          recordsAdded: {
            type: 'integer',
            description: 'Number of new records added',
            example: 365
          },
          recordsUpdated: {
            type: 'integer',
            description: 'Number of existing records updated',
            example: 0
          }
        }
      }
    },
    required: ['status', 'message']
  },
  
  // Base timing entry
  BaseTimingEntry: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Date in YYYY-MM-DD format',
        example: '2024-07-23'
      },
      fajr: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: 'Fajr prayer time (HH:MM)',
        example: '04:30'
      },
      sunrise: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: 'Sunrise time (HH:MM)',
        example: '05:45'
      },
      dhuhr: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: 'Dhuhr prayer time (HH:MM)',
        example: '12:15'
      },
      asr: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: 'Asr prayer time (HH:MM)',
        example: '15:30'
      },
      maghrib: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: 'Maghrib prayer time (HH:MM)',
        example: '18:20'
      },
      isha: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: 'Isha prayer time (HH:MM)',
        example: '19:45'
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'date', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
  }
};