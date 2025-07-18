const express = require('express');
const router = express.Router();
const controller = require('../controllers/mosque.controller');

router.get('/map/nearby', controller.getNearbyMosques); // this route is public, should be user, editor, admin

/*

    Add more mosque-related routes here as needed
    e.g.:
    get by id for all users
    get by search query. name, sect, locality, etc. for all users
    get all editor mosques by editor only
    get all mosques by admin only
    create mosque by admin only, admin would see on map and should be able to fill a form to add mosque
    update mosque by editor and admin
    delete mosque by admin

    keep user, editor, admin routes separate by comments above the routes
    
*/ 


module.exports = router; 