/**
 * Swagger schemas for Mosque Schedule module
 */

const mosqueScheduleSchemas = {
    MosqueScheduleResponse: {
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
                    schedule: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ScheduleEntry'
                        }
                    },
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    },
                    dateRange: {
                        type: 'object',
                        properties: {
                            startDate: {
                                type: 'string',
                                format: 'date',
                                example: '2024-01-01'
                            },
                            endDate: {
                                type: 'string',
                                format: 'date',
                                example: '2024-12-31'
                            }
                        }
                    }
                }
            }
        }
    },

    MosqueSchedulesListResponse: {
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
                    schedules: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ScheduleSummary'
                        }
                    },
                    pagination: {
                        $ref: '#/components/schemas/PaginationInfo'
                    },
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    }
                }
            }
        }
    },

    MosqueScheduleDetailResponse: {
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
                    schedule: {
                        $ref: '#/components/schemas/ScheduleDetail'
                    },
                    mosque: {
                        $ref: '#/components/schemas/MosqueBasic'
                    }
                }
            }
        }
    },

    ScheduleEntry: {
        type: 'object',
        properties: {
            date: {
                type: 'string',
                format: 'date',
                example: '2024-01-15'
            },
            hijriDate: {
                type: 'string',
                example: '6 Rajab 1445'
            },
            prayers: {
                type: 'object',
                properties: {
                    fajr: {
                        type: 'string',
                        example: '05:30'
                    },
                    sunrise: {
                        type: 'string',
                        example: '07:15'
                    },
                    dhuhr: {
                        type: 'string',
                        example: '12:45'
                    },
                    asr: {
                        type: 'string',
                        example: '15:30'
                    },
                    maghrib: {
                        type: 'string',
                        example: '18:20'
                    },
                    isha: {
                        type: 'string',
                        example: '19:45'
                    }
                }
            },
            specialEvents: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SpecialEventBasic'
                }
            }
        }
    },

    ScheduleSummary: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                format: 'ObjectId',
                example: '64a123b456c789d012e345f6'
            },
            year: {
                type: 'integer',
                example: 2024
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
            },
            totalDays: {
                type: 'integer',
                example: 366
            },
            hasSpecialEvents: {
                type: 'boolean',
                example: true
            }
        }
    },

    ScheduleDetail: {
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
            schedule: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ScheduleEntry'
                }
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

    GenerateScheduleRequest: {
        type: 'object',
        properties: {
            options: {
                type: 'object',
                properties: {
                    includeSpecialEvents: {
                        type: 'boolean',
                        default: true,
                        description: 'Whether to include special events in the schedule'
                    },
                    timeFormat: {
                        type: 'string',
                        enum: ['12h', '24h'],
                        default: '12h',
                        description: 'Time format for prayer times'
                    }
                }
            }
        }
    },

    UpdateScheduleEventsRequest: {
        type: 'object',
        required: ['events'],
        properties: {
            events: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        eventId: {
                            type: 'string',
                            format: 'ObjectId',
                            description: 'ID of the special event to include'
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                            description: 'Date when the event occurs'
                        }
                    }
                }
            }
        }
    },

    SpecialEventBasic: {
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
                example: 'Festival of Breaking the Fast'
            },
            type: {
                type: 'string',
                enum: ['eid', 'friday', 'ramadan', 'hajj', 'other'],
                example: 'eid'
            }
        }
    }
};

module.exports = mosqueScheduleSchemas;
