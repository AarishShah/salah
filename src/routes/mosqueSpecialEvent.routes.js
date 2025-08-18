// routes/mosqueSpecialEvent.routes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/mosqueSpecialEvent.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware
const editorAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });
const adminAuth = Auth({ allowedRoles: ['admin'] });

// --- Admin Routes ---

// Admin: Get all special events across all mosques
router
    .get("/all/admin", adminAuth, controller.getAllSpecialEvents);

// --- Editor & Admin Routes ---

router
    .get("/:mosqueId", editorAuth, controller.getMosqueSpecialEvents)
    .get("/:mosqueId/:year", editorAuth, controller.getMosqueSpecialEventsByYear)
    .post("/:mosqueId/:year", editorAuth, controller.createYearDocument)
    .post("/:mosqueId/:year/event", editorAuth, controller.addEvent)
    .put("/:mosqueId/:year/event/:eventId", editorAuth, controller.updateEvent) // @safwannazir911 Problem: I can put 2024 data in 2025 calender. Fix this!
    .delete("/:mosqueId/:year/event/:eventId", editorAuth, controller.deleteEvent);

module.exports = router;