/**
 * Swagger path definitions for Mosque Schedule endpoints
 */

const mosqueSchedulePaths = {
    '/api/mosque-schedule/{mosqueId}/schedule': {
        get: {
            tags: ['MosqueSchedule'],
            summary: 'Get mosque schedule by date range',
            description: 'Retrieve mosque schedule with optional date range filtering (all authenticated users)',
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
                    name: 'startDate',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        format: 'date'
                    },
                    description: 'Start date for filtering (YYYY-MM-DD)'
                },
                {
                    name: 'endDate',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        format: 'date'
                    },
                    description: 'End date for filtering (YYYY-MM-DD)'
                }
            ],
            responses: {
                200: {
                    description: 'Schedule retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueScheduleResponse'
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

    '/api/mosque-schedule/{mosqueId}/download': {
        get: {
            tags: ['MosqueSchedule'],
            summary: 'Download mosque schedule',
            description: 'Download mosque schedule in various formats (CSV, HTML, ICS)',
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
                    name: 'format',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['csv', 'html', 'ics'],
                        default: 'csv'
                    },
                    description: 'Download format'
                },
                {
                    name: 'startDate',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        format: 'date'
                    },
                    description: 'Start date for filtering (YYYY-MM-DD)'
                },
                {
                    name: 'endDate',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        format: 'date'
                    },
                    description: 'End date for filtering (YYYY-MM-DD)'
                }
            ],
            responses: {
                200: {
                    description: 'Schedule file downloaded successfully',
                    content: {
                        'text/csv': {
                            schema: {
                                type: 'string',
                                format: 'binary'
                            }
                        },
                        'text/html': {
                            schema: {
                                type: 'string'
                            }
                        },
                        'text/calendar': {
                            schema: {
                                type: 'string'
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

    '/api/mosque-schedule/{mosqueId}': {
        get: {
            tags: ['MosqueSchedule'],
            summary: 'Get all schedules for mosque (Editor/Admin)',
            description: 'Get all schedules for a mosque with pagination (minimal data, editor/admin only)',
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
                }
            ],
            responses: {
                200: {
                    description: 'Schedules retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueSchedulesListResponse'
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

    '/api/mosque-schedule/{mosqueId}/{scheduleId}': {
        get: {
            tags: ['MosqueSchedule'],
            summary: 'Get schedule by ID (Editor/Admin)',
            description: 'Get full schedule document by ID (editor/admin only)',
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
                    name: 'scheduleId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the schedule'
                }
            ],
            responses: {
                200: {
                    description: 'Schedule retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueScheduleDetailResponse'
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
        delete: {
            tags: ['MosqueSchedule'],
            summary: 'Delete schedule (Editor/Admin)',
            description: 'Delete a mosque schedule (editor/admin only)',
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
                    name: 'scheduleId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the schedule'
                }
            ],
            responses: {
                200: {
                    description: 'Schedule deleted successfully',
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

    '/api/mosque-schedule/generate/{mosqueId}/{year}': {
        post: {
            tags: ['MosqueSchedule'],
            summary: 'Generate new schedule (Editor/Admin)',
            description: 'Generate a new schedule for a mosque for a specific year (editor/admin only)',
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
                    description: 'Year for which to generate the schedule'
                }
            ],
            requestBody: {
                required: false,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/GenerateScheduleRequest'
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Schedule generated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueScheduleDetailResponse'
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
                    description: 'Schedule already exists for this year',
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

    '/api/mosque-schedule/{mosqueId}/{scheduleId}/update-events': {
        put: {
            tags: ['MosqueSchedule'],
            summary: 'Update special events in schedule (Editor/Admin)',
            description: 'Update special events in an existing schedule (editor/admin only)',
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
                    name: 'scheduleId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId'
                    },
                    description: 'MongoDB ObjectId of the schedule'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateScheduleEventsRequest'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Special events updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MosqueScheduleDetailResponse'
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
    }
};

module.exports = mosqueSchedulePaths;
