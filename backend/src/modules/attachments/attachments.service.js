const supabase = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { uploadFile, deleteFile } = require('./attachments.storage');

async function addAttachment(taskId, uploaderId, file) {
    const { path, url } = await uploadFile(taskId, file);
    const { data, error } = await supabase
        .from('Attachments')
        .insert({ task_id: taskId, uploaded_by: uploaderId, file_name: file.originalname, file_url: url })
        .select().single();
    if (error) { await deleteFile(path); throw new ApiError(400, error.message); }
    return data;
}

async function listAttachments(taskId) {
    const { data, error } = await supabase.from('Attachments').select('*').eq('task_id', taskId);
    if (error) throw new ApiError(400, error.message);
    return data;
}

async function removeAttachment(attachmentId) {
    const { data: attachment } = await supabase.from('Attachments').select('file_url').eq('id', attachmentId).single();
    if (!attachment) throw new ApiError(404, 'Attachment not found');
    await supabase.from('Attachments').delete().eq('id', attachmentId);
}

module.exports = { addAttachment, listAttachments, removeAttachment };