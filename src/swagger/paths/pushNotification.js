/**
 * Swagger path definitions for Push Notification endpoints
 */

const pushNotificationPaths = {
    '/api/notifications/register': {
        post: {
            tags: ['PushNotification'],
            summary: 'Register push notification token',
            description: 'Register a device token for push notifications',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/RegisterTokenRequest'
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Token registered successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/TokenResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/unregister': {
        post: {
            tags: ['PushNotification'],
            summary: 'Unregister push notification token',
            description: 'Remove a device token from push notifications',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UnregisterTokenRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Token unregistered successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/tokens': {
        get: {
            tags: ['PushNotification'],
            summary: 'Get user tokens',
            description: 'Get all registered tokens for the authenticated user',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'User tokens retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UserTokensResponse'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/send/mosque/{mosqueId}': {
        post: {
            tags: ['PushNotification'],
            summary: 'Send notification to mosque users (Editor/Admin)',
            description: 'Send push notification to all users who have favorited a specific mosque (editor/admin only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'mosqueId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the mosque'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SendNotificationRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Notification sent successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SendNotificationResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/schedule/mosque': {
        post: {
            tags: ['PushNotification'],
            summary: 'Schedule notification for mosque (Editor/Admin)',
            description: 'Schedule a push notification for mosque users (editor/admin only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ScheduleNotificationRequest'
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Notification scheduled successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ScheduleNotificationResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/scheduled/mosque/{mosqueId}': {
        get: {
            tags: ['PushNotification'],
            summary: 'Get scheduled notifications for mosque (Editor/Admin)',
            description: 'Get all scheduled notifications for a specific mosque (editor/admin only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'mosqueId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the mosque'
                },
                {
                    name: 'status',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['pending', 'sent', 'failed', 'cancelled']
                    },
                    description: 'Filter by notification status'
                }
            ],
            responses: {
                200: {
                    description: 'Scheduled notifications retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ScheduledNotificationsResponse'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/scheduled/{notificationId}': {
        delete: {
            tags: ['PushNotification'],
            summary: 'Cancel scheduled notification (Editor/Admin)',
            description: 'Cancel a scheduled notification (editor/admin only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'notificationId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the scheduled notification'
                }
            ],
            responses: {
                200: {
                    description: 'Scheduled notification cancelled successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/send/user/{userId}': {
        post: {
            tags: ['PushNotification'],
            summary: 'Send notification to specific user (Admin only)',
            description: 'Send push notification to a specific user (admin only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the user'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SendNotificationRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Notification sent successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SendNotificationResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/send/users': {
        post: {
            tags: ['PushNotification'],
            summary: 'Send notification to multiple users (Admin only)',
            description: 'Send push notification to multiple specific users (admin only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SendNotificationToUsersRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Notifications sent successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SendNotificationResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/send/all': {
        post: {
            tags: ['PushNotification'],
            summary: 'Send notification to all users (Admin only)',
            description: 'Send push notification to all registered users (admin only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SendNotificationRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Notifications sent successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SendNotificationResponse'
                            }
                        }
                    }
                },
                400: {
                    $ref: '#/components/responses/ValidationError'
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/notifications/cleanup/expired-tokens': {
        post: {
            tags: ['PushNotification'],
            summary: 'Cleanup expired tokens (Admin only)',
            description: 'Remove expired or invalid push notification tokens (admin only)',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Expired tokens cleaned up successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        enum: ['success'],
                                        example: 'success'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Expired tokens cleaned up successfully'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            removedTokens: {
                                                type: 'integer',
                                                example: 25,
                                                description: 'Number of expired tokens removed'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    $ref: '#/components/responses/ForbiddenError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    }
};

module.exports = pushNotificationPaths;
