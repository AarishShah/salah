/**
 * Mosque related schemas
 */

module.exports = {
  // Mosque model
  Mosque: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      name: {
        type: 'string',
        example: 'Masjid Al-Noor'
      },
      address: {
        type: 'string',
        example: '123 Main Street, Downtown'
      },
      locality: {
        type: 'string',
        example: 'Karachi'
      },
      contactPerson: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true
      },
      coordinates: {
        $ref: '#/components/schemas/GeoPoint'
      },
      sect: {
        type: 'string',
        enum: ['sunni', 'shia'],
        example: 'sunni'
      },
      schoolOfThought: {
        type: 'string',
        enum: ['hanafi', 'shafi', 'maliki', 'hanbali'],
        nullable: true,
        example: 'hanafi',
        description: 'Required for Sunni sect, null for Shia'
      },
      officialMeeqat: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true
      },
      meeqatConfig: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true
      },
      mosqueMeeqat: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true
      },
      isActive: {
        type: 'boolean',
        example: true
      },
      createdBy: {
        $ref: '#/components/schemas/ObjectId'
      },
      updatedBy: {
        $ref: '#/components/schemas/ObjectId',
        nullable: true
      },
      createdAt: {
        $ref: '#/components/schemas/DateTimeString'
      },
      updatedAt: {
        $ref: '#/components/schemas/DateTimeString'
      }
    },
    required: ['_id', 'name', 'address', 'locality', 'coordinates', 'sect', 'isActive', 'createdBy']
  },

  // Mosque creation request
  CreateMosqueRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
        example: 'Masjid Al-Noor'
      },
      address: {
        type: 'string',
        minLength: 10,
        maxLength: 200,
        example: '123 Main Street, Downtown'
      },
      locality: {
        type: 'string',
        minLength: 2,
        maxLength: 50,
        example: 'Karachi'
      },
      coordinates: {
        type: 'object',
        properties: {
          longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180,
            example: 67.0011
          },
          latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90,
            example: 24.8607
          }
        },
        required: ['longitude', 'latitude']
      },
      sect: {
        type: 'string',
        enum: ['sunni', 'shia'],
        example: 'sunni'
      },
      schoolOfThought: {
        type: 'string',
        enum: ['hanafi', 'shafi', 'maliki', 'hanbali'],
        example: 'hanafi',
        description: 'Required if sect is sunni'
      },
      contactPerson: {
        $ref: '#/components/schemas/ObjectId',
        description: 'Optional contact person user ID'
      }
    },
    required: ['name', 'address', 'locality', 'coordinates', 'sect']
  },

  // Nearby mosques search parameters
  NearbyMosquesQuery: {
    type: 'object',
    properties: {
      lat: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        example: 24.8607,
        description: 'Latitude coordinate'
      },
      lng: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        example: 67.0011,
        description: 'Longitude coordinate'
      },
      radius: {
        type: 'number',
        minimum: 0.1,
        maximum: 50,
        default: 5,
        example: 10,
        description: 'Search radius in kilometers'
      },
      sect: {
        type: 'string',
        enum: ['sunni', 'shia'],
        description: 'Filter by sect (optional)'
      },
      schoolOfThought: {
        type: 'string',
        enum: ['hanafi', 'shafi', 'maliki', 'hanbali'],
        description: 'Filter by school of thought (optional)'
      }
    },
    required: ['lat', 'lng']
  },

  // Mosque search query
  MosqueSearchQuery: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        minLength: 2,
        example: 'Al-Noor',
        description: 'Search query for mosque name or locality'
      },
      locality: {
        type: 'string',
        example: 'Karachi',
        description: 'Filter by locality'
      },
      sect: {
        type: 'string',
        enum: ['sunni', 'shia'],
        description: 'Filter by sect'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        example: 20,
        description: 'Maximum number of results'
      }
    },
    required: ['q']
  },

  // Mosque list item (for search results)
  MosqueListItem: {
    type: 'object',
    properties: {
      _id: {
        $ref: '#/components/schemas/ObjectId'
      },
      name: {
        type: 'string',
        example: 'Masjid Al-Noor'
      },
      address: {
        type: 'string',
        example: '123 Main Street, Downtown'
      },
      locality: {
        type: 'string',
        example: 'Karachi'
      },
      sect: {
        type: 'string',
        enum: ['sunni', 'shia'],
        example: 'sunni'
      },
      schoolOfThought: {
        type: 'string',
        enum: ['hanafi', 'shafi', 'maliki', 'hanbali'],
        nullable: true,
        example: 'hanafi'
      },
      distance: {
        type: 'number',
        example: 2.5,
        description: 'Distance in kilometers (only for nearby search)'
      },
      isActive: {
        type: 'boolean',
        example: true
      }
    },
    required: ['_id', 'name', 'address', 'locality', 'sect', 'isActive']
  },

  // Set official Meeqat request
  SetOfficialMeeqatRequest: {
    type: 'object',
    properties: {
      officialMeeqatId: {
        $ref: '#/components/schemas/ObjectId',
        description: 'ID of the official Meeqat to set'
      }
    },
    required: ['officialMeeqatId']
  },

  // Mosque response
  MosqueResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      data: {
        $ref: '#/components/schemas/Mosque'
      }
    },
    required: ['status', 'data']
  },

  // Mosque list response
  MosqueListResponse: {
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
          $ref: '#/components/schemas/MosqueListItem'
        }
      },
      count: {
        type: 'integer',
        example: 15,
        description: 'Number of mosques returned'
      }
    },
    required: ['status', 'data', 'count']
  }
};