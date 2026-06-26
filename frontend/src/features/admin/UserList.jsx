import { useEffect, useState } from 'react';
import { listUsersRequest, deactivateUserRequest } from '../../api/usersApi';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import UserForm from './UserForm';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [newlyCreatedUser, setNewlyCreatedUser] = useState(null);
    const [triggerRefetch, setTriggerRefetch] = useState(0);

    const LIMIT = 10;

    useEffect(() => {
        const timeout = setTimeout(() => {
            listUsersRequest({ search, role, page, limit: LIMIT }).then((res) => {
                setUsers(res.data);
                setTotal(res.total);
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, role, page, triggerRefetch]);

    async function handleConfirmDeactivate() {
        await deactivateUserRequest(confirmTarget.id);
        setConfirmTarget(null);
        setPage((p) => p);
    }

    const totalPages = Math.ceil(total / LIMIT) || 1;

    return (
        <div>
            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-lg)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-sm)',
                }}
            >
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.625px', color: 'var(--color-ink)' }}>
                        Users
                    </h1>
                    <p className="text-caption" style={{ marginTop: 2 }}>
                        Manage team members and their access roles
                    </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>Add User</Button>
            </div>

            {/* Filters */}
            <div
                style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-lg)',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                    <svg
                        width="14" height="14" viewBox="0 0 16 16" fill="none"
                        style={{
                            position: 'absolute', left: 10, top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-ink-faint)', pointerEvents: 'none',
                        }}
                    >
                        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        id="user-search"
                        placeholder="Search name or email…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input-field"
                        style={{ paddingLeft: 32 }}
                    />
                </div>
                <select
                    id="user-filter-role"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setPage(1); }}
                    className="input-field"
                    style={{ flex: '0 1 180px', width: 'auto' }}
                >
                    <option value="">All roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Collaborator">Collaborator</option>
                </select>
            </div>

            {/* Users table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '32px 14px' }}>
                                    <span className="text-caption">No users found</span>
                                </td>
                            </tr>
                        )}
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{u.name}</span>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className="badge-pill" style={{ fontSize: 11 }}>{u.role}</span>
                                </td>
                                <td>
                                    <span className={`badge-pill ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                        {u.is_active ? 'Active' : 'Deactivated'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn-utility"
                                            style={{ fontSize: 12, padding: '3px 10px' }}
                                            onClick={() => setEditTarget(u)}
                                        >
                                            Edit
                                        </button>
                                        {u.is_active && (
                                            <Button
                                                variant="danger"
                                                style={{ fontSize: 12, padding: '3px 10px' }}
                                                onClick={() => setConfirmTarget(u)}
                                            >
                                                Deactivate
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginTop: 'var(--space-md)',
                    justifyContent: 'center',
                }}
            >
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn-utility"
                    style={{ fontSize: 13 }}
                >
                    ← Previous
                </button>
                <span className="text-caption">
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-utility"
                    style={{ fontSize: 13 }}
                >
                    Next →
                </button>
            </div>

            {/* Add / Edit user modal */}
            <Modal
                open={showCreate || !!editTarget}
                onClose={() => { setShowCreate(false); setEditTarget(null); }}
                title={editTarget ? 'Edit user' : 'Add user'}
            >
                <UserForm
                    existingUser={editTarget}
                    onSuccess={() => { setShowCreate(false); setEditTarget(null); setPage(1); }}
                />
            </Modal>

            {/* Deactivate confirmation modal */}
            <Modal
                open={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                title="Deactivate user?"
            >
                <p className="text-body-sm" style={{ marginBottom: 24 }}>
                    <strong>{confirmTarget?.name}</strong> will no longer be able to log in. An Admin can reactivate them later.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                    <Button variant="utility" onClick={() => setConfirmTarget(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDeactivate}>Confirm deactivate</Button>
                </div>
            </Modal>
        </div>
    );
}