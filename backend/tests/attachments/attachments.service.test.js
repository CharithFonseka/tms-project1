'use strict';

jest.mock('../../src/config/db');
jest.mock('../../src/modules/attachments/attachments.storage');

const supabase = require('../../src/config/db');
const { uploadFile, deleteFile } = require('../../src/modules/attachments/attachments.storage');
const ApiError = require('../../src/utils/ApiError');
const { addAttachment, listAttachments, removeAttachment } = require('../../src/modules/attachments/attachments.service');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('addAttachment', () => {
    const TASK_ID = 'task-1';
    const UPLOADER_ID = 'user-a';
    const FILE = { originalname: 'test.jpg' };
    const UPLOAD_RESULT = { path: 'path/to/test.jpg', url: 'https://url/test.jpg' };
    const ATTACHMENT = { id: 'att-1', task_id: TASK_ID, file_url: UPLOAD_RESULT.url };

    test('uploads file and inserts attachment record', async () => {
        uploadFile.mockResolvedValue(UPLOAD_RESULT);
        
        supabase.from = jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: ATTACHMENT, error: null }),
        }));

        const result = await addAttachment(TASK_ID, UPLOADER_ID, FILE);
        
        expect(uploadFile).toHaveBeenCalledWith(TASK_ID, FILE);
        expect(result).toEqual(ATTACHMENT);
        expect(deleteFile).not.toHaveBeenCalled();
    });

    test('deletes uploaded file and throws ApiError if DB insert fails', async () => {
        uploadFile.mockResolvedValue(UPLOAD_RESULT);
        deleteFile.mockResolvedValue(undefined);
        
        supabase.from = jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        }));

        await expect(addAttachment(TASK_ID, UPLOADER_ID, FILE)).rejects.toThrow('db error');
        
        expect(deleteFile).toHaveBeenCalledWith(UPLOAD_RESULT.path);
    });
});

describe('listAttachments', () => {
    test('lists attachments for a task', async () => {
        const ATTACHMENTS = [{ id: 'a1' }, { id: 'a2' }];
        const chain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: ATTACHMENTS, error: null }),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        
        const result = await listAttachments('task-1');
        
        expect(result).toEqual(ATTACHMENTS);
        expect(chain.eq).toHaveBeenCalledWith('task_id', 'task-1');
    });

    test('throws ApiError on db error', async () => {
        const chain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        };
        supabase.from = jest.fn().mockReturnValue(chain);
        
        await expect(listAttachments('task-1')).rejects.toThrow('db error');
    });
});

describe('removeAttachment', () => {
    test('removes attachment successfully', async () => {
        let callCount = 0;
        supabase.from = jest.fn(() => {
            callCount++;
            if (callCount === 1) {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: { file_url: 'url' } }),
                };
            }
            return {
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ error: null }),
            };
        });

        await removeAttachment('att-1');
        
        expect(supabase.from).toHaveBeenCalledWith('Attachments');
    });

    test('throws 404 if attachment not found', async () => {
        supabase.from = jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null }),
        }));

        await expect(removeAttachment('missing')).rejects.toThrow('Attachment not found');
    });
});
