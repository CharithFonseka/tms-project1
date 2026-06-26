import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
let mockTasks = [
  { id: 't1', title: 'Setup CI pipeline', description: 'Configure GitHub Actions', due_date: '2026-12-01', priority: 'High', status: 'To Do', assignees: ['33333333-3333-3333-3333-333333333333'] },
  { id: 't2', title: 'Write API docs', description: '', due_date: '2026-11-15', priority: 'Medium', status: 'In Progress', assignees: ['33333333-3333-3333-3333-333333333333'] },
];
let mockComments = [];
let nextId = 3;

export const taskHandlers = [
  http.get('*/tasks', () => HttpResponse.json({ data: mockTasks, total: mockTasks.length })),

  http.get('*/users', () => HttpResponse.json({
    data: [
      { id: '33333333-3333-3333-3333-333333333333', name: 'PM User', email: 'pm@test.com', role: 'Project Manager', is_active: true }
    ],
    total: 1
  })),

  http.post('*/tasks', async ({ request }) => {
    const body = await request.json();
    const task = { id: `t${nextId++}`, status: 'To Do', ...body };
    mockTasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch('*/tasks/:id/status', async ({ params, request }) => {
    const { status } = await request.json();
    const task = mockTasks.find((t) => t.id === params.id);
    if (task) task.status = status;
    return HttpResponse.json(task);
  }),

  http.delete('*/tasks/:id', ({ params }) => {
    mockTasks = mockTasks.filter((t) => t.id !== params.id);
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('*/tasks/:id/comments', ({ params }) =>
    HttpResponse.json(mockComments.filter((c) => c.task_id === params.id))
  ),

  http.post('*/tasks/:id/comments', async ({ params, request }) => {
    const { content } = await request.json();
    const comment = { id: `c${nextId++}`, task_id: params.id, content, user_id: 'mock-user', createdAt: new Date().toISOString() };
    mockComments.push(comment);
    return HttpResponse.json(comment, { status: 201 });
  }),

  http.get('*/notifications', () => HttpResponse.json([])),
];

