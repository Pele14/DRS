import { useState, useEffect } from 'react';
import { useAuth } from '../context/authcontext';
import { useTasks } from '../hooks/useTasks';
import { task_api } from '../api_services/taskService';

function TaskSection({ courseId }) {
    const { user } = useAuth();
    const { 
        tasks, loading, error, 
        loadTasks, createTask, submitTask, 
        loadSubmissions, submissions, gradeStudent 
    } = useTasks();

    // Stanja za formu (Profesor)
    const [showCreate, setShowCreate] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
    
    // Stanje za pregled rešenja (Profesor)
    const [selectedTask, setSelectedTask] = useState(null); // ID zadatka koji se pregleda
    const [grades, setGrades] = useState({}); // Privremeno čuvanje ocena
    
    // --- NOVO: Stanje za komentare ---
    const [comments, setComments] = useState({}); 

    // Stanje za upload (Student)
    const [files, setFiles] = useState({}); 

    useEffect(() => {
        loadTasks(courseId);
    }, [courseId, loadTasks]);

    // --- FUNKCIJE ZA PROFESORA ---
    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await createTask({ ...newTask, course_id: courseId });
        if (res.success) {
            alert("Zadatak uspešno kreiran!");
            setShowCreate(false);
            setNewTask({ title: '', description: '', deadline: '' });
        } else {
            alert(res.error);
        }
    };

    const openGrading = (taskId) => {
        setSelectedTask(taskId);
        loadSubmissions(taskId);
    };

    // --- NOVO: Ažurirana funkcija za ocenjivanje ---
    const handleGradeSubmit = async (submissionId) => {
        // 1. Konvertujemo ocenu u BROJ (bitno za backend)
        const gradeValue = parseInt(grades[submissionId], 10);
        // 2. Uzimamo komentar (ili prazan string ako ga nema)
        const commentValue = comments[submissionId] || "";

        // Validacija
        if (!gradeValue || gradeValue < 5 || gradeValue > 10) {
            alert("Ocena mora biti ceo broj između 5 i 10.");
            return;
        }
        
        // 3. Šaljemo objekat sa ocenom i komentarom
        const payload = { grade: gradeValue, comment: commentValue };

        const res = await gradeStudent(submissionId, payload);
        
        if (res.success) {
            alert("Ocenjeno!");
            // Čistimo polja
            setGrades(prev => ({ ...prev, [submissionId]: '' }));
            setComments(prev => ({ ...prev, [submissionId]: '' }));
            // Osvežavamo tabelu
            loadSubmissions(selectedTask); 
        } else {
            alert(res.error);
        }
    };

    // --- FUNKCIJE ZA STUDENTA ---
    const handleFileChange = (taskId, e) => {
        const file = e.target.files[0];
        if (file && !file.name.endsWith('.py')) {
            alert("Dozvoljeni su samo .py fajlovi!");
            e.target.value = null; 
            return;
        }
        setFiles({ ...files, [taskId]: file });
    };

    const handleSubmit = async (taskId) => {
        const file = files[taskId];
        if (!file) return alert("Morate izabrati fajl.");

        const res = await submitTask(taskId, file);
        if (res.success) {
            alert("Rešenje poslato!");
            loadTasks(courseId); 
        } else {
            alert(res.error);
        }
    };

    const isProfessor = user?.role === 'profesor';

    return (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#333' }}>
                📋 Zadaci i Projekti
            </h2>

            {/* --- FORMA ZA KREIRANJE (Samo Prof) --- */}
            {isProfessor && (
                <div style={{ marginBottom: '20px' }}>
                    {!showCreate ? (
                        <button onClick={() => setShowCreate(true)} style={btnStyle}>+ Dodaj Novi Zadatak</button>
                    ) : (
                        <form onSubmit={handleCreate} style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <h4>Novi Zadatak</h4>
                            <input placeholder="Naslov" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required style={inputStyle} />
                            <textarea placeholder="Opis" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required style={{...inputStyle, height: '60px'}} />
                            <label>Rok za predaju:</label>
                            <input type="datetime-local" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} required style={inputStyle} />
                            
                            <div style={{ marginTop: '10px' }}>
                                <button type="submit" style={{...btnStyle, backgroundColor: 'green'}}>Sačuvaj</button>
                                <button type="button" onClick={() => setShowCreate(false)} style={{...btnStyle, backgroundColor: 'gray', marginLeft: '10px'}}>Otkaži</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* --- LISTA ZADATAKA --- */}
            {loading && <p>Učitavanje zadataka...</p>}
            {tasks.length === 0 && !loading && <p>Nema postavljenih zadataka.</p>}

            {tasks.map(task => (
                <div key={task.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#0056b3' }}>{task.title}</h3>
                        <span style={{ fontSize: '0.8em', color: '#dc3545', fontWeight: 'bold' }}>
                            Rok: {new Date(task.deadline).toLocaleString()}
                        </span>
                    </div>
                    <p>{task.description}</p>

                    {/* --- DEO ZA PROFESORA (Pregled) --- */}
                    {isProfessor && (
                        <div>
                            <button onClick={() => openGrading(task.id)} style={{...btnStyle, fontSize: '0.9em'}}>
                                📂 Pregledaj Predaje
                            </button>
                            
                            {/* --- TABELA SA OCENAMA --- */}
                            {selectedTask === task.id && (
                                <div style={{ marginTop: '15px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px' }}>
                                    <h4>Rešenja studenata:</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {submissions.map(sub => (
                                            <li key={sub.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                
                                                {/* Gornji red: Student i Download */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>
                                                        <strong>{sub.student_name}</strong> 
                                                        <a href={task_api.getDownloadUrl(sub.id)} style={{ marginLeft: '10px', color: 'blue', fontWeight: 'bold' }}>
                                                            ⬇ Preuzmi .py
                                                        </a>
                                                    </span>
                                                </div>

                                                {/* Donji red: Ocenjivanje */}
                                                <div style={{ marginTop: '5px' }}>
                                                    {sub.grade ? (
                                                        // --- PRIKAZ AKO JE VEĆ OCENJENO ---
                                                        <div style={{ backgroundColor: 'white', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                                            <span style={{ fontWeight: 'bold', color: 'green' }}>✅ Ocena: {sub.grade}</span>
                                                            {sub.comment && (
                                                                <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#666' }}>
                                                                    "{sub.comment}"
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // --- INPUTI ZA OCENJIVANJE ---
                                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                            <input 
                                                                type="number" min="5" max="10" 
                                                                placeholder="Ocena"
                                                                value={grades[sub.id] || ''}
                                                                onChange={(e) => setGrades({...grades, [sub.id]: e.target.value})}
                                                                style={{ width: '70px', padding: '5px' }}
                                                            />
                                                            
                                                            {/* NOVO: Input za komentar */}
                                                            <input 
                                                                type="text" 
                                                                placeholder="Komentar (opciono)..."
                                                                value={comments[sub.id] || ''}
                                                                onChange={(e) => setComments({...comments, [sub.id]: e.target.value})}
                                                                style={{ flex: 1, padding: '5px' }}
                                                            />

                                                            <button onClick={() => handleGradeSubmit(sub.id)} style={{ padding: '6px 10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                                                                ✔ Sačuvaj
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                        {submissions.length === 0 && <li>Nema predatih rešenja.</li>}
                                    </ul>
                                    <button onClick={() => setSelectedTask(null)} style={{ fontSize: '0.8em', marginTop: '10px' }}>Zatvori pregled</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- DEO ZA STUDENTA (Upload) --- */}
                    {!isProfessor && (
                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tvoje rešenje (.py):</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="file" accept=".py" onChange={(e) => handleFileChange(task.id, e)} />
                                <button onClick={() => handleSubmit(task.id)} style={{...btnStyle, backgroundColor: '#17a2b8'}}>
                                    Pošalji Rešenje
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Stilovi
const btnStyle = { padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' };

export default TaskSection;