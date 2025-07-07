// controllers/mosqueTimingConfig.controller.js
const svc = require('../services/mosqueTimingConfig.service');
const catchError = require('../utils/catchError');

// create 
const create = catchError(async (req, res) => {
  const result = await svc.create(req.body, req.user.userId);
  return res.status(result.status === 'success' ? 201 : result.code).json(result);
});

//  list 
const list = catchError(async (req, res) => {
  const result = await svc.list(req.query);
  return res.status(result.status === 'success' ? 200 : result.code).json(result);
});

//  get by id 
const getById = catchError(async (req, res) => {
  const result = await svc.getById(req.params.id);
  return res.status(result.status === 'success' ? 200 : result.code).json(result);
});

//  update 
const update = catchError(async (req, res) => {
  const result = await svc.update(req.params.id, req.body, req.user.userId);
  return res.status(result.status === 'success' ? 200 : result.code).json(result);
});

//  remove 
const remove = catchError(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user.userId);
  return res.status(result.status === 'success' ? 200 : result.code).json(result);
});

module.exports = {
  create,
  list,
  getById,
  update,
  remove
};