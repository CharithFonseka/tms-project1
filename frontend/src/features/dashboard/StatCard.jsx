export default function StatCard({ title, value, icon, color = 'indigo' }) {
    const colors = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };
    
    return (
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border bg-slate-900/35 border-slate-800/80 hover:border-slate-700/80 transition-colors shadow-lg">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border bg-opacity-10 ${colors[color] || colors.indigo}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <p className="text-3xl font-extrabold text-slate-100 leading-tight">{value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{title}</p>
            </div>
        </div>
    );
}
