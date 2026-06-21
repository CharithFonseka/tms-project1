'use strict';

jest.mock('../../src/config/db');
jest.mock('../../src/modules/notifications/notifications.service');

const supabase = require('../../src/config/db');
const { createNotification } = require('../../src/modules/notifications/notifications.service');
const ApiError = require('../../src/utils/ApiError');
const { addComment, listComments } = require('../../src/modules/comments/comments.service');

beforeEach(() => {
    jest.clearAllMocks();
    createNotification.mockResolvedValue(undefined);
});

describe('addComment', () => {
    const TASK_ID = 'task-1';
    const USER_ID = 'user-a';
    const CONTENT = 'This is a comment';
    const COMMENT = { id: 'comment-1', task_id: TASK_ID, user_id: USER_ID, content: CONTENT };
    const ASSIGNEES = [{ user_id: 'user-a' }, { user_id: 'user-b' }];

    function mockSupabase(commentError = null) {
        supabase.from = jest.fn((table) => {
            if (table === 'Comments') {
                return {
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: COMMENT, error: commentError }),
                };
            }
            if (table === 'TaskAssignments') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ data: ASSIGNEES, error: null }),
                };
            }
        });
    }

    test('adds a comment and notifies other assignees', async () => {
        mockSupabase();
        const result = await addComment(TASK_ID, USER_ID, CONTENT);
        expect(result).toEqual(COMMENT);
        
        // user-a made the comment, so only user-b should be notified
        expect(createNotification).toHaveBeenCalledTimes(1);
        expect(createNotification).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-b', type: 'comment_added' })
        );
    });

    test('throws ApiError if inserting comment fails', async () => {
        mockSupabase({ message: 'DB error' });
        await expect(addComment(TASK_ID, USER_ID, CONTENT)).rejects.toThrow('DB error');
    });
});

describe('listComments', () => {
    test('lists comments for a task', async () => {
        const COMMENTS = [{ id: 'c1' }, { id: 'c2' }];
        const chain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: COMMENTS, error: null }),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        
        const result = await listComments('task-1');
        expect(result).toEqual(COMMENTS);
        expect(chain.eq).toHaveBeenCalledWith('task_id', 'task-1');
        expect(chain.order).toHaveBeenCalledWith('createdAt');
    });

    test('throws ApiError on db error', async () => {
        const chain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        await expect(listComments('task-1')).rejects.toThrow('db error');
    });
});
