const editorService = require("../services/editor.service");
const catchError = require("../utils/catchError");

// Editor Controllers
const getAssignedMosques = catchError(async (req, res) => {
    const { userId } = req.user;

    const result = await editorService.getAssignedMosques(userId);

    if (result.status === 'failed') {
        return res.status(result.code || 404).json(result);
    }

    return res.json(result);
});

module.exports = {
    getAssignedMosques,
};