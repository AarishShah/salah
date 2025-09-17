/**
 * Swagger path definitions for Mosque Special Event endpoints
 */

const mosqueSpecialEventPaths = {
    '/api/mosque-special-events/all/admin': {
        get: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Get all special events (Admin only)',
            description: 'Get all special events across all mosques (admin only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1
                    },
                    description: 'Page number for pagination'
                },
                {
                    name: 'limit',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    },
                    description: 'Number of items per page'
                },
                {
                    name: 'year',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 2020,
                        maximum: 2050
                    },
                    description: 'Filter by year'
                }
            ],
            responses: {
                200: {
                    description: 'All special events retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AllSpecialEventsResponse'
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

    '/api/mosque-special-events/{mosqueId}': {
        get: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Get mosque special events (Editor/Admin)',
            description: 'Get all special events for a specific mosque (editor/admin only)',
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
                    description: 'Mosque special events retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueSpecialEventsResponse'
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

    '/api/mosque-special-events/{mosqueId}/{year}': {
        get: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Get mosque special events by year (Editor/Admin)',
            description: 'Get special events for a specific mosque and year (editor/admin only)',
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
                    name: 'year',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'integer',
                        minimum: 2020,
                        maximum: 2050
                    },
                    description: 'Year for which to get special events'
                }
            ],
            responses: {
                200: {
                    description: 'Special events for the year retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueSpecialEventsByYearResponse'
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
        },
        post: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Create year document (Editor/Admin)',
            description: 'Create a new year document for special events (editor/admin only)',
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
                    name: 'year',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'integer',
                        minimum: 2020,
                        maximum: 2050
                    },
                    description: 'Year for which to create the document'
                }
            ],
            responses: {
                201: {
                    description: 'Year document created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueSpecialEventsByYearResponse'
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
                409: {
                    description: 'Year document already exists',
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

    '/api/mosque-special-events/{mosqueId}/{year}/event': {
        post: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Add special event (Editor/Admin)',
            description: 'Add a new special event for a specific mosque and year (editor/admin only)',
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
                    name: 'year',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'integer',
                        minimum: 2020,
                        maximum: 2050
                    },
                    description: 'Year for the special event'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/AddSpecialEventRequest'
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Special event added successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SpecialEventResponse'
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

    '/api/mosque-special-events/{mosqueId}/{year}/event/{eventId}': {
        put: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Update special event (Editor/Admin)',
            description: 'Update an existing special event (editor/admin only)',
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
                    name: 'year',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'integer',
                        minimum: 2020,
                        maximum: 2050
                    },
                    description: 'Year of the special event'
                },
                {
                    name: 'eventId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the event'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateSpecialEventRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Special event updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SpecialEventResponse'
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
        },
        delete: {
            tags: ['MosqueSpecialEvent'],
            summary: 'Delete special event (Editor/Admin)',
            description: 'Delete a special event (editor/admin only)',
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
                    name: 'year',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'integer',
                        minimum: 2020,
                        maximum: 2050
                    },
                    description: 'Year of the special event'
                },
                {
                    name: 'eventId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the event'
                }
            ],
            responses: {
                200: {
                    description: 'Special event deleted successfully',
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
    }
};

module.exports = mosqueSpecialEventPaths;
