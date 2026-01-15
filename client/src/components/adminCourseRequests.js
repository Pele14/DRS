import { useState, useEffect } from 'react';
import { course_api } from '../api_services/courseservices';

function AdminCourseRequests() {
    const [requests, setRequests] = useState([]);

    const loadRequests = async () => {
        try {
            const res = await course_api.getAll();
            // Filtriramo samo one koji čekaju
            const pending = res.data.filter(c => c.status === 'pending');
            setRequests(pending);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleDecision = async (id, status) => {
        try {
            await course_api.updateStatus(id, status);
            alert(status === 'approved' ? "Kurs odobren!" : "Kurs odbijen!");
            loadRequests(); // Osveži listu
        } catch (err) {
            alert("Greška pri ažuriranju statusa.");
        }
    };

    if (requests.length === 0) return <p>Nema novih zahteva za kurseve.</p>;

    return (
        <div style={{ marginTop: '20px' }}>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff3cd' }}>
                <thead>
                    <tr>
                        <th>Naziv Kursa</th>
                        <th>Profesor</th>
                        <th>Akcija</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id}>
                            <td>{req.title}</td>
                            <td>{req.professor}</td>
                            <td>
                                <button 
                                    onClick={() => handleDecision(req.id, 'approved')}
                                    style={{ marginRight: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    Prihvati
                                </button>
                                <button 
                                    onClick={() => handleDecision(req.id, 'rejected')}
                                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    Odbij
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminCourseRequests;