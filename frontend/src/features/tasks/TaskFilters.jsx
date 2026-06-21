export default function TaskFilters({ filters, onChange }) {
  return (
    <div className="flex gap-3">
      <input
        placeholder="Search tasks"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      />
      <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        <option>To Do</option><option>In Progress</option><option>Completed</option>
      </select>
      <select value={filters.priority} onChange={(e) => onChange({ ...filters, priority: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm">
        <option value="">All priorities</option>
        <option>Low</option><option>Medium</option><option>High</option>
      </select>
    </div>
  );
}
