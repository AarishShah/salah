const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");
const Auth = require("../middleware/auth.middleware");

const userAuth = Auth({ allowedRoles: ['user', 'editor', 'admin'] });

router
  // Public routes - no auth required
  .post("/send-otp", controller.sendOTP)
  .post("/verify-otp", controller.verifyOTP)
  .post("/refresh-token", controller.refreshToken)
  
  // Protected routes - require authentication
  .post("/logout", userAuth, controller.logout)
  .put("/update-role/:id", Auth({ requiredRole: 'admin' }), controller.updateUserRole);

module.exports = router;



