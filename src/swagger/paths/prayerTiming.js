/**
 * Prayer Timing API endpoints documentation
 */

module.exports = {
  '/api/prayer-timings/mosque/{mosqueId}': {
    get: {
      summary: 'Get prayer timings for a mosque',
      description: 'Retrieve current prayer timings for a specific mosque',
      tags: ['PrayerTiming'],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: 'Prayer timings retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MosqueTimingsResponse'
              }
            }
          }
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
  
  '/api/prayer-timings/mosque/{mosqueId}/date/{date}': {
    get: {
      summary: 'Get prayer timing for a specific date',
      description: 'Retrieve prayer timings for a specific mosque on a specific date',
      tags: ['PrayerTiming'],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        },
        {
          in: 'path',
          name: 'date',
          required: true,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Date in YYYY-MM-DD format',
          example: '2024-07-23'
        }
      ],
      responses: {
        '200': {
          description: 'Prayer timing for date retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PrayerTimingResponse'
              }
            }
          }
        },
        '404': {
          $ref: '#/components/responses/NotFoundError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    },
    patch: {
      summary: 'Update prayer timing for a specific date',
      description: 'Update prayer timings for a specific mosque on a specific date (editor/admin only)',
      tags: ['PrayerTiming'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        },
        {
          in: 'path',
          name: 'date',
          required: true,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Date in YYYY-MM-DD format',
          example: '2024-07-23'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePrayerTimingRequest'
            },
            example: {
              timings: {
                fajr: '05:30',
                sunrise: '06:45',
                dhuhr: '12:15',
                asr: '15:30',
                maghrib: '18:20',
                isha: '19:45'
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Prayer timing updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PrayerTimingResponse'
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
  
  '/api/prayer-timings/mosque/{mosqueId}/month/{year}/{month}': {
    get: {
      summary: 'Get monthly prayer timings',
      description: 'Retrieve prayer timings for a specific mosque for an entire month',
      tags: ['PrayerTiming'],
      parameters: [
        {
          in: 'path',
          name: 'mosqueId',
          required: true,
          schema: {
            $ref: '#/components/schemas/ObjectId'
          },
          description: 'ID of the mosque',
          example: '507f1f77bcf86cd799439011'
        },
        {
          in: 'path',
          name: 'year',
          required: true,
          schema: {
            type: 'integer',
            minimum: 2020,
            maximum: 2030
          },
          description: 'Year (4 digits)',
          example: 2024
        },
        {
          in: 'path',
          name: 'month',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 12
          },
          description: 'Month (1-12)',
          example: 7
        }
      ],
      responses: {
        '200': {
          description: 'Monthly prayer timings retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MonthlyPrayerTimingsResponse'
              }
            }
          }
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