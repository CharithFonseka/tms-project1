import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTaskRequest } from '../../api/tasksApi';
import { listUsersRequest } from '../../api/usersApi';
import { useEffect, useState, useRef } from 'react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
  assignees: z.array(z.string()).min(1, 'Select at least one assignee'),
});

export default function TaskForm({ onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'Medium', assignees: [] },
  });

  const selectedAssignees = watch('assignees') || [];

  useEffect(() => {
    listUsersRequest({}).then((res) => setUsers(res.data));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleAssignee(id) {
    setValue(
      'assignees', 
      selectedAssignees.includes(id) 
        ? selectedAssignees.filter((a) => a !== id) 
        : [...selectedAssignees, id],
      { shouldValidate: true }
    );
  }

  async function onSubmit(values) {
    try {
      await createTaskRequest(values);
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-visible flex flex-col gap-5 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Task
          </h2>
          <p className="text-xs text-slate-400 mt-1">Fill in the details to add a task to the board.</p>
        </div>

        {/* Task Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
          <input 
            id="title"
            {...register('title')} 
            placeholder="e.g., Design user flow mockups" 
            className="w-full bg-slate-950/65 border border-slate-800/80 text-slate-200 placeholder-slate-600 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" 
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1.5">{errors.title.message}</p>}
        </div>

        {/* Date and Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
            <input 
              id="due_date"
              type="date" 
              {...register('due_date')} 
              className="w-full bg-slate-950/65 border border-slate-800/80 text-slate-200 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" 
            />
            {errors.due_date && <p className="text-xs text-rose-500 mt-1.5">{errors.due_date.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
            <div className="relative">
              <select 
                id="priority"
                {...register('priority')} 
                className="w-full bg-slate-950/65 border border-slate-800/80 text-slate-200 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Custom Assignee Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assignees</label>
          
          {/* Dropdown Trigger */}
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full min-h-[44px] bg-slate-950/65 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-2 flex flex-wrap gap-1.5 items-center cursor-pointer select-none transition-colors"
          >
            {selectedAssignees.length === 0 ? (
              <span className="text-slate-500 text-sm pl-1.5">Select assignees...</span>
            ) : (
              selectedAssignees.map((id) => {
                const user = users.find((u) => u.id === id);
                if (!user) return null;
                return (
                  <span 
                    key={id} 
                    className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/50 rounded-full pl-1.5 pr-2.5 py-1 text-xs text-slate-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAssignee(id);
                    }}
                  >
                    <span className="w-4 h-4 rounded-full bg-indigo-600/35 border border-indigo-500/30 text-[9px] font-bold text-indigo-300 flex items-center justify-center">
                      {getInitials(user.name)}
                    </span>
                    {user.name}
                    <span className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5 text-[10px]">✕</span>
                  </span>
                );
              })
            )}
            <span className="ml-auto pr-1 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          
          {errors.assignees && <p className="text-xs text-rose-500 mt-1.5">{errors.assignees.message}</p>}

          {/* Dropdown Options */}
          {dropdownOpen && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-950 border border-slate-800/90 rounded-xl shadow-2xl max-h-52 overflow-y-auto p-1.5 animate-fade-in">
              {users.length === 0 ? (
                <p className="text-xs text-slate-500 p-3 text-center">No users available.</p>
              ) : (
                users.map((u) => {
                  const isChecked = selectedAssignees.includes(u.id);
                  return (
                    <div 
                      key={u.id}
                      onClick={() => toggleAssignee(u.id)}
                      className="flex items-center justify-between gap-2.5 px-3 py-2 hover:bg-slate-850 rounded-lg cursor-pointer transition-colors text-sm text-slate-300 hover:text-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                          {getInitials(u.name)}
                        </span>
                        <div>
                          <p className="font-medium text-slate-200">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.role}</p>
                        </div>
                      </div>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-slate-700 bg-slate-900'}`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/60">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 border-0 rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
