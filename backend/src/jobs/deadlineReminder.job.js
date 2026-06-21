const cron = require('node-cron');
const supabase = require('../config/db');
const { createNotification } = require('../modules/notifications/notifications.service');

async function checkApproachingDeadlines() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
    
  const { data: tasks } = await supabase
    .from('Tasks')
    .select('id, title, due_date, TaskAssignments(user_id)')
    .eq('due_date', tomorrow)
    .neq('status', 'Completed');

  for (const task of tasks || []) {
    for (const assignment of task.TaskAssignments) {
      await createNotification({
        userId: assignment.user_id,
        message: `Task "${task.title}" is due tomorrow`,
        type: 'deadline_approaching',
      });
    }
  }
}

function startDeadlineReminderJob() {
  cron.schedule('0 8 * * *', checkApproachingDeadlines);
  console.log('Deadline reminder job scheduled — runs daily at 8am');
}

module.exports = { startDeadlineReminderJob, checkApproachingDeadlines };