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
            <h3>Lista svih korisnika</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>ID</th>
                        <th>Ime i Prezime</th>
                        <th>Email</th>
                        <th>Uloga</th>
                        <th>Akcija</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.first_name} {user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    Obriši
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