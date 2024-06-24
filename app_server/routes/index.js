var express = require('express');
var router = express.Router();
const methodOverride = require('method-override');

const Ctrl_Projects = require('../controllers/projects')
const Ctrl_layers = require('../controllers/layers')

router.use(methodOverride('_method'));

router.get('/:userid/projects', Ctrl_Projects.Projects)


router.get('/:userid/projects/addproject', Ctrl_Projects.view_add_project_page)
router.post('/:userid/projects/addproject', Ctrl_Projects.add_project)


router.get('/:userid/projects/:projectid', Ctrl_Projects.specific_project)

router.get('/:userid/projects/:projectid/updateproject', Ctrl_Projects.view_update_project_page)
router.post('/:userid/projects/:projectid/updateproject', Ctrl_Projects.update_project)


router.get('/:userid/projects/:projectid/addlayer', Ctrl_layers.view_add_layer_page)
router.post('/:userid/projects/:projectid/addlayer', Ctrl_layers.add_layer)


router.get('/:userid/projects/:projectid/:layerid', Ctrl_layers.specific_layer)
router.post('/:userid/projects/:projectid/:layerid', Ctrl_layers.update_layer)

// Define a route for the home page
router.get('/', function(req, res, next) {
  res.render('index', { userid: 'William' });
});

module.exports = router;
