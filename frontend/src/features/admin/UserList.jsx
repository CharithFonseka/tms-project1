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
    const [editingUser, setEditingUser] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [newlyCreatedUser, setNewlyCreatedUser] = useState(null);
    const [triggerRefetch, setTriggerRefetch] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            listUsersRequest({ search, role, page, limit: 10 }).then((res) => {
                setUsers(res.data);
                setTotal(res.total);
            });
        }, 300); // debounce search input
        return () => clearTimeout(timeout);
    }, [search, role, page, triggerRefetch]);

    async function handleConfirmDeactivate() {
        await deactivateUserRequest(confirmTarget.id);
        setConfirmTarget(null);
        setTriggerRefetch(t => t + 1);
    }

    return (
        <div style={{ padding: '32px' }} className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h1 className="text-2xl font-bold gradient-text">Manage Users</h1>
                <Button onClick={() => setShowCreate(true)}>+ Add User</Button>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <input
                        placeholder="Search name or email"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input-modern"
                        style={{ maxWidth: '300px' }}
                    />
                    <select 
                        value={role} 
                        onChange={(e) => { setRole(e.target.value); setPage(1); }} 
                        className="input-modern"
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="">All roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Collaborator">Collaborator</option>
                    </select>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Email</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Role</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Status</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500' }}>Actions</th>
                                <th style={{ padding: '12px 16px', fontWeight: '500', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{u.name}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '600' }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '500', color: u.is_active ? 'var(--success)' : 'var(--text-secondary)' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.is_active ? 'var(--success)' : 'var(--text-secondary)' }}></span>
                                            {u.is_active ? 'Active' : 'Deactivated'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {u.is_active && (
                                            <button 
                                                onClick={() => setConfirmTarget(u)}
                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => setEditingUser(u)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary" style={{ padding: '6px 12px' }}>Previous</button>
                    <span>Page {page} of {Math.ceil(total / 10) || 1}</span>
                    <button disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)} className="btn-secondary" style={{ padding: '6px 12px' }}>Next</button>
                </div>
            </div>
            
            <Modal open={showCreate || !!editingUser} onClose={() => { setShowCreate(false); setEditingUser(null); }} title={editingUser ? "Edit User" : "Add User"}>
                <UserForm 
                    existingUser={editingUser}
                    onSuccess={(user) => { 
                        setShowCreate(false); 
                        setEditingUser(null);
                        setTriggerRefetch(t => t + 1); 
                        if (!editingUser) {
                            setPage(1); 
                        }
                        if (user && user.tempPassword) {
                            setNewlyCreatedUser(user);
                        }
                    }} 
                />
            </Modal>
            
            <Modal open={!!newlyCreatedUser} onClose={() => setNewlyCreatedUser(null)} title="User Created Successfully!">
                <div style={{ marginBottom: '24px' }}>
                    <p className="text-secondary" style={{ marginBottom: '16px' }}>
                        The new user <strong>{newlyCreatedUser?.name}</strong> has been created. 
                        Since the email server is not fully configured, please copy and securely share this temporary password with them so they can log in:
                    </p>
                    <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '8px', textAlign: 'center' }}>
                        <code style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            {newlyCreatedUser?.tempPassword}
                        </code>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setNewlyCreatedUser(null)}>Done</Button>
                </div>
            </Modal>

            <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Deactivate user?">
                <p className="text-secondary" style={{ marginBottom: '24px' }}>
                    {confirmTarget?.name} will no longer be able to log in. This can be reversed later by an Admin.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => setConfirmTarget(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDeactivate}>Confirm Deactivation</Button>
                </div>
            </Modal>
        </div>
    );
}