import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { course_api } from '../api_services/courseservices';
import { useAuth } from '../context/authcontext';

function CourseDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '' });
    const [studentEmail, setStudentEmail] = useState('');

    const loadCourse = useCallback(() => {
        course_api.getById(id)
            .then(res => {
                setCourse(res.data);
                setEditData({ title: res.data.title, description: res.data.description });
            })
            .catch(() => navigate('/'));
    }, [id, navigate]);

    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    // 1. ČUVANJE IZMENA
    const handleUpdate = async () => {
        try {
            await course_api.updateDetails(id, editData);
            setIsEditing(false);
            loadCourse();
        } catch (e) { alert("Greška pri izmeni"); }
    };

    // 2. UPLOAD PDF-a
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await course_api.uploadMaterial(id, formData);
            alert("Fajl uspešno postavljen!");
            loadCourse();
        } catch (e) { alert("Greška pri uploadu"); }
    };

    // 3. DODAVANJE STUDENTA
    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await course_api.addStudent(id, studentEmail);
            alert(`Student ${res.data.student} dodat!`);
            setStudentEmail('');
            loadCourse();
        } catch (err) {
            alert("Greška: " + (err.response?.data?.error || "Nepoznata greška"));
        }
    };

    if (!course) return <div>Učitavanje...</div>;

    const isProfessor = user?.id === course.professor_id;

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')}>&larr; Nazad</button>

            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '30px', borderRadius: '10px' }}>
                
                {/* --- HEADER KURSA --- */}
                {isEditing ? (
                    <div>
                        <input value={editData.title} onChange={e=>setEditData({...editData, title: e.target.value})} style={{width: '100%', fontSize: '1.5em', marginBottom: '10px'}} />
                        <textarea value={editData.description} onChange={e=>setEditData({...editData, description: e.target.value})} style={{width: '100%', height: '100px'}} />
                        <button onClick={handleUpdate} style={{backgroundColor: 'green', color: 'white', marginRight: '10px'}}>Sačuvaj</button>
                        <button onClick={()=>setIsEditing(false)}>Otkaži</button>
                    </div>
                ) : (
                    <div>
                        <h1>{course.title}</h1>
                        {isProfessor && <button onClick={()=>setIsEditing(true)} style={{fontSize: '0.8em'}}>✏️ Izmeni podatke</button>}
                        <p>Profesor: {course.professor}</p>
                        <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px'}}>{course.description}</div>
                    </div>
                )}

                <hr />

                {/* --- MATERIJALI (PDF) --- */}
                <h3>📚 Materijali</h3>
                {course.material_link ? (
                    <div>
                        <a href={course_api.getDownloadUrl(course.material_link)} target="_blank" rel="noreferrer" style={{color: 'blue', textDecoration: 'underline'}}>
                            📄 Preuzmi materijal za učenje (PDF)
                        </a>
                        {isProfessor && <p style={{fontSize: '0.8em', color: 'orange'}}>Ako otpremite novi fajl, stari će biti zamenjen.</p>}
                    </div>
                ) : <p>Nema materijala.</p>}

                {isProfessor && (
                    <div style={{marginTop: '10px'}}>
                        <label>Dodaj/Zameni PDF: </label>
                        <input type="file" accept="application/pdf" onChange={handleUpload} />
                    </div>
                )}

                <hr />

                {/* --- STUDENTI --- */}
                <h3>🎓 Upisani Studenti</h3>
                <ul>
                    {course.students && course.students.map(s => (
                        <li key={s.id}>{s.name} ({s.email})</li>
                    ))}
                    {course.students.length === 0 && <li>Nema upisanih studenata.</li>}
                </ul>

                {isProfessor && (
                    <div style={{backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px', marginTop: '15px'}}>
                        <h4>Dodaj studenta na kurs</h4>
                        <form onSubmit={handleAddStudent} style={{display: 'flex', gap: '10px'}}>
                            <input 
                                placeholder="Email studenta" 
                                value={studentEmail} 
                                onChange={e => setStudentEmail(e.target.value)}
                                style={{flex: 1, padding: '5px'}}
                                required
                            />
                            <button type="submit">Dodaj</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CourseDetailsPage;