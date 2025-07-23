/**
 * User API endpoints documentation
 */

module.exports = {
  '/api/users/profile': {
    get: {
      summary: 'Get current user\'s profile',
      description: 'Retrieve the authenticated user\'s profile information',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfileResponse'
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
    },
    put: {
      summary: 'Update current user\'s profile',
      description: 'Update the authenticated user\'s profile information',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateProfileRequest'
            },
            example: {
              name: 'John Doe',
              phone: '+1234567890',
              language: 'en'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfileResponse'
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
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    },
    delete: {
      summary: 'Delete current user\'s account',
      description: 'Permanently delete the authenticated user\'s account and all associated data',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Account deleted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
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
  },
  
  '/api/users/editor-request': {
    post: {
      summary: 'Submit editor role request',
      description: 'Request to become an editor for specific mosques to manage their prayer timings',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                mosqueIds: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ObjectId'
                  },
                  description: 'List of mosque IDs to request editor access for'
                },
                reason: {
                  type: 'string',
                  description: 'Reason for requesting editor access'
                }
              },
              required: ['mosqueIds', 'reason']
            },
            example: {
              mosqueIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
              reason: 'I am the imam of these mosques and would like to manage their prayer timings.'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Editor request submitted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
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
        '409': {
          description: 'User already has a pending request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
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
  
  '/api/users/editor-request/status': {
    get: {
      summary: 'Get editor request status',
      description: 'Check the status of the current user\'s editor role request',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Editor request status retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['success']
                  },
                  data: {
                    type: 'object',
                    properties: {
                      hasRequest: {
                        type: 'boolean'
                      },
                      request: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          _id: {
                            $ref: '#/components/schemas/ObjectId'
                          },
                          status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected']
                          },
                          createdAt: {
                            $ref: '#/components/schemas/DateTimeString'
                          }
                        }
                      }
                    }
                  }
                }
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
  },
  
  '/api/users/phone-verification': {
    patch: {
      summary: 'Update phone verification status',
      description: 'Mark the current user\'s phone number as verified',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Phone verification status updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PhoneVerificationResponse'
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '400': {
          description: 'Phone number not provided',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};