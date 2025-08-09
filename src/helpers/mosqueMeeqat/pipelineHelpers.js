const buildMosqueMeeqatPipeline = (mosqueId, startDay, endDay) => {
    return [
        {
            $match: {
                mosque: mosqueId
            }
        },
        {
            $addFields: {
                timings: {
                    $filter: {
                        input: "$timings",
                        cond: {
                            $and: [
                                { $gte: ["$$this.dayNumber", startDay] },
                                { $lte: ["$$this.dayNumber", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'mosques',
                localField: 'mosque',
                foreignField: '_id',
                as: 'mosque',
                pipeline: [
                    { $project: { name: 1, address: 1, locality: 1 } }
                ]
            }
        },
        {
            $lookup: {
                from: 'officialmeeqats',
                localField: 'sourceOfficialMeeqat',
                foreignField: '_id',
                as: 'sourceOfficialMeeqat',
                pipeline: [
                    { $project: { locationName: 1, publisher: 1, sect: 1, schoolOfThought: 1 } }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'generatedBy',
                foreignField: '_id',
                as: 'generatedBy',
                pipeline: [
                    { $project: { name: 1, email: 1 } }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'approvedBy',
                foreignField: '_id',
                as: 'approvedBy',
                pipeline: [
                    { $project: { name: 1, email: 1 } }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                mosque: { $arrayElemAt: ['$mosque', 0] },
                sourceOfficialMeeqat: { $arrayElemAt: ['$sourceOfficialMeeqat', 0] },
                version: 1,
                generatedAt: 1,
                generatedBy: { $arrayElemAt: ['$generatedBy', 0] },
                isApproved: 1,
                approvedBy: { $arrayElemAt: ['$approvedBy', 0] },
                approvedAt: 1,
                timings: 1
            }
        }
    ];
};

module.exports = {
    buildMosqueMeeqatPipeline
};