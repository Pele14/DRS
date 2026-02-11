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

    if (requests.length === 0) return (
      <p style={{ 
        fontStyle: 'italic', 
        color: '#6B7280',
        padding: '20px',
        textAlign: 'center',
        background: '#F9FAFB',
        borderRadius: '8px'
      }}>
        ✅ Nema novih zahteva za kurseve.
      </p>
    );

    return (
        <div style={{ marginTop: '20px' }}>
            <table>
                <thead>
                    <tr>
                        <th>Naziv Kursa</th>
                        <th>Profesor</th>
                        <th style={{ textAlign: 'center' }}>Akcija</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id} style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)' }}>
                            <td style={{ fontWeight: '600', color: '#1F2937' }}>{req.title}</td>
                            <td style={{ color: '#6B7280' }}>{req.professor}</td>
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => handleDecision(req.id, 'approved')}
                                        className="btn-success"
                                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                    >
                                        ✅ Prihvati
                                    </button>
                                    <button 
                                        onClick={() => handleDecision(req.id, 'rejected')}
                                        className="btn-danger"
                                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                    >
                                        ❌ Odbij
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminCourseRequests;