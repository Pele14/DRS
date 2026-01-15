import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../context/authcontext';
import { initialCourseState } from '../models/courseModel';

function CourseManager() {
    // Izvlačimo podatke i funkcije iz našeg Hook-a
    const { courses, myCourses, createCourse, loadMyCourses } = useCourses();
    const { user } = useAuth();
    const [newCourse, setNewCourse] = useState(initialCourseState);

    // Osiguravamo da se 'Moji Kursevi' učitaju kada se komponenta prikaže
    useEffect(() => {
        if (user?.role === 'profesor') {
            loadMyCourses();
        }
    }, [user, loadMyCourses]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await createCourse(newCourse);
        if (res.success) {
            alert("Zahtev za kurs je poslat administratoru!");
            setNewCourse(initialCourseState);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            
            {/* --- SEKCIJA ZA PROFESORA --- */}
            {user?.role === 'profesor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                    
                    {/* LEVO: Forma za kreiranje */}
                    <div style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#f0fff4' }}>
                        <h3 style={{ marginTop: 0, color: '#155724' }}>Kreiraj Novi Kurs</h3>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input 
                                placeholder="Naziv kursa" 
                                value={newCourse.title} 
                                onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                                required 
                                style={{ padding: '8px' }}
                            />
                            <textarea 
                                placeholder="Opis i ciljevi kursa" 
                                value={newCourse.description} 
                                onChange={e => setNewCourse({...newCourse, description: e.target.value})} 
                                required 
                                style={{ padding: '8px', minHeight: '80px' }}
                            />
                            <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                POŠALJI ZAHTEV
                            </button>
                        </form>
                    </div>

                    {/* DESNO: Lista MOJIH kurseva (Status Dashboard) */}
                    <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                        <h3 style={{ marginTop: 0, color: '#004085' }}>Moji Kursevi (Status)</h3>
                        {myCourses.length === 0 ? <p>Nemate kreiranih kurseva.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {myCourses.map(c => (
                                    <li key={c.id} style={{ padding: '10px', borderBottom: '1px solid #cce5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>{c.title}</span>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '10px', fontSize: '0.8em',
                                            backgroundColor: c.status === 'approved' ? '#d4edda' : '#fff3cd',
                                            color: c.status === 'approved' ? '#155724' : '#856404',
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }}>
                                            {c.status === 'approved' ? 'ODOBREN' : 'NA ČEKANJU'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* --- JAVNA LISTA (KATALOG) --- */}
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Katalog Svih Kurseva</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {/* OVDE JE PROMENA: Dodali smo .filter() */}
                {courses
                    .filter(course => course.status === 'approved') 
                    .map(course => (
                        <div key={course.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Link to={`/course/${course.id}`} style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#0056b3', textDecoration: 'none' }}>
                                    {course.title}
                                </Link>
                                
                                {user?.id === course.professor_id && (
                                    <span style={{ fontSize: '0.7em', backgroundColor: '#e2e3e5', padding: '2px 5px', borderRadius: '4px' }}>MOJ KURS</span>
                                )}
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9em' }}>{course.description.substring(0, 80)}...</p>
                            <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>Prof. {course.professor}</small>
                        </div>
                ))}
                
                {courses.filter(c => c.status === 'approved').length === 0 && (
                    <p style={{ color: '#888' }}>Trenutno nema aktivnih kurseva u katalogu.</p>
                )}
            </div>
        </div>
    );
}

export default CourseManager;