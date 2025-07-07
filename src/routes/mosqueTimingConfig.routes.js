// routes/mosqueTimingConfig.routes.js
const express = require('express');
const router = express.Router();

const Auth = require('../middleware/auth.middleware');
const controller = require('../controllers/mosqueTimingConfig.controller');

const adminAuth = Auth({ requiredRole: 'admin' });

router
  .post('/', adminAuth, controller.create)
  .get('/', controller.list)
  .get('/:id', controller.getById)
  .put('/:id', adminAuth, controller.update)
  .delete('/:id', adminAuth, controller.remove);

module.exports = router;
