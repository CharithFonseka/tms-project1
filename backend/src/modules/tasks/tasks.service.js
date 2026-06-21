const supabase = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { createNotification } = require('../notifications/notifications.service');

async function createTask({ title, description, due_date, priority, assignees, allowPastDue }, creatorId) {
    if (!allowPastDue && new Date(due_date) < new Date()) {
        throw new ApiError(400, 'Due date cannot be in the past');
    }
    const { data: task, error } = await supabase
        .from('Tasks')
        .insert({ title, description, due_date, priority, created_by: creatorId })
        .select()
        .single();
    if (error) throw new ApiError(400, error.message);

    const rows = assignees.map((userId) => ({ task_id: task.id, user_id: userId }));
    const { error: assignError } = await supabase.from('TaskAssignments').insert(rows);
    if (assignError) {
        await supabase.from('Tasks').delete().eq('id', task.id);
        throw new ApiError(400, 'One or more assignees do not exist');
    }

    // 🔔 Notify all assignees
    await Promise.all(assignees.map((userId) =>
        createNotification({ userId, message: `You were assigned to task "${title}"`, type: 'task_assigned' })
    ));

    return { ...task, assignees };
}

async function listTasks({ status, priority, sortBy = 'due_date', order = 'asc', page = 1, limit = 20 }, requester) {
    let query = supabase
        .from('Tasks')
        .select('*, TaskAssignments(user_id)', { count: 'exact' })
        .order(sortBy, { ascending: order === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, count } = await query;

    const filtered = requester.role === 'Collaborator'
        ? data.filter((t) => t.TaskAssignments.some((a) => a.user_id === requester.id))
        : data;

    return { data: filtered, total: count };
}

async function updateTask(taskId, updates) {
    const { data, error } = await supabase.from('Tasks').update(updates).eq('id', taskId).select().single();
    if (error) throw new ApiError(400, error.message);
    if (!data) throw new ApiError(404, 'Task not found');
    return data;
}

async function updateStatus(taskId, status, requester) {
    if (requester.role === 'Collaborator') {
        const { data: assignment } = await supabase
            .from('TaskAssignments').select('id').eq('task_id', taskId).eq('user_id', requester.id).maybeSingle();
        if (!assignment) throw new ApiError(403, 'You are not assigned to this task');
    }
    const { data, error } = await supabase.from('Tasks').update({ status }).eq('id', taskId).select().single();
    if (error) throw new ApiError(400, error.message);

    // 🔔 Notify all assignees about status change
    const { data: assignedUsers } = await supabase.from('TaskAssignments').select('user_id').eq('task_id', taskId);
    await Promise.all(assignedUsers.map((a) =>
        createNotification({ userId: a.user_id, message: `Task status changed to ${status}`, type: 'status_changed' })
    ));

    return data;
}

async function deleteTask(taskId) {
    await supabase.from('TaskAssignments').delete().eq('task_id', taskId);
    await supabase.from('Comments').delete().eq('task_id', taskId);
    await supabase.from('Attachments').delete().eq('task_id', taskId);
    const { error } = await supabase.from('Tasks').delete().eq('id', taskId);
    if (error) throw new ApiError(400, error.message);
}

async function addAssignee(taskId, userId) {
    const { error } = await supabase.from('TaskAssignments').insert({ task_id: taskId, user_id: userId });
    if (error) throw new ApiError(400, 'User is already assigned or does not exist');

    // 🔔 Notify the new assignee
    await createNotification({ userId, message: 'You were assigned to a task', type: 'task_assigned' });
}

async function removeAssignee(taskId, userId) {
    const { error } = await supabase.from('TaskAssignments').delete().eq('task_id', taskId).eq('user_id', userId);
    if (error) throw new ApiError(400, error.message);
}

module.exports = { createTask, listTasks, updateTask, updateStatus, deleteTask, addAssignee, removeAssignee };