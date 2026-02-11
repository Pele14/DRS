import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { course_api } from '../api_services/courseservices';
import { useAuth } from '../context/authcontext';
import TaskSection from '../components/TaskSection'

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
        <div style={{ 
          padding: '40px 20px',
          minHeight: '100vh'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button 
                  onClick={() => navigate('/')}
                  className="btn-secondary"
                  style={{ marginBottom: '24px' }}
                >
                  ← Nazad
                </button>

                <div className="form-container" style={{ animation: 'fadeIn 0.6s ease' }}>
                    
                    {/* --- HEADER KURSA --- */}
                    {isEditing ? (
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Naziv kursa</label>
                            <input 
                              value={editData.title} 
                              onChange={e=>setEditData({...editData, title: e.target.value})} 
                              style={{ fontSize: '1.3em', marginBottom: '16px' }} 
                            />
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Opis kursa</label>
                            <textarea 
                              value={editData.description} 
                              onChange={e=>setEditData({...editData, description: e.target.value})} 
                              style={{ minHeight: '120px' }} 
                            />
                            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                <button onClick={handleUpdate} className="btn-success">💾 Sačuvaj</button>
                                <button onClick={()=>setIsEditing(false)} className="btn-secondary">✖️ Otkaži</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <h1 style={{ margin: 0 }}>{course.title}</h1>
                                {isProfessor && (
                                  <button 
                                    onClick={()=>setIsEditing(true)}
                                    className="btn-primary"
                                    style={{ fontSize: '0.85em', padding: '8px 16px' }}
                                  >
                                    ✏️ Izmeni
                                  </button>
                                )}
                            </div>
                            <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                              👨‍🏫 Profesor: <strong>{course.professor}</strong>
                            </p>
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                              padding: '20px', 
                              borderRadius: '12px',
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              lineHeight: '1.7',
                              color: '#374151'
                            }}>
                              {course.description}
                            </div>
                        </div>
                    )}

                    <hr style={{ border: 'none', borderTop: '2px solid #E5E7EB', margin: '32px 0' }} />

                    {/* --- MATERIJALI (PDF) --- */}
                    <section style={{ marginBottom: '32px' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1F2937' }}>📚 Materijali za učenje</h3>
                        {course.material_link ? (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                              padding: '20px',
                              borderRadius: '12px',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                                <a 
                                  href={course_api.getDownloadUrl(course.material_link)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  style={{
                                    color: '#059669',
                                    fontWeight: '600',
                                    fontSize: '1.05em',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}
                                >
                                    📄 Preuzmi materijal za učenje (PDF)
                                </a>
                                {isProfessor && (
                                  <p style={{fontSize: '0.85em', color: '#F59E0B', marginTop: '12px', marginBottom: 0}}>
                                    ⚠️ Ako otpremite novi fajl, stari će biti zamenjen.
                                  </p>
                                )}
                            </div>
                        ) : (
                          <p style={{ color: '#6B7280', fontStyle: 'italic' }}>Trenutno nema postavljenih materijala.</p>
                        )}

                        {isProfessor && (
                            <div style={{marginTop: '16px'}}>
                                <label style={{ 
                                  display: 'inline-block',
                                  padding: '10px 20px',
                                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                  borderRadius: '8px',
                                  color: '#4F46E5',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                                }}>
                                    📎 Dodaj/Zameni PDF
                                    <input 
                                      type="file" 
                                      accept="application/pdf" 
                                      onChange={handleUpload}
                                      style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        )}
                    </section>
                    
                    <TaskSection courseId={id} />
                    
                    <hr style={{ border: 'none', borderTop: '2px solid #E5E7EB', margin: '32px 0' }} />

                    {/* --- STUDENTI --- */}
                    <section>
                        <h3 style={{ marginBottom: '16px', color: '#1F2937' }}>🎓 Upisani Studenti</h3>
                        {course.students && course.students.length > 0 ? (
                          <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            display: 'grid',
                            gap: '12px'
                          }}>
                              {course.students.map(s => (
                                  <li key={s.id} style={{
                                    padding: '14px 18px',
                                    background: '#F9FAFB',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <span style={{ fontWeight: '500', color: '#374151' }}>
                                      {s.name}
                                    </span>
                                    <span style={{ color: '#6B7280', fontSize: '0.9em' }}>
                                      {s.email}
                                    </span>
                                  </li>
                              ))}
                          </ul>
                        ) : (
                          <p style={{ color: '#6B7280', fontStyle: 'italic' }}>Nema upisanih studenata.</p>
                        )}

                        {isProfessor && (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                              padding: '24px', 
                              borderRadius: '12px',
                              marginTop: '24px',
                              border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#1F2937' }}>
                                  Dodaj studenta na kurs
                                </h4>
                                <form onSubmit={handleAddStudent} style={{display: 'flex', gap: '12px'}}>
                                    <input 
                                        placeholder="Email studenta" 
                                        value={studentEmail} 
                                        onChange={e => setStudentEmail(e.target.value)}
                                        style={{ flex: 1 }}
                                        required
                                    />
                                    <button type="submit" className="btn-primary">➕ Dodaj</button>
                                </form>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default CourseDetailsPage;