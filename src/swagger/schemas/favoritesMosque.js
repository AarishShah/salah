/**
 * Swagger schemas for Favorites Mosque module
 */

const favoritesMosqueSchemas = {
    AddFavoriteMosqueRequest: {
        type: 'object',
        required: ['mosqueId'],
        properties: {
            mosqueId: {
                type: 'string',
                format: 'ObjectId',
                description: 'MongoDB ObjectId of the mosque to add to favorites',
                example: '64a123b456c789d012e345f6'
            }
        }
    },

    FavoriteMosqueResponse: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['success'],
                example: 'success'
            },
            message: {
                type: 'string',
                example: 'Mosque added to favorites successfully'
            },
            data: {
                type: 'object',
                properties: {
                    favoritesMosques: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/MosqueBasic'
                        }
                    }
                }
            }
        }
    },

    FavoritesMosquesList: {
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
                    favoritesMosques: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/MosqueBasic'
                        }
                    },
                    totalFavorites: {
                        type: 'number',
                        example: 1
                    },
                    maxAllowed: {
                        type: 'number',
                        example: 1,
                        description: 'Maximum number of favorite mosques allowed'
                    }
                }
            }
        }
    },

    MosqueFavoritesResponse: {
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
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                format: 'ObjectId',
                                example: '64a123b456c789d012e345f6'
                            },
                            name: {
                                type: 'string',
                                example: 'Masjid Al-Noor'
                            },
                            address: {
                                type: 'string',
                                example: '123 Main Street, City'
                            }
                        }
                    },
                    favoritedBy: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                _id: {
                                    type: 'string',
                                    format: 'ObjectId'
                                },
                                name: {
                                    type: 'string',
                                    example: 'John Doe'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'john@example.com'
                                },
                                profile: {
                                    type: 'object',
                                    properties: {
                                        firstName: {
                                            type: 'string',
                                            example: 'John'
                                        },
                                        lastName: {
                                            type: 'string',
                                            example: 'Doe'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    totalFavorites: {
                        type: 'number',
                        example: 5,
                        description: 'Total number of users who have favorited this mosque'
                    }
                }
            }
        }
    }

};

module.exports = favoritesMosqueSchemas;
