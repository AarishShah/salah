/**
 * Swagger configuration for MasjidSync API
 * This file centralizes all Swagger configuration settings
 */

// Import all schema components
const authSchemas = require('./schemas/auth');
const userSchemas = require('./schemas/user');
const mosqueSchemas = require('./schemas/mosque');
const adminSchemas = require('./schemas/admin');
const editorRequestSchemas = require('./schemas/editorRequest');
const commonSchemas = require('./schemas/common');
const meeqatConfigSchemas = require('./schemas/meeqatConfig');
const mosqueMeeqatSchemas = require('./schemas/mosqueMeeqat');
const officialMeeqatSchemas = require('./schemas/officialMeeqat');
const favoritesMosqueSchemas = require('./schemas/favoritesMosque');

// Import path documentation
const authPaths = require('./paths/auth');
const userPaths = require('./paths/user');
const mosquePaths = require('./paths/mosque');
const adminPaths = require('./paths/admin');
const editorRequestPaths = require('./paths/editorRequest');
const meeqatConfigPaths = require('./paths/meeqatConfig');
const mosqueMeeqatPaths = require('./paths/mosqueMeeqat');
const officialMeeqatPaths = require('./paths/officialMeeqat');
const favoritesMosquePaths = require('./paths/favoritesMosque');

// Create the OpenAPI specification
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MasjidSync API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for MasjidSync - A mosque prayer timing management system',
    contact: {
      name: 'MasjidSync Team',
      email: 'support@masjidsync.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production'
        ? 'https://api.masjidsync.com'
        : `http://localhost:${process.env.PORT || 8080}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from authentication endpoints'
      }
    },
    schemas: {
      // Merge all schema components
      ...commonSchemas,
      ...authSchemas,
      ...userSchemas,
      ...mosqueSchemas,
      ...adminSchemas,
      ...editorRequestSchemas,
      ...meeqatConfigSchemas,
      ...mosqueMeeqatSchemas,
      ...officialMeeqatSchemas,
      ...favoritesMosqueSchemas
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication failed or token expired',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              status: 'failed',
              message: 'Invalid token'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Insufficient permissions to access resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              status: 'failed',
              message: 'Insufficient permissions'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              status: 'failed',
              message: 'Resource not found'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError'
            },
            example: {
              status: 'failed',
              message: 'Validation error',
              errors: ['Field is required', 'Invalid format']
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              status: 'failed',
              message: 'Internal server error'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'User',
      description: 'User profile and account management'
    },
    {
      name: 'Mosque',
      description: 'Mosque information and management'
    },
    {
      name: 'Admin',
      description: 'Administrative functions (Admin only)'
    },
    {
      name: 'EditorRequest',
      description: 'Editor role request management'
    },
    {
      name: 'OfficialMeeqat',
      description: 'Official Meeqat management'
    },
    {
      name: 'MeeqatConfig',
      description: 'Meeqat configuration'
    },
    {
      name: 'MosqueMeeqat',
      description: 'Mosque Meeqat management'
    },
    {
      name: 'FavoritesMosque',
      description: 'Favorite mosques and prayer notifications'
    },
    {
      name: 'Scheduler',
      description: 'Scheduler management (Admin only)'
    }
  ],
  // Merge all path documentation
  paths: {
    ...authPaths,
    ...userPaths,
    ...mosquePaths,
    ...adminPaths,
    ...editorRequestPaths,
    ...meeqatConfigPaths,
    ...mosqueMeeqatPaths,
    ...officialMeeqatPaths,
    ...favoritesMosquePaths
  }
};

module.exports = swaggerSpec;