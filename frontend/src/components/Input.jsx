export default function Input({ label, error, className = '', ...props }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            {label && <label htmlFor={props.id} className="text-sm font-medium text-secondary" style={{ display: 'block', marginBottom: '8px' }}>{label}</label>}
            <input {...props} className={`input-modern ${className}`} />
            {error && <p className="text-sm text-danger" style={{ marginTop: '4px' }}>{error}</p>}
        </div>
    );
}