const { checkApproachingDeadlines } = require('../../src/jobs/deadlineReminder.job');
const { createNotification } = require('../../src/modules/notifications/notifications.service');

jest.mock('../../src/modules/notifications/notifications.service', () => ({
  createNotification: jest.fn(),
  attachIO: jest.fn(),
}));

jest.mock('../../src/config/db', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          neq: jest.fn(() => ({
            data: [
              {
                id: 'task1',
                title: 'Fix bug',
                due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                TaskAssignments: [
                  { user_id: 'u1' },
                  { user_id: 'u2' },
                ],
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

test('creates notifications for each assignee of a task due tomorrow', async () => {
  await checkApproachingDeadlines();
  expect(createNotification).toHaveBeenCalledTimes(2);
  expect(createNotification).toHaveBeenCalledWith({
    userId: 'u1',
    message: 'Task "Fix bug" is due within 24 hours',
    type: 'deadline_approaching',
  });
  expect(createNotification).toHaveBeenCalledWith({
    userId: 'u2',
    message: 'Task "Fix bug" is due within 24 hours',
    type: 'deadline_approaching',
  });
});