/**
 * Mosque Timing Configuration related schemas
 */

module.exports = {
  // Mosque Timing Configuration model
  MosqueTimingConfig: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      mosqueId: {
        $ref: '#/components/schemas/ObjectId',
        description: 'ID of the mosque this configuration belongs to'
      },
      calculationMethod: {
        type: 'string',
        enum: ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari'],
        description: 'Prayer time calculation method',
        example: 'Karachi'
      },
      asrMethod: {
        type: 'string',
        enum: ['Standard', 'Hanafi'],
        description: 'Asr calculation method',
        example: 'Hanafi'
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
      highLatitudeMethod: {
        type: 'string',
        enum: ['NightMiddle', 'AngleBased', 'OneSeventh', 'None'],
        description: 'Method for high latitude regions',
        example: 'NightMiddle'
      },
      timezone: {
        type: 'string',
        description: 'Timezone for the mosque',
        example: 'Asia/Karachi'
      },
      createdBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who created this configuration'
      },
      updatedBy: {
        $ref: '#/components/schemas/ObjectId',
        description: 'User who last updated this configuration',
        nullable: true
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'mosqueId', 'calculationMethod', 'asrMethod', 'adjustments', 'timezone', 'createdBy']
  },
  
  // Create/Update Mosque Timing Configuration request
  MosqueTimingConfigRequest: {
    type: 'object',
    properties: {
      calculationMethod: {
        type: 'string',
        enum: ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari'],
        description: 'Prayer time calculation method',
        example: 'Karachi'
      },
      asrMethod: {
        type: 'string',
        enum: ['Standard', 'Hanafi'],
        description: 'Asr calculation method',
        example: 'Hanafi'
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
      highLatitudeMethod: {
        type: 'string',
        enum: ['NightMiddle', 'AngleBased', 'OneSeventh', 'None'],
        description: 'Method for high latitude regions',
        example: 'NightMiddle'
      },
      timezone: {
        type: 'string',
        description: 'Timezone for the mosque',
        example: 'Asia/Karachi'
      }
    },
    required: ['calculationMethod', 'asrMethod', 'adjustments', 'timezone']
  },
  
  // Generate Timings request
  GenerateTimingsRequest: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        minimum: 2020,
        maximum: 2030,
        description: 'Year to generate timings for',
        example: 2024
      },
      month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        description: 'Month to generate timings for (optional, generates full year if omitted)',
        example: 7
      },
      overwrite: {
        type: 'boolean',
        description: 'Whether to overwrite existing timings',
        example: false
      }
    },
    required: ['year']
  },
  
  // Preview Timings request
  PreviewTimingsRequest: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date',
        description: 'Date to preview timings for',
        example: '2024-07-23'
      },
      calculationMethod: {
        type: 'string',
        enum: ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari'],
        description: 'Prayer time calculation method',
        example: 'Karachi'
      },
      asrMethod: {
        type: 'string',
        enum: ['Standard', 'Hanafi'],
        description: 'Asr calculation method',
        example: 'Hanafi'
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
        }
      },
      highLatitudeMethod: {
        type: 'string',
        enum: ['NightMiddle', 'AngleBased', 'OneSeventh', 'None'],
        description: 'Method for high latitude regions',
        example: 'NightMiddle'
      }
    },
    required: ['date']
  },
  
  // Mosque Timing Configuration response
  MosqueTimingConfigResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/MosqueTimingConfig'
      }
    },
    required: ['status', 'data']
  },
  
  // Generate Timings response
  GenerateTimingsResponse: {
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
          mosqueId: {
            $ref: '#/components/schemas/ObjectId'
          },
          year: {
            type: 'integer',
            example: 2024
          },
          month: {
            type: 'integer',
            example: 7,
            nullable: true
          },
          recordsGenerated: {
            type: 'integer',
            example: 31
          },
          recordsOverwritten: {
            type: 'integer',
            example: 0
          }
        }
      }
    },
    required: ['status', 'data']
  },
  
  // Preview Timings response
  PreviewTimingsResponse: {
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
          date: {
            type: 'string',
            format: 'date',
            example: '2024-07-23'
          },
          timings: {
            type: 'object',
            properties: {
              fajr: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '04:30'
              },
              sunrise: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '05:45'
              },
              dhuhr: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '12:15'
              },
              asr: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '15:30'
              },
              maghrib: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '18:20'
              },
              isha: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '19:45'
              }
            }
          },
          calculationMethod: {
            type: 'string',
            example: 'Karachi'
          },
          asrMethod: {
            type: 'string',
            example: 'Hanafi'
          }
        }
      }
    },
    required: ['status', 'data']
  }
};