const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');

// Маршруты для проектов
router.get('/projects', projectController.getAllProjects);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Маршруты для задач
router.get('/projects/:projectId/tasks', taskController.getProjectTasks);
router.post('/projects/:projectId/tasks', taskController.createTask);
router.patch('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router; 