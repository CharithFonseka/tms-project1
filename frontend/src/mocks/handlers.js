// ⚠️ When feature/frontend-auth-admin merges to develop, uncomment the lines below
// and add authHandlers to the array.
// import { authHandlers } from '../features/auth/auth.handlers';

import { taskHandlers } from '../features/tasks/task.handlers';

export const handlers = [
  // ...authHandlers,  // ← uncomment when Person 4's auth handlers are available
  ...taskHandlers,
];
