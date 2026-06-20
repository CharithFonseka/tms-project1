const Joi = require('joi');

exports.createTaskSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().allow('').max(2000),
    due_date: Joi.date().iso().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    assignees: Joi.array().items(Joi.string().uuid()).min(1).required(),
    allowPastDue: Joi.boolean().default(false),
});

exports.updateTaskSchema = Joi.object({
    title: Joi.string().min(1).max(200),
    description: Joi.string().allow('').max(2000),
    due_date: Joi.date().iso(),
    priority: Joi.string().valid('Low', 'Medium', 'High'),
}).min(1);

exports.statusUpdateSchema = Joi.object({
    status: Joi.string().valid('To Do', 'In Progress', 'Completed').required(),
});