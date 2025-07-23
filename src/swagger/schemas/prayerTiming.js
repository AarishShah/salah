/**
 * Prayer timing related schemas
 */

module.exports = {
  // Single prayer timing
  PrayerTime: {
    type: 'object',
    properties: {
      fajr: {
        $ref: '#/components/schemas/TimeString'
      },
      sunrise: {
        $ref: '#/components/schemas/TimeString'
      },
      dhuhr: {
        $ref: '#/components/schemas/TimeString'
      },
      asr: {
        $ref: '#/components/schemas/TimeString'
      },
      maghrib: {
        $ref: '#/components/schemas/TimeString'
      },
      isha: {
        $ref: '#/components/schemas/TimeString'
      }
    },
    required: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
  },

  // Daily prayer timing with date
  DailyPrayerTiming: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      mosqueId: {
        $ref: '#/components/schemas/ObjectId'
      },
      date: {
        $ref: '#/components/schemas/DateString'
      },
      timings: {
        $ref: '#/components/schemas/PrayerTime'
      },
      isCustom: {
        type: 'boolean',
        example: false,
        description: 'Whether timings were manually customized'
      },
      customizedBy: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true,
        description: 'User who customized the timings'
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'mosqueId', 'date', 'timings']
  },

  // Update prayer timing request
  UpdatePrayerTimingRequest: {
    type: 'object',
    properties: {
      timings: {
        type: 'object',
        properties: {
          fajr: {
            $ref: '#/components/schemas/TimeString'
          },
          sunrise: {
            $ref: '#/components/schemas/TimeString'
          },
          dhuhr: {
            $ref: '#/components/schemas/TimeString'
          },
          asr: {
            $ref: '#/components/schemas/TimeString'
          },
          maghrib: {
            $ref: '#/components/schemas/TimeString'
          },
          isha: {
            $ref: '#/components/schemas/TimeString'
          }
        },
        additionalProperties: false
      }
    },
    required: ['timings']
  },

  // Monthly prayer timings
  MonthlyPrayerTimings: {
    type: 'object',
    properties: {
      mosqueId: {
        $ref: '#/components/schemas/ObjectId'
      },
      year: {
        type: 'integer',
        minimum: 2020,
        maximum: 2030,
        example: 2024
      },
      month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        example: 3
      },
      timings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: {
              $ref: '#/components/schemas/DateString'
            },
            timings: {
              $ref: '#/components/schemas/PrayerTime'
            },
            isCustom: {
              type: 'boolean',
              example: false
            }
          },
          required: ['date', 'timings']
        }
      }
    },
    required: ['mosqueId', 'year', 'month', 'timings']
  },

  // Prayer timing response
  PrayerTimingResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/DailyPrayerTiming'
      }
    },
    required: ['status', 'data']
  },

  // Monthly prayer timings response
  MonthlyPrayerTimingsResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/MonthlyPrayerTimings'
      }
    },
    required: ['status', 'data']
  },

  // Mosque timings overview
  MosqueTimingsOverview: {
    type: 'object',
    properties: {
      mosqueId: {
        $ref: '#/components/schemas/ObjectId'
      },
      mosqueName: {
        type: 'string',
        example: 'Masjid Al-Noor'
      },
      currentTimings: {
        type: 'object',
        properties: {
          date: {
            $ref: '#/components/schemas/DateString'
          },
          timings: {
            $ref: '#/components/schemas/PrayerTime'
          }
        }
      },
      nextTimings: {
        type: 'object',
        properties: {
          date: {
            $ref: '#/components/schemas/DateString'
          },
          timings: {
            $ref: '#/components/schemas/PrayerTime'
          }
        }
      },
      lastUpdated: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['mosqueId', 'mosqueName', 'currentTimings']
  },

  // Mosque timings overview response
  MosqueTimingsResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/MosqueTimingsOverview'
      }
    },
    required: ['status', 'data']
  }
};