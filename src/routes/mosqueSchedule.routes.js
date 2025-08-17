const express = require("express");
const router = express.Router();

const controller = require("../controllers/mosqueSchedule.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware configurations
const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });
const adminEditorAuth = Auth({ allowedRoles: ['editor', 'admin'] });

// --- Public Routes (All authenticated users) ---
// Get schedule with date range filtering
router.get("/:mosqueId/schedule", userAuth, controller.getScheduleByDateRange);

// Download schedule in various formats
router.get("/:mosqueId/download", userAuth, controller.downloadSchedule);

// --- Editor/Admin Routes ---
// Get all schedules for a mosque (minimal data, paginated)
router.get("/:mosqueId", adminEditorAuth, controller.getAllSchedules);

// Get full schedule document by ID
router.get("/:mosqueId/:scheduleId", adminEditorAuth, controller.getScheduleById);

// Generate new schedule
router.post("/generate/:mosqueId/:year", editorAuth, controller.generateSchedule);

// Update special events in existing schedule
router.put("/:scheduleId/update-events", editorAuth, controller.updateSpecialEvents);

// Delete schedule
router.delete("/:scheduleId", editorAuth, controller.deleteSchedule);

module.exports = router;