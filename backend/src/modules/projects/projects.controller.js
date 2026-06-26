const projectsService = require('./projects.service');
const { apiResponse } = require('../../utils/apiResponse');
const ApiError = require('../../utils/ApiError');

async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, 'Project name is required');
    const project = await projectsService.createProject(req.user.id, { name, description });
    res.status(201).json(apiResponse(project, 'Project created successfully'));
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await projectsService.listProjects(req.user.id, req.user.role);
    res.json(apiResponse(projects));
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    res.json(apiResponse(project));
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    res.json(apiResponse(project, 'Project updated successfully'));
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    await projectsService.deleteProject(req.params.id);
    res.json(apiResponse(null, 'Project deleted successfully'));
  } catch (err) {
    next(err);
  }
}

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
