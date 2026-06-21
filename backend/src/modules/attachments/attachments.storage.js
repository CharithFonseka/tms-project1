const supabase = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const BUCKET = 'task-attachments';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

async function uploadFile(taskId, file) {
    if (file.size > MAX_SIZE_BYTES) throw new ApiError(400, 'File exceeds 10MB limit');
    if (!ALLOWED_TYPES.includes(file.mimetype)) throw new ApiError(400, 'File type not allowed');

    const path = `${taskId}/${Date.now()}-${file.originalname}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
    if (error) throw new ApiError(400, error.message);

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    return { path, url: signed.signedUrl };
}

async function deleteFile(path) {
    await supabase.storage.from(BUCKET).remove([path]);
}

module.exports = { uploadFile, deleteFile };