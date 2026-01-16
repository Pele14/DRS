import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../context/authcontext';
import { course_api } from '../api_services/courseservices'; 
import { initialCourseState } from '../models/courseModel';

function CourseManager() {
    const { courses, myCourses, createCourse, loadMyCourses } = useCourses();
    const { user } = useAuth();
    const [newCourse, setNewCourse] = useState(initialCourseState);
    

    const [enrolledCourses, setEnrolledCourses] = useState([]);

    useEffect(() => {
        if (user?.role === 'profesor') {
            loadMyCourses();
        }
 
        if (user?.role === 'student') {
            loadStudentCourses();
        }
    }, [user, loadMyCourses]);

    const loadStudentCourses = async () => {
        try {
            const res = await course_api.getStudentCourses();
            setEnrolledCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await createCourse(newCourse);
        if (res.success) {
            alert("Zahtev za kurs je poslat administratoru!");
            setNewCourse(initialCourseState);
        }
    };

    // --- PRIKAZ ZA STUDENTA ---
    if (user?.role === 'student') {
        return (
            <div style={{ marginTop: '20px' }}>
                <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#0056b3' }}>
                    Moji Upisani Kursevi
                </h2>
                
                {enrolledCourses.length === 0 ? (
                    <p style={{fontStyle: 'italic', color: '#666'}}>
                        Trenutno niste upisani ni na jedan kurs. Sačekajte da vas profesor doda.
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {enrolledCourses.map(course => (
                            <div key={course.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white', borderLeft: '5px solid #007bff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                <Link to={`/course/${course.id}`} style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#0056b3', textDecoration: 'none' }}>
                                    {course.title}
                                </Link>
                                <p style={{ color: '#666', fontSize: '0.9em' }}>{course.description.substring(0, 80)}...</p>
                                <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>Prof. {course.professor}</small>
                                
                                {/* Prikaz ocene ako postoji */}
                                {course.students && course.students.find(s => s.id === user.id)?.grade && (
                                    <div style={{marginTop: '10px', fontWeight: 'bold', color: 'green'}}>
                                        OCENA: {course.students.find(s => s.id === user.id).grade}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }


    return (
        <div style={{ marginTop: '20px' }}>
            
            {/* SEKCIJA ZA PROFESORA (Kreiranje) */}
            {user?.role === 'profesor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                    {/* LEVO: Forma */}
                    <div style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#f0fff4' }}>
                        <h3 style={{ marginTop: 0, color: '#155724' }}>Kreiraj Novi Kurs</h3>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input placeholder="Naziv kursa" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required style={{ padding: '8px' }}/>
                            <textarea placeholder="Opis" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required style={{ padding: '8px', minHeight: '80px' }}/>
                            <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>POŠALJI ZAHTEV</button>
                        </form>
                    </div>

                    {/* DESNO: Status mojih kurseva */}
                    <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                        <h3 style={{ marginTop: 0, color: '#004085' }}>Kursevi koje predajem</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {myCourses.map(c => (
                                <li key={c.id} style={{ padding: '10px', borderBottom: '1px solid #cce5ff', display: 'flex', justifyContent: 'space-between' }}>
                                    <Link to={`/course/${c.id}`} style={{fontWeight: 'bold', textDecoration: 'none'}}>{c.title}</Link>
                                    <span style={{ fontSize: '0.8em', padding: '2px 6px', borderRadius: '4px', backgroundColor: c.status === 'approved' ? '#d4edda' : '#fff3cd' }}>{c.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* JAVNI KATALOG (Samo za Profesora i Admina) */}
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Katalog Svih Kurseva</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {courses.filter(course => course.status === 'approved').map(course => (
                    <div key={course.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
                        <Link to={`/course/${course.id}`} style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#0056b3', textDecoration: 'none' }}>
                            {course.title}
                        </Link>
                        <p style={{ color: '#666', fontSize: '0.9em' }}>{course.description.substring(0, 80)}...</p>
                        <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>Prof. {course.professor}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CourseManager;