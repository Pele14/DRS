import { useState, useEffect } from 'react';
import { user_api } from '../api_services/userservice';

function UserList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);


    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await user_api.getAll();
            setUsers(res.data);
        } catch (err) {
            setError("Neuspešno učitavanje korisnika.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Da li ste sigurni da želite da obrišete ovog korisnika?")) return;

        try {
            await user_api.deleteUser(id);
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            alert("Greška pri brisanju: " + (err.response?.data?.error || "Greška"));
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: '#1F2937' }}>Lista svih korisnika</h3>
            {error && <div className="alert alert-error">{error}</div>}
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ime i Prezime</th>
                        <th>Email</th>
                        <th>Uloga</th>
                        <th style={{ textAlign: 'center' }}>Akcija</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ fontWeight: '600', color: '#6B7280' }}>#{user.id}</td>
                            <td style={{ fontWeight: '500' }}>{user.first_name} {user.last_name}</td>
                            <td style={{ color: '#6B7280' }}>{user.email}</td>
                            <td>
                                <span className={
                                  user.role === 'admin' ? 'badge-danger' : 
                                  user.role === 'profesor' ? 'badge-warning' : 
                                  'badge-primary'
                                }>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="btn-danger"
                                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                >
                                    🗑️ Obriši
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;