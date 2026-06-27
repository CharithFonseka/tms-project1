const cron = require('node-cron');
const supabase = require('../config/db');
const { createNotification } = require('../modules/notifications/notifications.service');

async function checkApproachingDeadlines() {
  // SRS: notify when a task's due_date is <= 24 hours away.
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: tasks } = await supabase
    .from('Tasks')
    .select('id, title, due_date, TaskAssignments(user_id)')
    .gte('due_date', now.toISOString())
    .lte('due_date', in24h.toISOString())
    .neq('status', 'Completed');

  for (const task of tasks || []) {
    for (const assignment of task.TaskAssignments) {
      await createNotification({
        userId: assignment.user_id,
        message: `Task "${task.title}" is due within 24 hours`,
        type: 'deadline_approaching',
      });
    }
  }
}

function startDeadlineReminderJob() {
  // SRS: evaluated by a scheduled cron job running every hour.
  cron.schedule('0 * * * *', checkApproachingDeadlines);
  console.log('Deadline reminder job scheduled — runs hourly');
}

module.exports = { startDeadlineReminderJob, checkApproachingDeadlines };