const Joi = require('joi');

exports.createUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('Admin', 'Project Manager', 'Collaborator').required(),
});

exports.updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    role: Joi.string().valid('Admin', 'Project Manager', 'Collaborator'),
    is_active: Joi.boolean(),
}).min(1);