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
                <h2 style={{ 
                  paddingBottom: '16px',
                  marginBottom: '32px',
                  color: '#1F2937',
                  borderBottom: '3px solid transparent',
                  borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1'
                }}>
                    🎓 Moji Upisani Kursevi
                </h2>
                
                {enrolledCourses.length === 0 ? (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      borderRadius: '12px',
                      border: '2px dashed rgba(102, 126, 234, 0.3)'
                    }}>
                        <p style={{fontStyle: 'italic', color: '#6B7280', fontSize: '1.1em', margin: 0}}>
                            Trenutno niste upisani ni na jedan kurs. Sačekajte da vas profesor doda.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-3" style={{ animation: 'fadeIn 0.6s ease' }}>
                        {enrolledCourses.map(course => (
                            <div key={course.id} className="card" style={{ 
                              borderLeft: '4px solid transparent',
                              borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                                <Link to={`/course/${course.id}`} style={{ 
                                  fontSize: '1.3em', 
                                  fontWeight: '700',
                                  color: '#1F2937',
                                  display: 'block',
                                  marginBottom: '12px'
                                }}>
                                    {course.title}
                                </Link>
                                <p style={{ color: '#6B7280', fontSize: '0.95em', lineHeight: '1.6' }}>
                                  {course.description.substring(0, 100)}...
                                </p>
                                <div style={{ 
                                  marginTop: '16px',
                                  paddingTop: '16px',
                                  borderTop: '1px solid #E5E7EB',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                    <small style={{ color: '#9CA3AF', fontWeight: '500' }}>
                                      👨‍🏫 {course.professor}
                                    </small>
                                    
                                    {/* Prikaz ocene ako postoji */}
                                    {course.students && course.students.find(s => s.id === user.id)?.grade && (
                                        <span className="badge-success">
                                            OCENA: {course.students.find(s => s.id === user.id).grade}
                                        </span>
                                    )}
                                </div>
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
                <div className="grid grid-2" style={{ marginBottom: '48px' }}>
                    {/* LEVO: Forma */}
                    <div className="card" style={{ 
                      borderTop: '4px solid transparent',
                      borderImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%) 1',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#065F46', marginBottom: '20px' }}>
                          ➕ Kreiraj Novi Kurs
                        </h3>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Naziv kursa</label>
                                <input 
                                  placeholder="Npr. Uvod u Python programiranje" 
                                  value={newCourse.title} 
                                  onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                                  required 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Opis kursa</label>
                                <textarea 
                                  placeholder="Opišite šta će studenti naučiti u ovom kursu..." 
                                  value={newCourse.description} 
                                  onChange={e => setNewCourse({...newCourse, description: e.target.value})} 
                                  required 
                                  style={{ minHeight: '120px' }}
                                />
                            </div>
                            <button type="submit" className="btn-success">
                              📤 POŠALJI ZAHTEV
                            </button>
                        </form>
                    </div>

                    {/* DESNO: Status mojih kurseva */}
                    <div className="card" style={{ 
                      borderTop: '4px solid transparent',
                      borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#4338CA', marginBottom: '20px' }}>
                          📚 Kursevi koje predajem
                        </h3>
                        {myCourses.length === 0 ? (
                          <p style={{ color: '#6B7280', fontStyle: 'italic' }}>
                            Još uvek nemate kreiranih kurseva.
                          </p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {myCourses.map(c => (
                                  <li key={c.id} style={{ 
                                    padding: '14px', 
                                    marginBottom: '10px',
                                    borderRadius: '8px',
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease'
                                  }}>
                                      <Link to={`/course/${c.id}`} style={{
                                        fontWeight: '600',
                                        color: '#1F2937',
                                        flex: 1
                                      }}>
                                        {c.title}
                                      </Link>
                                      <span className={c.status === 'approved' ? 'badge-success' : 'badge-warning'}>
                                        {c.status === 'approved' ? '✅ Odobren' : '⏳ Na čekanju'}
                                      </span>
                                  </li>
                              ))}
                          </ul>
                        )}
                    </div>
                </div>
            )}

            {/* JAVNI KATALOG (Samo za Profesora i Admina) */}
            <h2 style={{ 
              paddingBottom: '16px',
              marginBottom: '32px',
              color: '#1F2937',
              borderBottom: '3px solid transparent',
              borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1'
            }}>
              📖 Katalog Svih Kurseva
            </h2>
            
            {courses.filter(course => course.status === 'approved').length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderRadius: '12px',
                border: '2px dashed rgba(102, 126, 234, 0.3)'
              }}>
                  <p style={{fontStyle: 'italic', color: '#6B7280', fontSize: '1.1em', margin: 0}}>
                      Trenutno nema dostupnih kurseva.
                  </p>
              </div>
            ) : (
              <div className="grid grid-3" style={{ animation: 'fadeIn 0.6s ease' }}>
                  {courses.filter(course => course.status === 'approved').map(course => (
                      <div key={course.id} className="card" style={{ 
                        borderLeft: '4px solid transparent',
                        borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1'
                      }}>
                          <Link to={`/course/${course.id}`} style={{ 
                            fontSize: '1.3em', 
                            fontWeight: '700',
                            color: '#1F2937',
                            display: 'block',
                            marginBottom: '12px'
                          }}>
                              {course.title}
                          </Link>
                          <p style={{ color: '#6B7280', fontSize: '0.95em', lineHeight: '1.6' }}>
                            {course.description.substring(0, 100)}...
                          </p>
                          <div style={{ 
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #E5E7EB'
                          }}>
                              <small style={{ color: '#9CA3AF', fontWeight: '500' }}>
                                👨‍🏫 {course.professor}
                              </small>
                          </div>
                      </div>
                  ))}
              </div>
            )}
        </div>
    );
}

export default CourseManager;