export default function TaskFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md">
      
      {/* Left controls: search & status & priority */}
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Search */}
        <div className="relative flex-1 max-w-sm min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg text-sm transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>

        {/* Status */}
        <div className="relative min-w-[130px]">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full pl-3 pr-8 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-lg text-sm transition-all duration-200 outline-none cursor-pointer appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">All statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Priority */}
        <div className="relative min-w-[130px]">
          <select
            value={filters.priority}
            onChange={(e) => onChange({ ...filters, priority: e.target.value })}
            className="w-full pl-3 pr-8 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-lg text-sm transition-all duration-200 outline-none cursor-pointer appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Right controls: Sorting and View toggle */}
      <div className="flex items-center gap-3">
        {/* Sort Select */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">Sort</span>
          <div className="relative min-w-[120px]">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
              className="w-full pl-3 pr-8 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-lg text-sm transition-all duration-200 outline-none cursor-pointer appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="w-9 h-9 bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg flex items-center justify-center hover:border-slate-700 transition-colors"
            title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {filters.sortOrder === 'asc' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-950/65 border border-slate-800/80 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onChange({ ...filters, viewMode: 'board' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filters.viewMode === 'board' ? 'bg-indigo-600/90 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Board
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, viewMode: 'table' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filters.viewMode === 'table' ? 'bg-indigo-600/90 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table
          </button>
        </div>
      </div>

    </div>
  );
}


