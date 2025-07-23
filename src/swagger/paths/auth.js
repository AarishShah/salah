/**
 * Authentication API endpoints documentation
 */

module.exports = {
  '/api/auth/google-signin': {
    post: {
      summary: 'Authenticate user with Google ID token',
      description: 'Sign in or register a user using Google OAuth ID token. Returns JWT tokens for API access.',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/GoogleSignInRequest'
            },
            example: {
              idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBkYjEzM...'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Authentication successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse'
              }
            }
          }
        },
        '400': {
          description: 'Invalid request or token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'Invalid Google ID token'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/auth/refresh-token': {
    post: {
      summary: 'Refresh access token',
      description: 'Generate a new access token using a valid refresh token',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RefreshTokenRequest'
            },
            example: {
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TokenRefreshResponse'
              }
            }
          }
        },
        '401': {
          description: 'Invalid or expired refresh token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'failed',
                message: 'Invalid refresh token'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  
  '/api/auth/logout': {
    post: {
      summary: 'Logout user',
      description: 'Invalidate the current refresh token and log out the user',
      tags: ['Auth'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'User logged out successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogoutResponse'
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};