/**
 * Swagger schemas for Mosque Special Event module
 */

const mosqueSpecialEventSchemas = {
    AllSpecialEventsResponse: {
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
                    events: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/SpecialEventWithMosque'
                        }
                    },
                    pagination: {
                        $ref: '#/components/schemas/PaginationInfo'
                    }
                }
            }
        }
    },

    MosqueSpecialEventsResponse: {
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
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    },
                    eventsByYear: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                year: {
                                    type: 'integer',
                                    example: 2024
                                },
                                totalEvents: {
                                    type: 'integer',
                                    example: 12
                                },
                                lastUpdated: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-01-15T10:30:00.000Z'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    MosqueSpecialEventsByYearResponse: {
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
                    _id: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '64a123b456c789d012e345f6'
                    },
                    mosqueId: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '64a123b456c789d012e345f7'
                    },
                    year: {
                        type: 'integer',
                        example: 2024
                    },
                    events: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/SpecialEvent'
                        }
                    },
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-15T10:30:00.000Z'
                    }
                }
            }
        }
    },

    SpecialEventResponse: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['success'],
                example: 'success'
            },
            message: {
                type: 'string',
                example: 'Special event created successfully'
            },
            data: {
                type: 'object',
                properties: {
                    event: {
                        $ref: '#/components/schemas/SpecialEvent'
                    },
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    }
                }
            }
        }
    },

    SpecialEvent: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                format: 'ObjectId',
                example: '64a123b456c789d012e345f8'
            },
            name: {
                type: 'string',
                example: 'Eid ul-Fitr'
            },
            description: {
                type: 'string',
                example: 'Festival of Breaking the Fast - Special prayer at 8:00 AM'
            },
            type: {
                type: 'string',
                enum: ['eid', 'friday', 'ramadan', 'hajj', 'other'],
                example: 'eid'
            },
            date: {
                type: 'string',
                format: 'date',
                example: '2024-04-10'
            },
            hijriDate: {
                type: 'string',
                example: '1 Shawwal 1445',
                description: 'Hijri date representation'
            },
            specialPrayerTime: {
                type: 'string',
                example: '08:00',
                description: 'Special prayer time if applicable'
            },
            isActive: {
                type: 'boolean',
                example: true,
                description: 'Whether the event is active'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z'
            }
        }
    },

    SpecialEventWithMosque: {
        allOf: [
            {
                $ref: '#/components/schemas/SpecialEvent'
            },
            {
                type: 'object',
                properties: {
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    },
                    year: {
                        type: 'integer',
                        example: 2024
                    }
                }
            }
        ]
    },

    AddSpecialEventRequest: {
        type: 'object',
        required: ['name', 'type', 'date'],
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                example: 'Eid ul-Fitr'
            },
            description: {
                type: 'string',
                maxLength: 500,
                example: 'Festival of Breaking the Fast - Special prayer at 8:00 AM'
            },
            type: {
                type: 'string',
                enum: ['eid', 'friday', 'ramadan', 'hajj', 'other'],
                example: 'eid'
            },
            date: {
                type: 'string',
                format: 'date',
                example: '2024-04-10'
            },
            hijriDate: {
                type: 'string',
                example: '1 Shawwal 1445'
            },
            specialPrayerTime: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '08:00',
                description: 'Special prayer time in HH:MM format (24-hour)'
            },
            isActive: {
                type: 'boolean',
                default: true,
                example: true
            }
        }
    },

    UpdateSpecialEventRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                example: 'Eid ul-Fitr (Updated)'
            },
            description: {
                type: 'string',
                maxLength: 500,
                example: 'Festival of Breaking the Fast - Special prayer at 8:30 AM'
            },
            type: {
                type: 'string',
                enum: ['eid', 'friday', 'ramadan', 'hajj', 'other'],
                example: 'eid'
            },
            date: {
                type: 'string',
                format: 'date',
                example: '2024-04-10'
            },
            hijriDate: {
                type: 'string',
                example: '1 Shawwal 1445'
            },
            specialPrayerTime: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '08:30',
                description: 'Special prayer time in HH:MM format (24-hour)'
            },
            isActive: {
                type: 'boolean',
                example: true
            }
        }
    }
};

module.exports = mosqueSpecialEventSchemas;
