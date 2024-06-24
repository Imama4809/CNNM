const express = require('express')
const router = express.Router();

const ctrl_projects = require('../controllers/projects')
const ctrl_layers = require('../controllers/layers')

//users page 


router
    .route('/:userid/projects')
    .get(ctrl_projects.view_projects)
    .post(ctrl_projects.create_project)
router 
    .route('/:userid/projects/:projectid')
    .get(ctrl_layers.view_project)
    .post(ctrl_layers.create_layer)
    .delete(ctrl_projects.delete_project)
    .put(ctrl_projects.update_project)
router
    .route('/:userid/projects/:projectid/layers/:layerid')
    .get(ctrl_layers.view_layer)
    .delete(ctrl_layers.delete_layer)
    .put(ctrl_layers.update_layer)
module.exports = router