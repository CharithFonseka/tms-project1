const PRIORITY_COLORS = { 
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
};
const NEXT_STATUS = { 'To Do': 'In Progress', 'In Progress': 'Completed', 'Completed': null };

export default function TaskCard({ task, users = [], onStatusChange, onDelete }) {
  const next = NEXT_STATUS[task.status];
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const assigneeList = (task.assignees || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);

  return (
    <div className="glass-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/50 hover:bg-slate-850/50 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col gap-3 group relative">
      
      {/* Priority and Delete Action */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
          {task.priority}
        </span>
        {onDelete && (
          <button 
            onClick={() => onDelete(task)} 
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Task Title */}
      <div>
        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {task.title}
        </h3>
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1">
        {/* Due Date */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Due {task.due_date}</span>
        </div>

        {/* Assignees Avatars */}
        {assigneeList.length > 0 && (
          <div className="flex -space-x-1.5 overflow-hidden">
            {assigneeList.slice(0, 3).map((u) => (
              <span 
                key={u.id} 
                className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-300 ring-1 ring-slate-950 uppercase" 
                title={`${u.name} (${u.role})`}
              >
                {getInitials(u.name)}
              </span>
            ))}
            {assigneeList.length > 3 && (
              <span className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400 ring-1 ring-slate-950">
                +{assigneeList.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Next Status Quick action (shows on hover) */}
      {next && (
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur pl-2 py-0.5 rounded">
          <button 
            onClick={() => onStatusChange(task.id, next)}
            className="flex items-center gap-0.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Move to {next}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
}

