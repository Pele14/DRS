import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { course_api } from '../api_services/courseservices';

function CourseDetailsPage() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Ovde ručno zovemo API jer nam treba samo JEDAN kurs
        course_api.getById(id)
            .then(res => setCourse(res.data))
            .catch(() => {
                alert("Kurs nije pronađen");
                navigate('/');
            });
    }, [id, navigate]);

    if (!course) return <div style={{ padding: '20px' }}>Učitavanje detalja...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '20px', cursor: 'pointer', padding: '5px 10px' }}>
                &larr; Nazad
            </button>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '30px', backgroundColor: 'white' }}>
                <h1 style={{ marginTop: 0 }}>{course.title}</h1>
                <p style={{ color: '#555', fontStyle: 'italic' }}>Predavač: {course.professor}</p>
                
                <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                    <h3>O kursu</h3>
                    <p>{course.description}</p>
                </div>

                {/* Sekcija za fajlove (kasnije ćemo dodati upload ovde) */}
                <div style={{ marginTop: '30px' }}>
                    <h3>Materijali za učenje (PDF)</h3>
                    <p style={{ color: '#888' }}>Nema postavljenih materijala.</p>
                </div>
            </div>
        </div>
    );
}

export default CourseDetailsPage;