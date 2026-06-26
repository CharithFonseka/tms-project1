/**
 * Input — design.md text-input spec
 * White surface, #ddd border, 4px radius, Inter 15px/400.
 * Focus: primary blue ring + box-shadow.
 */
export default function Input({ label, error, id, className = '', ...props }) {
    return (
        <div style={{ marginBottom: 12 }}>
            {label && (
                <label htmlFor={id} className="field-label">
                    {label}
                </label>
            )}
            <input
                id={id}
                {...props}
                className={`input-field${error ? ' input-error' : ''} ${className}`}
            />
            {error && <p className="field-error">{error}</p>}
        </div>
    );
}