/**
 * Modal — design.md ex-modal-card spec
 * card-elevated surface (rounded-xl + elevated shadow).
 * X close button top-right; title in card-title weight.
 */
export default function Modal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="card-elevated"
                style={{ width: '100%', maxWidth: 480, position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 20,
                    }}
                >
                    <h2 className="text-card-title">{title}</h2>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        id="modal-close-btn"
                        aria-label="Close"
                        style={{ flexShrink: 0 }}
                    >
                        {/* ✕ icon */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M13 1 1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
