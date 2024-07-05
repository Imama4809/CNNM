const express = require('express')
const router = express.Router();

const ctrl_projects = require('../controllers/projects')
const ctrl_layers = require('../controllers/layers')
const ctrl_users = require('../controllers/users')
const ctrl_authentication = require('../controllers/authentication')

//users page 

router
    .route('/login')
    .post(ctrl_users.login_user)
router
    .route('/signup')
    .post(ctrl_users.add_user)
router
    .route('/:userid')
    .get(ctrl_users.view_user)
router
    .route('/:userid/projects')
    .get(ctrl_projects.view_projects)
    .post(ctrl_projects.create_project)
router 
    .route('/:userid/projects/:projectid')
    .get(ctrl_authentication.verify_JWT,ctrl_layers.view_project)
    .post(ctrl_authentication.verify_JWT,ctrl_layers.create_layer)
    .delete(ctrl_authentication.verify_JWT,ctrl_projects.delete_project)
    .put(ctrl_authentication.verify_JWT,ctrl_projects.update_project)
router
    .route('/:userid/projects/:projectid/layers/:layerid')
    .get(ctrl_authentication.verify_JWT,ctrl_layers.view_layer)
    .delete(ctrl_authentication.verify_JWT,ctrl_layers.delete_layer)
    .put(ctrl_authentication.verify_JWT,ctrl_layers.update_layer)
module.exports = router