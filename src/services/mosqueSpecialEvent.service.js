const MosqueSpecialEvent = require('../models/mosqueSpecialEvent.model');
const Mosque = require('../models/mosque.model');

// Get all year documents for a mosque
const getMosqueSpecialEvents = async (mosqueId) => {
    try {
        const documents = await MosqueSpecialEvent.find({
            mosque: mosqueId,
            isActive: true
        })
        .sort({ year: -1 })
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email');

        return {
            status: 'success',
            documents: documents
        };
    } catch (error) {
        console.error('GetMosqueSpecialEvents error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch special events'
        };
    }
};

// Get specific year document
const getMosqueSpecialEventsByYear = async (mosqueId, year) => {
    try {
        const document = await MosqueSpecialEvent.findOne({
            mosque: mosqueId,
            year: year,
            isActive: true
        })
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email');

        if (!document) {
            return {
                status: 'failed',
                code: 404,
                message: `No special events found for year ${year}`
            };
        }

        return {
            status: 'success',
            document: document
        };
    } catch (error) {
        console.error('GetMosqueSpecialEventsByYear error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch special events'
        };
    }
};

// Admin: Get all special events
const getAllSpecialEvents = async (page, limit) => {
    try {
        const skip = (page - 1) * limit;

        const [documents, total] = await Promise.all([
            MosqueSpecialEvent.find({ isActive: true })
                .populate('mosque', 'name locality')
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            MosqueSpecialEvent.countDocuments({ isActive: true })
        ]);

        return {
            status: 'success',
            documents: documents,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('GetAllSpecialEvents error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch all special events'
        };
    }
};

// Create new year document
const createYearDocument = async (mosqueId, year, userId) => {
    try {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
            return {
                status: 'failed',
                code: 404,
                message: 'Mosque not found'
            };
        }

        // Check if document already exists for this year
        const existingDoc = await MosqueSpecialEvent.findOne({
            mosque: mosqueId,
            year: year
        });

        if (existingDoc) {
            return {
                status: 'failed',
                code: 400,
                message: `Special events document already exists for year ${year}`
            };
        }

        // Check 3 document limit
        const documentCount = await MosqueSpecialEvent.countDocuments({
            mosque: mosqueId,
            isActive: true
        });

        if (documentCount >= 3) {
            // Find and delete the oldest document
            const oldestDoc = await MosqueSpecialEvent.findOne({
                mosque: mosqueId,
                isActive: true
            }).sort({ year: 1 });

            if (oldestDoc) {
                await MosqueSpecialEvent.findByIdAndDelete(oldestDoc._id);
            }
        }

        // Create new document
        const newDocument = await MosqueSpecialEvent.create({
            mosque: mosqueId,
            year: year,
            events: [],
            createdBy: userId
        });

        const populatedDoc = await MosqueSpecialEvent.findById(newDocument._id)
            .populate('createdBy', 'name email');

        return {
            status: 'success',
            message: `Special events document created for year ${year}`,
            document: populatedDoc
        };
    } catch (error) {
        console.error('CreateYearDocument error:', error);

        // Check for validation error
        if (error.name === 'ValidationError') {
            return {
                status: 'failed',
                code: 400,
                // Extract first mongoose validation message
                message: Object.values(error.errors).map(err => err.message).join(', ')
            };
        }

        return {
            status: 'failed',
            code: 500,
            message: 'Failed to create year document'
        };
    }
};

// Add event to year document
const addEvent = async (mosqueId, year, eventData, userId) => {
    try {
        const document = await MosqueSpecialEvent.findOne({
            mosque: mosqueId,
            year: year,
            isActive: true
        });

        if (!document) {
            return {
                status: 'failed',
                code: 404,
                message: `No special events document found for year ${year}`
            };
        }

        // Check 10 event limit
        if (document.events.length >= 10) {
            return {
                status: 'failed',
                code: 400,
                message: 'Maximum 10 events allowed per year'
            };
        }

        // Validate event data
        if (!eventData.eventType || !eventData.date) {
            return {
                status: 'failed',
                code: 400,
                message: 'Event type and date are required'
            };
        }

        // Check custom event name requirement
        if (eventData.eventType === 'custom' && !eventData.customEventName) {
            return {
                status: 'failed',
                code: 400,
                message: 'Custom event name is required for custom events'
            };
        }

        // Add event to array
        document.events.push(eventData);
        document.lastModifiedBy = userId;
        document.lastModifiedAt = new Date();

        await document.save();

        return {
            status: 'success',
            message: 'Event added successfully',
            document: document
        };
    } catch (error) {
        console.error('AddEvent error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to add event'
        };
    }
};

// Update specific event
const updateEvent = async (mosqueId, year, eventId, updateData, userId) => {
    try {
        const document = await MosqueSpecialEvent.findOne({
            mosque: mosqueId,
            year: year,
            isActive: true
        });

        if (!document) {
            return {
                status: 'failed',
                code: 404,
                message: `No special events document found for year ${year}`
            };
        }

        // Find the event
        const event = document.events.id(eventId);
        if (!event) {
            return {
                status: 'failed',
                code: 404,
                message: 'Event not found'
            };
        }

        // Validate custom event name if changing to custom
        if (updateData.eventType === 'custom' && !updateData.customEventName) {
            return {
                status: 'failed',
                code: 400,
                message: 'Custom event name is required for custom events'
            };
        }

        // Update event fields
        Object.assign(event, updateData);
        document.lastModifiedBy = userId;
        document.lastModifiedAt = new Date();

        await document.save();

        return {
            status: 'success',
            message: 'Event updated successfully',
            document: document
        };
    } catch (error) {
        console.error('UpdateEvent error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update event'
        };
    }
};

// Delete specific event (hard delete)
const deleteEvent = async (mosqueId, year, eventId, userId) => {
    try {
        const document = await MosqueSpecialEvent.findOne({
            mosque: mosqueId,
            year: year,
            isActive: true
        });

        if (!document) {
            return {
                status: 'failed',
                code: 404,
                message: `No special events document found for year ${year}`
            };
        }

        // Find the event
        const event = document.events.id(eventId);
        if (!event) {
            return {
                status: 'failed',
                code: 404,
                message: 'Event not found'
            };
        }

        // Remove event from array using pull
        document.events.pull(eventId); // The pull() method is the proper way to remove subdocuments from an array in modern Mongoose versions.
        document.lastModifiedBy = userId;
        document.lastModifiedAt = new Date();

        await document.save();

        return {
            status: 'success',
            message: 'Event deleted successfully',
            document: document
        };
    } catch (error) {
        console.error('DeleteEvent error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to delete event'
        };
    }
};

module.exports = {
    getMosqueSpecialEvents,
    getMosqueSpecialEventsByYear,
    getAllSpecialEvents,
    createYearDocument,
    addEvent,
    updateEvent,
    deleteEvent
};