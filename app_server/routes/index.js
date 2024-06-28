var express = require('express');
var router = express.Router();
const methodOverride = require('method-override');

const Ctrl_projects = require('../controllers/projects')
const Ctrl_layers = require('../controllers/layers')
const Ctrl_users = require('../controllers/users')

router.use(methodOverride('_method'));


router.get('/login', Ctrl_users.login_user)
router.get('/signup', Ctrl_users.signup_user)

router.get('/:userid/projects', Ctrl_projects.Projects)


router.get('/:userid/projects/addproject', Ctrl_projects.view_add_project_page)
router.post('/:userid/projects/addproject', Ctrl_projects.add_project)


router.get('/:userid/projects/:projectid', Ctrl_projects.specific_project)

router.get('/:userid/projects/:projectid/updateproject', Ctrl_projects.view_update_project_page)
router.post('/:userid/projects/:projectid/updateproject', Ctrl_projects.update_project)


router.get('/:userid/projects/:projectid/addlayer', Ctrl_layers.view_add_layer_page)
router.post('/:userid/projects/:projectid/addlayer', Ctrl_layers.add_layer)


router.get('/:userid/projects/:projectid/:layerid', Ctrl_layers.specific_layer)
router.post('/:userid/projects/:projectid/:layerid', Ctrl_layers.update_layer)




module.exports = router;
