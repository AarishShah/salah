/**
 * Swagger schemas for Push Notification module
 */

const pushNotificationSchemas = {
    RegisterTokenRequest: {
        type: 'object',
        required: ['token', 'platform'],
        properties: {
            token: {
                type: 'string',
                minLength: 10,
                description: 'Firebase Cloud Messaging token or Apple Push Notification token',
                example: 'dGhpcyBpcyBhIGZha2UgdG9rZW4gZm9yIGV4YW1wbGU...'
            },
            platform: {
                type: 'string',
                enum: ['android', 'ios', 'web'],
                description: 'Device platform',
                example: 'android'
            },
            deviceInfo: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        example: 'iPhone 14'
                    },
                    osVersion: {
                        type: 'string',
                        example: '16.0'
                    },
                    appVersion: {
                        type: 'string',
                        example: '1.2.3'
                    }
                }
            }
        }
    },

    UnregisterTokenRequest: {
        type: 'object',
        required: ['token'],
        properties: {
            token: {
                type: 'string',
                minLength: 10,
                description: 'Token to unregister',
                example: 'dGhpcyBpcyBhIGZha2UgdG9rZW4gZm9yIGV4YW1wbGU...'
            }
        }
    },

    TokenResponse: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['success'],
                example: 'success'
            },
            message: {
                type: 'string',
                example: 'Token registered successfully'
            },
            data: {
                type: 'object',
                properties: {
                    tokenId: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '64a123b456c789d012e345f6'
                    },
                    platform: {
                        type: 'string',
                        example: 'android'
                    },
                    registeredAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-15T10:30:00.000Z'
                    }
                }
            }
        }
    },

    UserTokensResponse: {
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
                    tokens: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/PushToken'
                        }
                    },
                    totalTokens: {
                        type: 'integer',
                        example: 3
                    }
                }
            }
        }
    },

    PushToken: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                format: 'ObjectId',
                example: '64a123b456c789d012e345f6'
            },
            token: {
                type: 'string',
                example: 'dGhpcyBpcyBhIGZha2UgdG9rZW4...'
            },
            platform: {
                type: 'string',
                enum: ['android', 'ios', 'web'],
                example: 'android'
            },
            deviceInfo: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        example: 'iPhone 14'
                    },
                    osVersion: {
                        type: 'string',
                        example: '16.0'
                    },
                    appVersion: {
                        type: 'string',
                        example: '1.2.3'
                    }
                }
            },
            isActive: {
                type: 'boolean',
                example: true
            },
            lastUsed: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z'
            }
        }
    },

    SendNotificationRequest: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Notification title',
                example: 'Prayer Reminder'
            },
            body: {
                type: 'string',
                minLength: 1,
                maxLength: 500,
                description: 'Notification body message',
                example: 'Maghrib prayer starts in 15 minutes'
            },
            data: {
                type: 'object',
                description: 'Additional data payload',
                properties: {
                    type: {
                        type: 'string',
                        example: 'prayer_reminder'
                    },
                    mosqueId: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '64a123b456c789d012e345f7'
                    },
                    prayerName: {
                        type: 'string',
                        example: 'maghrib'
                    }
                }
            },
            priority: {
                type: 'string',
                enum: ['normal', 'high'],
                default: 'normal',
                description: 'Notification priority'
            }
        }
    },

    SendNotificationToUsersRequest: {
        type: 'object',
        required: ['userIds', 'title', 'body'],
        properties: {
            userIds: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'ObjectId'
                },
                minItems: 1,
                description: 'Array of user IDs to send notification to',
                example: ['64a123b456c789d012e345f6', '64a123b456c789d012e345f7']
            },
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Notification title',
                example: 'Important Announcement'
            },
            body: {
                type: 'string',
                minLength: 1,
                maxLength: 500,
                description: 'Notification body message',
                example: 'Special event scheduled for this Friday'
            },
            data: {
                type: 'object',
                description: 'Additional data payload',
                properties: {
                    type: {
                        type: 'string',
                        example: 'announcement'
                    }
                }
            },
            priority: {
                type: 'string',
                enum: ['normal', 'high'],
                default: 'normal',
                description: 'Notification priority'
            }
        }
    },

    ScheduleNotificationRequest: {
        type: 'object',
        required: ['mosqueId', 'title', 'body', 'scheduledFor'],
        properties: {
            mosqueId: {
                type: 'string',
                format: 'ObjectId',
                description: 'Mosque ID for which to schedule the notification',
                example: '64a123b456c789d012e345f7'
            },
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Notification title',
                example: 'Special Event Reminder'
            },
            body: {
                type: 'string',
                minLength: 1,
                maxLength: 500,
                description: 'Notification body message',
                example: 'Eid prayer will be held at 8:00 AM tomorrow'
            },
            scheduledFor: {
                type: 'string',
                format: 'date-time',
                description: 'Date and time when the notification should be sent',
                example: '2024-04-10T07:00:00.000Z'
            },
            data: {
                type: 'object',
                description: 'Additional data payload',
                properties: {
                    type: {
                        type: 'string',
                        example: 'special_event'
                    },
                    eventId: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '64a123b456c789d012e345f8'
                    }
                }
            },
            priority: {
                type: 'string',
                enum: ['normal', 'high'],
                default: 'normal',
                description: 'Notification priority'
            }
        }
    },

    SendNotificationResponse: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['success'],
                example: 'success'
            },
            message: {
                type: 'string',
                example: 'Notifications sent successfully'
            },
            data: {
                type: 'object',
                properties: {
                    totalTargeted: {
                        type: 'integer',
                        example: 150,
                        description: 'Total number of users targeted'
                    },
                    totalSent: {
                        type: 'integer',
                        example: 145,
                        description: 'Total number of notifications successfully sent'
                    },
                    totalFailed: {
                        type: 'integer',
                        example: 5,
                        description: 'Total number of notifications that failed to send'
                    },
                    sentAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-15T10:30:00.000Z'
                    }
                }
            }
        }
    },

    ScheduleNotificationResponse: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['success'],
                example: 'success'
            },
            message: {
                type: 'string',
                example: 'Notification scheduled successfully'
            },
            data: {
                type: 'object',
                properties: {
                    notification: {
                        $ref: '#/components/schemas/ScheduledNotification'
                    }
                }
            }
        }
    },

    ScheduledNotificationsResponse: {
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
                    notifications: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ScheduledNotification'
                        }
                    },
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    },
                    totalNotifications: {
                        type: 'integer',
                        example: 12
                    }
                }
            }
        }
    },

    ScheduledNotification: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                format: 'ObjectId',
                example: '64a123b456c789d012e345f9'
            },
            mosqueId: {
                type: 'string',
                format: 'ObjectId',
                example: '64a123b456c789d012e345f7'
            },
            title: {
                type: 'string',
                example: 'Special Event Reminder'
            },
            body: {
                type: 'string',
                example: 'Eid prayer will be held at 8:00 AM tomorrow'
            },
            scheduledFor: {
                type: 'string',
                format: 'date-time',
                example: '2024-04-10T07:00:00.000Z'
            },
            status: {
                type: 'string',
                enum: ['pending', 'sent', 'failed', 'cancelled'],
                example: 'pending'
            },
            data: {
                type: 'object',
                description: 'Additional data payload'
            },
            priority: {
                type: 'string',
                enum: ['normal', 'high'],
                example: 'normal'
            },
            createdBy: {
                type: 'string',
                format: 'ObjectId',
                example: '64a123b456c789d012e345f6'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z'
            },
            sentAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: null
            },
            totalSent: {
                type: 'integer',
                nullable: true,
                example: null,
                description: 'Number of notifications sent (populated after sending)'
            },
            totalFailed: {
                type: 'integer',
                nullable: true,
                example: null,
                description: 'Number of notifications failed (populated after sending)'
            }
        }
    }
};

module.exports = pushNotificationSchemas;
