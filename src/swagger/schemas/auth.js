/**
 * Authentication related schemas
 */

module.exports = {
  // Google Sign-in request
  GoogleSignInRequest: {
    type: 'object',
    properties: {
      idToken: {
        type: 'string',
        description: 'Google ID token obtained from Google OAuth',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBiMjc...'
      }
    },
    required: ['idToken']
  },

  // Refresh token request
  RefreshTokenRequest: {
    type: 'object',
    properties: {
      refreshToken: {
        type: 'string',
        description: 'Valid refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    },
    required: ['refreshToken']
  },

  // Authentication response
  AuthResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Authentication successful'
      },
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/UserProfile'
          },
          tokens: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                description: 'JWT access token for API authentication',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              refreshToken: {
                type: 'string',
                description: 'Refresh token for obtaining new access tokens',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              expiresIn: {
                type: 'integer',
                description: 'Access token expiration time in seconds',
                example: 3600
              }
            },
            required: ['accessToken', 'refreshToken', 'expiresIn']
          }
        },
        required: ['user', 'tokens']
      }
    },
    required: ['status', 'data']
  },

  // Token refresh response
  TokenRefreshResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Token refreshed successfully'
      },
      data: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'New JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expiresIn: {
            type: 'integer',
            description: 'Access token expiration time in seconds',
            example: 3600
          }
        },
        required: ['accessToken', 'expiresIn']
      }
    },
    required: ['status', 'data']
  },

  // Logout response
  LogoutResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        example: 'Logged out successfully'
      }
    },
    required: ['status', 'message']
  }
};