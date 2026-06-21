'use strict';

jest.mock('../../src/config/db');

const supabase = require('../../src/config/db');
const ApiError = require('../../src/utils/ApiError');
const { uploadFile, deleteFile } = require('../../src/modules/attachments/attachments.storage');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('uploadFile', () => {
    const TASK_ID = 'task-1';
    
    test('throws error if file size exceeds 10MB', async () => {
        const file = { size: 11 * 1024 * 1024, mimetype: 'image/png' };
        await expect(uploadFile(TASK_ID, file)).rejects.toThrow('File exceeds 10MB limit');
    });

    test('throws error if file type is not allowed', async () => {
        const file = { size: 1024, mimetype: 'application/x-msdownload' };
        await expect(uploadFile(TASK_ID, file)).rejects.toThrow('File type not allowed');
    });

    test('uploads file and returns path and signed URL', async () => {
        const file = { size: 1024, mimetype: 'image/png', originalname: 'test.png', buffer: Buffer.from('mock') };
        
        const storageMock = {
            upload: jest.fn().mockResolvedValue({ error: null }),
            createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://mock/url' } }),
        };
        
        supabase.storage = {
            from: jest.fn().mockReturnValue(storageMock),
        };

        const result = await uploadFile(TASK_ID, file);
        
        expect(supabase.storage.from).toHaveBeenCalledWith('task-attachments');
        expect(storageMock.upload).toHaveBeenCalledWith(
            expect.stringMatching(`^${TASK_ID}/\\d+-test\\.png$`),
            file.buffer,
            { contentType: file.mimetype }
        );
        expect(result.url).toBe('https://mock/url');
        expect(result.path).toMatch(new RegExp(`^${TASK_ID}/\\d+-test\\.png$`));
    });

    test('throws ApiError if upload fails', async () => {
        const file = { size: 1024, mimetype: 'image/png', originalname: 'test.png', buffer: Buffer.from('mock') };
        
        supabase.storage = {
            from: jest.fn().mockReturnValue({
                upload: jest.fn().mockResolvedValue({ error: { message: 'upload failed' } }),
            }),
        };

        await expect(uploadFile(TASK_ID, file)).rejects.toThrow('upload failed');
    });
});

describe('deleteFile', () => {
    test('calls supabase storage remove', async () => {
        const removeMock = jest.fn().mockResolvedValue({ error: null });
        supabase.storage = {
            from: jest.fn().mockReturnValue({ remove: removeMock }),
        };

        await deleteFile('path/to/file');
        
        expect(supabase.storage.from).toHaveBeenCalledWith('task-attachments');
        expect(removeMock).toHaveBeenCalledWith(['path/to/file']);
    });
});
