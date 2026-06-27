'use strict';

// ─── Mock dependencies BEFORE requiring the service ───────────────────────────
jest.mock('../../src/config/db');
jest.mock('../../src/modules/notifications/notifications.service');

const supabase = require('../../src/config/db');
const { createNotification } = require('../../src/modules/notifications/notifications.service');
const ApiError = require('../../src/utils/ApiError');
const {
    createTask,
    listTasks,
    updateTask,
    updateStatus,
    deleteTask,
    addAssignee,
    removeAssignee,
} = require('../../src/modules/tasks/tasks.service');

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    createNotification.mockResolvedValue(undefined);
});

// ─── createTask ───────────────────────────────────────────────────────────────

describe('createTask', () => {
    const FUTURE    = new Date(Date.now() + 86_400_000).toISOString();
    const PAST      = new Date(Date.now() - 86_400_000).toISOString();
    const CREATOR   = 'creator-uuid';
    const ASSIGNEES = ['user-a', 'user-b'];
    const TASK      = { id: 'task-1', title: 'Fix bug', due_date: FUTURE };

    function mockSupabase({ taskError = null, assignError = null } = {}) {
        supabase.from = jest.fn((table) => {
            if (table === 'Tasks') {
                return {
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: TASK, error: taskError }),
                    delete: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
                };
            }
            if (table === 'TaskAssignments') {
                return { insert: jest.fn().mockResolvedValue({ error: assignError }) };
            }
        });
    }

    test('creates a task and notifies each assignee', async () => {
        mockSupabase();
        const result = await createTask(
            { title: 'Fix bug', due_date: FUTURE, assignees: ASSIGNEES, allowPastDue: false },
            CREATOR
        );
        expect(result).toEqual({ ...TASK, assignees: ASSIGNEES });
        expect(createNotification).toHaveBeenCalledTimes(ASSIGNEES.length);
        expect(createNotification).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-a', type: 'task_assigned' })
        );
    });

    test('throws 400 when due_date is in the past (allowPastDue=false)', async () => {
        await expect(
            createTask({ title: 'Old', due_date: PAST, assignees: ASSIGNEES, allowPastDue: false }, CREATOR)
        ).rejects.toThrow('Due date cannot be in the past');
    });

    test('allows past due_date when allowPastDue=true', async () => {
        mockSupabase();
        const result = await createTask(
            { title: 'Old', due_date: PAST, assignees: ASSIGNEES, allowPastDue: true },
            CREATOR
        );
        expect(result).toEqual({ ...TASK, assignees: ASSIGNEES });
    });

    test('rolls back task when assignee insert fails, then throws', async () => {
        const eqMock = jest.fn().mockResolvedValue({ error: null });
        supabase.from = jest.fn((table) => {
            if (table === 'Tasks') {
                return {
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: TASK, error: null }),
                    delete: jest.fn(() => ({ eq: eqMock })),
                };
            }
            if (table === 'TaskAssignments') {
                return { insert: jest.fn().mockResolvedValue({ error: { message: 'fk violation' } }) };
            }
        });

        await expect(
            createTask({ title: 'Fix bug', due_date: FUTURE, assignees: ASSIGNEES, allowPastDue: false }, CREATOR)
        ).rejects.toThrow('One or more assignees do not exist');

        // rollback eq called with task id
        expect(eqMock).toHaveBeenCalledWith('id', TASK.id);
    });

    test('throws ApiError when Tasks insert fails', async () => {
        supabase.from = jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }));
        await expect(
            createTask({ title: 'Fix bug', due_date: FUTURE, assignees: ASSIGNEES, allowPastDue: false }, CREATOR)
        ).rejects.toThrow('DB error');
    });
});

// ─── listTasks ────────────────────────────────────────────────────────────────

describe('listTasks', () => {
    const TASKS = [
        { id: 't1', TaskAssignments: [{ user_id: 'user-a' }] },
        { id: 't2', TaskAssignments: [{ user_id: 'user-b' }] },
    ];

    function buildChain() {
        // range() must return a thenable AND have .eq() for when filters are applied after range
        const resolved = (data, count) => ({
            then: (resolve) => resolve({ data, count, error: null }),
            eq: jest.fn().mockImplementation(() => resolved(TASKS, 2)),
        });
        const chain = {
            select: jest.fn().mockReturnThis(),
            order:  jest.fn().mockReturnThis(),
            range:  jest.fn().mockReturnValue(resolved(TASKS, 2)),
            eq:     jest.fn().mockReturnThis(),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        return chain;
    }

    test('returns all tasks for Manager role', async () => {
        buildChain();
        const result = await listTasks({}, { role: 'Manager', id: 'mgr' });
        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    test('filters tasks to only assigned ones for Collaborator', async () => {
        buildChain();
        const result = await listTasks({}, { role: 'Collaborator', id: 'user-a' });
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('t1');
    });

    test('applies status filter', async () => {
        const eqSpy = jest.fn().mockImplementation(() => Promise.resolve({ data: TASKS, count: 2, error: null }));
        const rangeResult = {
            then: (resolve) => resolve({ data: TASKS, count: 2, error: null }),
            eq: eqSpy,
        };
        const chain = {
            select: jest.fn().mockReturnThis(),
            order:  jest.fn().mockReturnThis(),
            range:  jest.fn().mockReturnValue(rangeResult),
            eq:     jest.fn().mockReturnThis(),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        await listTasks({ status: 'To Do' }, { role: 'Manager', id: 'mgr' });
        expect(eqSpy).toHaveBeenCalledWith('status', 'To Do');
    });

    test('applies priority filter', async () => {
        const eqSpy = jest.fn().mockImplementation(() => Promise.resolve({ data: TASKS, count: 2, error: null }));
        const rangeResult = {
            then: (resolve) => resolve({ data: TASKS, count: 2, error: null }),
            eq: eqSpy,
        };
        const chain = {
            select: jest.fn().mockReturnThis(),
            order:  jest.fn().mockReturnThis(),
            range:  jest.fn().mockReturnValue(rangeResult),
            eq:     jest.fn().mockReturnThis(),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        await listTasks({ priority: 'High' }, { role: 'Manager', id: 'mgr' });
        expect(eqSpy).toHaveBeenCalledWith('priority', 'High');
    });
});

// ─── updateTask ───────────────────────────────────────────────────────────────

describe('updateTask', () => {
    test('returns updated task data', async () => {
        const updated = { id: 'task-1', title: 'New title' };
        supabase.from = jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            eq:     jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: updated, error: null }),
        }));
        expect(await updateTask('task-1', { title: 'New title' })).toEqual(updated);
    });

    test('throws 404 when data is null (task not found)', async () => {
        supabase.from = jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            eq:     jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }));
        await expect(updateTask('missing', {})).rejects.toThrow('Task not found');
    });

    test('throws ApiError on supabase error', async () => {
        supabase.from = jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            eq:     jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'update failed' } }),
        }));
        await expect(updateTask('task-1', {})).rejects.toThrow('update failed');
    });
});

// ─── updateStatus ─────────────────────────────────────────────────────────────

describe('updateStatus', () => {
    const ASSIGNED_USERS = [{ user_id: 'user-a' }, { user_id: 'user-b' }];
    const TASK_DATA      = { id: 't1', status: 'Completed' };

    // The Tasks mock serves the current-status read first, then the update result.
    function tasksMock(currentStatus) {
        const single = jest.fn()
            .mockResolvedValueOnce({ data: { status: currentStatus } }) // transition check read
            .mockResolvedValueOnce({ data: TASK_DATA, error: null });    // update result
        return {
            update: jest.fn().mockReturnThis(),
            eq:     jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single,
        };
    }

    /** Build mock for Collaborator RBAC path */
    function mockForCollaborator(assignmentData, currentStatus = 'To Do') {
        let taCallCount = 0;
        const tasks = tasksMock(currentStatus);
        supabase.from = jest.fn((table) => {
            if (table === 'TaskAssignments') {
                taCallCount++;
                if (taCallCount === 1) {
                    // RBAC assignment check
                    return {
                        select:      jest.fn().mockReturnThis(),
                        eq:          jest.fn().mockReturnThis(),
                        maybeSingle: jest.fn().mockResolvedValue({ data: assignmentData }),
                    };
                }
                // second call: fetch assignees for notifications
                return {
                    select: jest.fn().mockReturnThis(),
                    eq:     jest.fn().mockResolvedValue({ data: ASSIGNED_USERS, error: null }),
                };
            }
            if (table === 'Tasks') return tasks;
        });
    }

    /** Build mock for Manager (no RBAC check, skips first TA call) */
    function mockForManager(currentStatus = 'In Progress') {
        const tasks = tasksMock(currentStatus);
        supabase.from = jest.fn((table) => {
            if (table === 'TaskAssignments') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq:     jest.fn().mockResolvedValue({ data: ASSIGNED_USERS, error: null }),
                };
            }
            if (table === 'Tasks') return tasks;
        });
    }

    test('Manager can advance status one step and notifications are sent', async () => {
        mockForManager('In Progress');
        const result = await updateStatus('t1', 'Completed', { role: 'Manager', id: 'mgr' });
        expect(result).toEqual(TASK_DATA);
        expect(createNotification).toHaveBeenCalledTimes(ASSIGNED_USERS.length);
    });

    test('rejects a status transition that skips a state (To Do → Completed)', async () => {
        mockForManager('To Do');
        await expect(
            updateStatus('t1', 'Completed', { role: 'Manager', id: 'mgr' })
        ).rejects.toMatchObject({ status: 400 });
    });

    test('Collaborator assigned to task can advance status one step', async () => {
        mockForCollaborator({ id: 'a1' }, 'To Do');
        const result = await updateStatus('t1', 'In Progress', { role: 'Collaborator', id: 'user-a' });
        expect(result).toEqual(TASK_DATA);
    });

    test('Collaborator NOT assigned throws 403', async () => {
        supabase.from = jest.fn((table) => {
            if (table === 'TaskAssignments') {
                return {
                    select:      jest.fn().mockReturnThis(),
                    eq:          jest.fn().mockReturnThis(),
                    maybeSingle: jest.fn().mockResolvedValue({ data: null }),
                };
            }
        });
        await expect(
            updateStatus('t1', 'Completed', { role: 'Collaborator', id: 'user-x' })
        ).rejects.toThrow('You are not assigned to this task');
    });
});

// ─── deleteTask ───────────────────────────────────────────────────────────────

describe('deleteTask', () => {
    test('deletes TaskAssignments, Comments, Attachments, then the Task', async () => {
        const eqMock     = jest.fn().mockResolvedValue({ error: null });
        const deleteMock = jest.fn(() => ({ eq: eqMock }));
        supabase.from    = jest.fn(() => ({ delete: deleteMock }));

        await deleteTask('task-1');
        const calledTables = supabase.from.mock.calls.map(([t]) => t);
        expect(calledTables).toContain('TaskAssignments');
        expect(calledTables).toContain('Comments');
        expect(calledTables).toContain('Attachments');
        expect(calledTables).toContain('Tasks');
    });

    test('throws ApiError when Tasks.delete fails', async () => {
        let call = 0;
        supabase.from = jest.fn(() => {
            call++;
            const errOrOk = call < 4 ? { error: null } : { error: { message: 'delete failed' } };
            return { delete: jest.fn(() => ({ eq: jest.fn().mockResolvedValue(errOrOk) })) };
        });
        await expect(deleteTask('task-1')).rejects.toThrow('delete failed');
    });
});

// ─── addAssignee ──────────────────────────────────────────────────────────────

describe('addAssignee', () => {
    test('inserts assignment and sends notification', async () => {
        supabase.from = jest.fn(() => ({
            insert: jest.fn().mockResolvedValue({ error: null }),
        }));
        await addAssignee('task-1', 'user-a');
        expect(createNotification).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-a', type: 'task_assigned' })
        );
    });

    test('throws when user already assigned or does not exist', async () => {
        supabase.from = jest.fn(() => ({
            insert: jest.fn().mockResolvedValue({ error: { message: 'unique violation' } }),
        }));
        await expect(addAssignee('task-1', 'user-a'))
            .rejects.toThrow('User is already assigned or does not exist');
    });
});

// ─── removeAssignee ───────────────────────────────────────────────────────────

describe('removeAssignee', () => {
    test('removes assignee successfully', async () => {
        const eq2 = jest.fn().mockResolvedValue({ error: null });
        const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
        supabase.from = jest.fn(() => ({
            delete: jest.fn(() => ({ eq: eq1 })),
        }));
        await expect(removeAssignee('task-1', 'user-a')).resolves.toBeUndefined();
    });

    test('throws ApiError on supabase error', async () => {
        const eq2 = jest.fn().mockResolvedValue({ error: { message: 'remove failed' } });
        const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
        supabase.from = jest.fn(() => ({
            delete: jest.fn(() => ({ eq: eq1 })),
        }));
        await expect(removeAssignee('task-1', 'user-a')).rejects.toThrow('remove failed');
    });
});
