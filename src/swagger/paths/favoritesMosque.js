/**
 * Swagger path definitions for Favorites Mosque endpoints
 */

const favoritesMosquePaths = {
    '/api/favorites-mosques': {
        get: {
            tags: ['FavoritesMosque'],
            summary: 'Get user\'s favorite mosques',
            description: 'Retrieve the list of mosques marked as favorites by the authenticated user',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Favorite mosques retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/FavoritesMosquesList'
                            }
                        }
                    }
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
        },
        post: {
            tags: ['FavoritesMosque'],
            summary: 'Add mosque to favorites',
            description: 'Add a mosque to the user\'s favorites list. Currently limited to 1 favorite mosque.',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/AddFavoriteMosqueRequest'
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Mosque added to favorites successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/FavoriteMosqueResponse'
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad request - mosque ID required or limit exceeded',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                missingMosqueId: {
                                    value: {
                                        status: 'failed',
                                        message: 'Mosque ID is required'
                                    }
                                },
                                limitExceeded: {
                                    value: {
                                        status: 'failed',
                                        message: 'You can only have 1 favorite mosque currently. Please remove the existing one first.'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                404: {
                    description: 'Mosque not found or inactive',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                409: {
                    description: 'Mosque already in favorites',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/favorites-mosques/{mosqueId}': {
        delete: {
            tags: ['FavoritesMosque'],
            summary: 'Remove mosque from favorites',
            description: 'Remove a mosque from the user\'s favorites list',
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
                    description: 'MongoDB ObjectId of the mosque to remove from favorites'
                }
            ],
            responses: {
                200: {
                    description: 'Mosque removed from favorites successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/FavoriteMosqueResponse'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                404: {
                    description: 'Mosque not found in favorites',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/favorites-mosques/notifications/preferences': {
        get: {
            tags: ['FavoritesMosque'],
            summary: 'Get prayer notification preferences',
            description: 'Retrieve the user\'s prayer notification preferences',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Prayer notification preferences retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            prayerNotifications: {
                                                $ref: '#/components/schemas/PrayerNotificationPreferences'
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
                404: {
                    $ref: '#/components/responses/NotFoundError'
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        },
        patch: {
            tags: ['FavoritesMosque'],
            summary: 'Update prayer notification preferences',
            description: 'Update the user\'s prayer notification preferences',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdatePrayerNotificationPreferencesRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Prayer notification preferences updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/PrayerNotificationPreferencesResponse'
                            }
                        }
                    }
                },
                400: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                invalidMinutes: {
                                    value: {
                                        status: 'failed',
                                        message: 'Reminder minutes must be between 1 and 60'
                                    }
                                },
                                invalidPrayers: {
                                    value: {
                                        status: 'failed',
                                        message: 'Invalid prayers: invalid_prayer'
                                    }
                                }
                            }
                        }
                    }
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

    '/api/favorites-mosques/prayers/upcoming': {
        get: {
            tags: ['FavoritesMosque'],
            summary: 'Get upcoming prayers',
            description: 'Get upcoming prayer times for the user\'s favorite mosque',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Upcoming prayers retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpcomingPrayersResponse'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                404: {
                    description: 'No favorite mosque set or no prayer timings found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/favorites-mosques/prayers/reminder': {
        post: {
            tags: ['FavoritesMosque'],
            summary: 'Send manual prayer reminder',
            description: 'Send a manual prayer reminder notification for a specific prayer',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ManualPrayerReminderRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Prayer reminder sent successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ManualPrayerReminderResponse'
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad request - missing parameters or invalid prayer name',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    description: 'Mosque is not in favorites',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                404: {
                    description: 'User, mosque, or prayer timing not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    },

    '/api/favorites-mosques/prayers/check-reminders': {
        post: {
            tags: ['FavoritesMosque'],
            summary: 'Trigger prayer reminder check (Admin only)',
            description: 'Manually trigger the prayer reminder check process. This is normally done automatically every minute.',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Prayer reminder check completed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/PrayerReminderCheckResponse'
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
    },

    '/api/favorites-mosques/mosque/{mosqueId}/users': {
        get: {
            tags: ['FavoritesMosque'],
            summary: 'Get users who favorited a mosque',
            description: 'Get list of users who have favorited a specific mosque (Admin/Editor only)',
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
            responses: {
                200: {
                    description: 'Successfully retrieved users who favorited the mosque',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueFavoritesResponse'
                            }
                        }
                    }
                },
                401: {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                403: {
                    description: 'Access denied - Admin/Editor only',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                404: {
                    description: 'Mosque not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    $ref: '#/components/responses/ServerError'
                }
            }
        }
    }
};

module.exports = favoritesMosquePaths;
