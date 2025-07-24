const User = require('../models/user.model');
const EditorRequest = require('../models/editorRequest.model');
const MosqueTimingConfig = require('../models/mosqueTimingConfig.model');

// Admin Services
const getAllUsers = async (filters) => {
    try {
        const { page, limit, role, status, search } = filters;
        const query = {};

        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'blocked') query.isBlocked = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-refreshTokens -__v')
            .populate('assignedMosques', 'name locality')
            .sort('-createdAt')
            .limit(limit)
            .skip((page - 1) * limit);

        return {
            status: 'success',
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNext: page * limit < totalUsers
            }
        };
    } catch (error) {
        console.error('GetAllUsers error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch users'
        };
    }
};

const getUser = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('-refreshTokens -__v')
            .populate('assignedMosques', 'name address locality contactPerson');

        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        return {
            status: 'success',
            user
        };
    } catch (error) {
        console.error('GetUser error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch user'
        };
    }
};

const getUserStats = async () => {
    try {
        const stats = await User.aggregate([
            {
                $facet: {
                    byRole: [
                        {
                            $group: {
                                _id: '$role',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    byStatus: [
                        {
                            $group: {
                                _id: null, // Don't group, aggregate all users
                                total: { $sum: 1 },
                                active: {
                                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                                },
                                blocked: {
                                    $sum: { $cond: [{ $eq: ['$isBlocked', true] }, 1, 0] }
                                }
                            }
                        }
                    ],
                    recentSignups: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 30 }
                    ],
                    editorStats: [
                        {
                            $match: { role: 'editor' }
                        },
                        {
                            $lookup: {
                                from: 'mosques',
                                localField: 'assignedMosques',
                                foreignField: '_id',
                                as: 'mosques'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalEditors: { $sum: 1 },
                                totalAssignedMosques: { $sum: { $size: '$assignedMosques' } }
                            }
                        }
                    ]
                }
            }
        ]);

        const processedStats = {
            roleDistribution: {},
            statusCounts: {},
            recentSignups: [],
            editorInfo: {}
        };

        // Process role distribution
        if (stats[0].byRole) {
            stats[0].byRole.forEach(item => {
                processedStats.roleDistribution[item._id] = item.count;
            });
        }

        // Process status counts
        if (stats[0].byStatus && stats[0].byStatus[0]) {
            processedStats.statusCounts = {
                total: stats[0].byStatus[0].total || 0,
                active: stats[0].byStatus[0].active || 0,
                blocked: stats[0].byStatus[0].blocked || 0,
                inactive: (stats[0].byStatus[0].total || 0) - (stats[0].byStatus[0].active || 0)
            };
        }

        // Process recent signups
        processedStats.recentSignups = stats[0].recentSignups || [];

        // Process editor stats
        if (stats[0].editorStats && stats[0].editorStats[0]) {
            processedStats.editorInfo = {
                totalEditors: stats[0].editorStats[0].totalEditors || 0,
                totalAssignedMosques: stats[0].editorStats[0].totalAssignedMosques || 0
            };
        }

        // Get pending editor requests count
        const pendingRequests = await EditorRequest.countDocuments({
            status: 'pending',
            isActive: true  // ADDED: Only count active pending requests
        });
        processedStats.pendingEditorRequests = pendingRequests;

        return {
            status: 'success',
            stats: processedStats
        };
    } catch (error) {
        console.error('GetUserStats error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch user statistics'
        };
    }
};

const getAllEditors = async () => {
    try {
        const editors = await User.find({ role: 'editor', isActive: true })
            .select('name email assignedMosques createdAt')
            .populate('assignedMosques', 'name locality address')
            .sort('name');

        return {
            status: 'success',
            editors,
            total: editors.length
        };
    } catch (error) {
        console.error('GetAllEditors error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch editors'
        };
    }
};

const getEditorRequests = async (status) => {
    try {
        const query = { isActive: true };  // ADDED: Only get active requests
        if (status) query.status = status;

        const requests = await EditorRequest.find(query)
            .populate('userId', 'name email profilePicture')
            .populate('requestedMosques', 'name locality address')
            .populate('reviewedBy', 'name email')
            .sort('-createdAt');

        return {
            status: 'success',
            requests,
            total: requests.length
        };
    } catch (error) {
        console.error('GetEditorRequests error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to fetch editor requests'
        };
    }
};

const handleEditorRequest = async (requestId, action, adminId, rejectionReason) => {
    try {
        const request = await EditorRequest.findById(requestId)
            .populate('userId', '-refreshTokens -googleId -__v') // Remove versions @Aarish khud ko nahi krpana chahiye admin -> editor
            .populate('requestedMosques');

        if (!request) {
            return {
                status: 'failed',
                code: 404,
                message: 'Editor request not found'
            };
        }

        if (!request.isActive) {  // ADDED: Check if request is active
            return {
                status: 'failed',
                code: 400,
                message: 'Request is no longer active'
            };
        }

        if (request.status !== 'pending') {
            return {
                status: 'failed',
                code: 400,
                message: 'Request has already been processed'
            };
        }

        const user = request.userId;

        if (!user || !user.isActive) {
            return {
                status: 'failed',
                code: 400,
                message: 'User is not active'
            };
        }

        if (action === 'approve') {
            // Check if requested mosques are still available
            const mosquesWithEditors = await User.find({
                role: 'editor',
                isActive: true,
                assignedMosques: { $in: request.requestedMosques }
            });

            if (mosquesWithEditors.length > 0) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Some requested mosques already have editors'
                };
            }

            // Update user role and assign mosques
            user.role = 'editor';
            user.assignedMosques = request.requestedMosques;
            await user.save();

            // Update request
            request.status = 'approved';
            request.reviewedBy = adminId;
            request.reviewedAt = new Date();
            request.isActive = false;  // ADDED: Mark as inactive after processing
            await request.save();

            return {
                status: 'success',
                message: 'Editor request approved successfully',
                user
            };
        } else {
            // Reject request
            request.status = 'rejected';
            request.reviewedBy = adminId;
            request.reviewedAt = new Date();
            request.reviewNote = rejectionReason || 'No reason provided';  // CHANGED: from rejectionReason to reviewNote
            request.isActive = false;  // ADDED: Mark as inactive after processing
            await request.save();

            return {
                status: 'success',
                message: 'Editor request rejected',
                request
            };
        }
    } catch (error) {
        console.error('HandleEditorRequest error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to process editor request'
        };
    }
};

const updateUserRole = async (userId, newRole, mosqueIds) => {
    try {
        const user = await User.findById(userId).select('-refreshTokens -__v');

        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        // Prevent demoting last admin
        if (user.role === 'admin' && newRole !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
            if (adminCount <= 1) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Cannot demote the last admin'
                };
            }
        }

        // If changing to editor, must have mosques
        if (newRole === 'editor') {
            if (!mosqueIds || mosqueIds.length === 0) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Editor must be assigned at least one mosque'
                };
            }

            // Validate mosques aren't assigned to other editors
            const mosquesWithEditors = await User.find({
                _id: { $ne: userId },
                role: 'editor',
                isActive: true,
                assignedMosques: { $in: mosqueIds }
            });

            if (mosquesWithEditors.length > 0) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Some mosques are already assigned to other editors'
                };
            }

            user.assignedMosques = mosqueIds;
        } else {
            // Clear mosque assignments for non-editors
            user.assignedMosques = [];
        }

        user.role = newRole;
        await user.save();

        return {
            status: 'success',
            message: 'User role updated successfully',
            user
        };
    } catch (error) {
        console.error('UpdateUserRole error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update user role'
        };
    }
};

const updateUserStatus = async (userId, isBlocked, blockedReason) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        // Prevent blocking last admin
        if (isBlocked && user.role === 'admin') {
            const activeAdminCount = await User.countDocuments({
                role: 'admin',
                isActive: true,
                isBlocked: false
            });
            if (activeAdminCount <= 1) {
                return {
                    status: 'failed',
                    code: 400,
                    message: 'Cannot block the last active admin'
                };
            }
        }

        user.isBlocked = isBlocked;
        user.blockedReason = isBlocked ? blockedReason : '';

        if (isBlocked) {
            user.refreshTokens = []; // Clear tokens when blocking
            user.assignedMosques = []; // Clear mosque assignments when blocking
        }

        await user.save();

        return {
            status: 'success',
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        };
    } catch (error) {
        console.error('UpdateUserStatus error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update user status'
        };
    }
};

const updateUserMosques = async (userId, mosqueIds) => {
    try {
        const user = await User.findById(userId).select('-refreshTokens -__v');

        if (!user) {
            return {
                status: 'failed',
                code: 404,
                message: 'User not found'
            };
        }

        if (user.role !== 'editor') {
            return {
                status: 'failed',
                code: 400,
                message: 'Only editors can be assigned mosques'
            };
        }

        // Validate mosques exist and are active
        const validMosques = await Mosque.find({
            _id: { $in: mosqueIds },
            isActive: true  // ADDED: Only consider active mosques
        });

        if (validMosques.length !== mosqueIds.length) {
            return {
                status: 'failed',
                code: 400,
                message: 'Some mosque IDs are invalid or inactive'
            };
        }

        // Check if mosques are assigned to other editors
        const mosquesWithEditors = await User.find({
            _id: { $ne: userId },
            role: 'editor',
            isActive: true,
            assignedMosques: { $in: mosqueIds }
        });

        if (mosquesWithEditors.length > 0) {
            return {
                status: 'failed',
                code: 400,
                message: 'Some mosques are already assigned to other editors'
            };
        }

        user.assignedMosques = mosqueIds;
        await user.save();

        return {
            status: 'success',
            message: 'Mosque assignments updated successfully',
            user
        };
    } catch (error) {
        console.error('UpdateUserMosques error:', error);
        return {
            status: 'failed',
            code: 500,
            message: 'Failed to update mosque assignments'
        };
    }
};

module.exports = {
    getAllUsers,
    getUser,
    getUserStats,
    getAllEditors,
    getEditorRequests,
    handleEditorRequest,
    updateUserRole,
    updateUserStatus,
    updateUserMosques,
};