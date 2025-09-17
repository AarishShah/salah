const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const Auth = require("../middleware/auth.middleware");

// Middleware for any authenticated user
const allAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });
const userAuth = Auth({ allowedRoles: ['user'] });
const editorAuth = Auth({ allowedRoles: ['editor'] });
const editorAdminAuth = Auth({ allowedRoles: ['editor', 'admin'], checkMosqueAccess: true });
const editorAdminAuthNoMosqueCheck = Auth({ allowedRoles: ['editor', 'admin'] });


// --- User Routes ---
// These routes are for managing one's own profile and requests.

router
    .get("/profile", allAuth, controller.getProfile)
    .patch("/profile", allAuth, controller.updateProfile)
    .delete("/account", allAuth, controller.deleteAccount)
    // Notification preferences
    .get("/notification-preferences", allAuth, controller.getNotificationPreferences)
    .patch("/notification-preferences", allAuth, controller.updateNotificationPreferences)
    .post("/editor-request", userAuth, controller.createEditorRequest)

    .post("/editor-additional-request", editorAuth, controller.createEditorAdditionalRequest)
    .post("/send-notification", editorAdminAuth, controller.sendNotification)
    .post("/schedule-notification", editorAdminAuth, controller.scheduleNotification)

    // Scheduled notifications management
    .get("/my-scheduled-notifications", editorAdminAuthNoMosqueCheck, controller.getMyScheduledNotifications)
    .delete("/my-scheduled-notifications/:notificationId", editorAdminAuthNoMosqueCheck, controller.cancelMyScheduledNotification)

    // Editor request status
    .get("/editor-request/status", allAuth, controller.getEditorRequestStatus)
    .patch("/phone-verification", allAuth, controller.verifyPhoneStatus);

module.exports = router;