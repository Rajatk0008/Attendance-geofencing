import React, { useState, useEffect } from 'react';

const UpdateUserForm = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '' });

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSelectChange = (e) => {
        const id = e.target.value;
        setSelectedUserId(id);
        const selectedUser = users.find(u => u.id === id);
        if (selectedUser) {
            setFormData({ name: selectedUser.name || '', email: selectedUser.email || '' });
        } else {
            setFormData({ name: '', email: '' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!selectedUserId) return alert('Please select a user.');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/update-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: selectedUserId,
                    ...formData
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                alert('✅ User updated');
                fetchUsers();
            } else {
                alert(data.message || '❌ Update failed');
            }
        } catch (err) {
            alert('Server error');
        }
    };

    return (
        <div style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '8px',
            minWidth: '300px',
            maxWidth: '400px'
        }}>
            <h3>✏️ Update User</h3>

            <select value={selectedUserId} onChange={handleSelectChange} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
                <option value="">Select user by ID</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.id} - {user.name} ({user.email})
                    </option>
                ))}
            </select>

            {selectedUserId && (
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                    />
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                    />
                    <button onClick={handleUpdate} style={{ padding: '0.5rem 1rem' }}>Update</button>
                </div>
            )}
        </div>
    );
};

export default UpdateUserForm;
