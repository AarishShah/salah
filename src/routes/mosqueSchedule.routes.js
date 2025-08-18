const express = require("express");
const router = express.Router();

const controller = require("../controllers/mosqueSchedule.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware configurations
const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });

// --- Public Routes (All authenticated users) ---

router
    // Get schedule with date range filtering
    .get("/:mosqueId/schedule", userAuth, controller.getScheduleByDateRange)

    // Download schedule in various formats
    .get("/:mosqueId/download", userAuth, controller.downloadSchedule);


// --- Editor/Admin Routes ---

// Get all schedules for a mosque (minimal data, paginated)
router
    .get("/:mosqueId", editorAuth, controller.getAllSchedules)

    // Get full schedule document by ID
    .get("/:mosqueId/:scheduleId", editorAuth, controller.getScheduleById)

    // Generate new schedule
    .post("/generate/:mosqueId/:year", editorAuth, controller.generateSchedule)

    // Update special events in existing schedule
    .put("/:mosqueId/:scheduleId/update-events", editorAuth, controller.updateSpecialEvents)

    // Delete schedule
    .delete("/:mosqueId/:scheduleId", editorAuth, controller.deleteSchedule);

module.exports = router;