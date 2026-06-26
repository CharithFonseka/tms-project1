const supabase = require('../../config/db');
const ApiError = require('../../utils/ApiError');

async function createProject(userId, { name, description }) {
  const { data, error } = await supabase
    .from('Projects')
    .insert({ name, description, created_by: userId })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

async function listProjects(userId, userRole) {
  let query = supabase.from('Projects').select('*').order('created_at', { ascending: false });
  // If the user is a PM, they see projects they own
  if (userRole === 'Project Manager') {
    query = query.eq('created_by', userId);
  }
  // If collaborator, they shouldn't generally be fetching the whole list, but we allow it or scope it. 
  // In a full RBAC, Collaborators would only see projects they have tasks in. 
  // We'll return everything the query allows for now, Supabase RLS would restrict ideally.
  
  const { data, error } = await query;
  if (error) throw new ApiError(400, error.message);
  return data;
}

async function getProjectById(projectId) {
  const { data, error } = await supabase
    .from('Projects')
    .select('*')
    .eq('id', projectId)
    .single();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'Project not found');
  return data;
}

async function updateProject(projectId, updates) {
  const { data, error } = await supabase
    .from('Projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'Project not found');
  return data;
}

async function deleteProject(projectId) {
  const { error } = await supabase
    .from('Projects')
    .delete()
    .eq('id', projectId);
  if (error) throw new ApiError(400, error.message);
}

module.exports = { createProject, listProjects, getProjectById, updateProject, deleteProject };
