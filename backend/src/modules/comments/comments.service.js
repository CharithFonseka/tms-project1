const supabase = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { createNotification } = require('../notifications/notifications.service');

async function addComment(taskId, userId, content) {
    const { data: comment, error } = await supabase
        .from('Comments').insert({ task_id: taskId, user_id: userId, content }).select().single();
    if (error) throw new ApiError(400, error.message);

    const { data: assignees } = await supabase.from('TaskAssignments').select('user_id').eq('task_id', taskId);
    await Promise.all(
        assignees.filter((a) => a.user_id !== userId)
            .map((a) => createNotification({ userId: a.user_id, message: 'New comment on your task', type: 'comment_added' }))
    );
    return comment;
}

async function listComments(taskId) {
    const { data, error } = await supabase.from('Comments').select('*').eq('task_id', taskId).order('created_at');
    if (error) throw new ApiError(400, error.message);
    return data;
}

module.exports = { addComment, listComments };