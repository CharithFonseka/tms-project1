/**
 * Alert — design.md ex-toast spec
 * Left-border accent + semantic tint background.
 * variant="error"   → red
 * variant="success" → green
 * variant="info"    → primary blue
 */
const ICONS = {
    error:   '✕',
    success: '✓',
    info:    'ℹ',
};

export default function Alert({ variant = 'error', children }) {
    return (
        <div className={`alert alert-${variant}`}>
            <span style={{ flexShrink: 0, fontWeight: 600 }}>{ICONS[variant]}</span>
            <span>{children}</span>
        </div>
    );
}