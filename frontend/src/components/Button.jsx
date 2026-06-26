/**
 * Button — design.md component spec
 *
 * variant="primary"   → Notion Blue pill  (.btn-primary)
 * variant="secondary" → White pill with soft shadow  (.btn-secondary)
 * variant="utility"   → White, 8px radius, hairline border  (.btn-utility)
 * variant="danger"    → Red, 8px radius, destructive actions  (.btn-danger)
 */
export default function Button({ variant = 'primary', className = '', children, ...props }) {
    const cls = {
        primary:   'btn-primary',
        secondary: 'btn-secondary',
        utility:   'btn-utility',
        danger:    'btn-danger',
    };

    return (
        <button
            {...props}
            className={`${cls[variant] ?? 'btn-utility'} ${className}`}
        >
            {children}
        </button>
    );
}