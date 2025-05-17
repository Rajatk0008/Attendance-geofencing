import React, { useState, useEffect } from 'react';

const UpdateAttendanceForm = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
    const [punchIn, setPunchIn] = useState('');
    const [punchOut, setPunchOut] = useState('');

    useEffect(() => {
        // Fetch user list for dropdown
        const fetchUsers = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        };
        fetchUsers();
    }, []);

    const handleSubmit = async () => {
        if (!selectedUserId) return alert('Select a user');
        if (!date) return alert('Select a date');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/punchupdate`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: selectedUserId,
                    date,
                    punch_in: punchIn || null,
                    punch_out: punchOut || null,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                alert('✅ Attendance updated');
                
            } else {
                alert(data.message || '❌ Update failed');
            }
        } catch (err) {
            alert('Server error');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8, maxWidth: 400 }}>
            <h3>🕒 Update Punch In/Out</h3>

            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
                <option value="">Select User</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                    </option>
                ))}
            </select>

            <label>Date:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

            <label>Punch In Time:</label>
            <input
                type="time"
                value={punchIn}
                onChange={e => setPunchIn(e.target.value)}
                style={{ width: '100%', marginBottom: '1rem' }}
            />

            <label>Punch Out Time:</label>
            <input
                type="time"
                value={punchOut}
                onChange={e => setPunchOut(e.target.value)}
                style={{ width: '100%', marginBottom: '1rem' }}
            />

            <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>
                Update Attendance
            </button>
        </div>
    );
};

export default UpdateAttendanceForm;
