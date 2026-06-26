export default function TaskFilters({ filters, onChange }) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}
        >
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                {/* Magnifier icon */}
                <svg
                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                    style={{
                        position: 'absolute', left: 10, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--color-ink-faint)',
                        pointerEvents: 'none',
                    }}
                >
                    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                    id="task-search"
                    placeholder="Search tasks…"
                    value={filters.search}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="input-field"
                    style={{ paddingLeft: 32 }}
                />
            </div>

            {/* Status filter */}
            <select
                id="task-filter-status"
                value={filters.status}
                onChange={(e) => onChange({ ...filters, status: e.target.value })}
                className="input-field"
                style={{ flex: '0 1 160px', width: 'auto' }}
            >
                <option value="">All statuses</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
            </select>

            {/* Priority filter */}
            <select
                id="task-filter-priority"
                value={filters.priority}
                onChange={(e) => onChange({ ...filters, priority: e.target.value })}
                className="input-field"
                style={{ flex: '0 1 160px', width: 'auto' }}
            >
                <option value="">All priorities</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
            </select>
        </div>
    );
}


