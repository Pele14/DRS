import { useState, useEffect } from 'react';
import { useAuth } from '../context/authcontext';
import { useTasks } from '../hooks/useTasks';
import { task_api } from '../api_services/taskService';

function TaskSection({ courseId }) {
    const { user } = useAuth();
    const { 
        tasks, loading, 
        loadTasks, createTask, submitTask, 
        loadSubmissions, submissions, gradeStudent 
    } = useTasks();

    const [showCreate, setShowCreate] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
    const [selectedTask, setSelectedTask] = useState(null); 
    const [grades, setGrades] = useState({}); 
    const [comments, setComments] = useState({}); 
    const [files, setFiles] = useState({}); 

    useEffect(() => {
        loadTasks(courseId);
    }, [courseId, loadTasks]);

    // --- PROFESOR LOGIKA ---
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

    const toggleGrading = (taskId) => {
        if (selectedTask === taskId) {
            setSelectedTask(null);
        } else {
            setSelectedTask(taskId);
            loadSubmissions(taskId);
        }
    };

    const handleGradeSubmit = async (submissionId) => {
        const gradeValue = parseInt(grades[submissionId], 10);
        const commentValue = comments[submissionId] || "";

        if (!gradeValue || gradeValue < 5 || gradeValue > 10) {
            alert("Ocena mora biti ceo broj između 5 i 10.");
            return;
        }
        
        const res = await gradeStudent(submissionId, { grade: gradeValue, comment: commentValue });
        if (res.success) {
            alert("Ocenjeno!");
            setGrades(prev => ({ ...prev, [submissionId]: '' }));
            setComments(prev => ({ ...prev, [submissionId]: '' }));
            loadSubmissions(selectedTask); 
        } else {
            alert(res.error);
        }
    };

    // --- STUDENT LOGIKA ---
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
            loadTasks(courseId); // OVO JE BITNO: Osvežava listu da se pojavi "žuti okvir"
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

            {/* FORMA ZA KREIRANJE */}
            {isProfessor && (
                <div style={{ marginBottom: '20px' }}>
                    {!showCreate ? (
                        <button onClick={() => setShowCreate(true)} style={btnStyle}>+ Dodaj Novi Zadatak</button>
                    ) : (
                        <form onSubmit={handleCreate} style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <h4 style={{marginTop: 0}}>Novi Zadatak</h4>
                            <input placeholder="Naslov" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required style={inputStyle} />
                            <textarea placeholder="Opis" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required style={{...inputStyle, height: '60px'}} />
                            <label style={{fontSize: '0.8em'}}>Rok za predaju:</label>
                            <input type="datetime-local" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} required style={inputStyle} />
                            <div style={{ marginTop: '10px' }}>
                                <button type="submit" style={{...btnStyle, backgroundColor: 'green'}}>Sačuvaj</button>
                                <button type="button" onClick={() => setShowCreate(false)} style={{...btnStyle, backgroundColor: 'gray', marginLeft: '10px'}}>Otkaži</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

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

                    {/* --- DEO ZA PROFESORA --- */}
                    {isProfessor && (
                        <div>
                            <button onClick={() => toggleGrading(task.id)} style={{...btnStyle, fontSize: '0.8em', backgroundColor: '#6c757d'}}>
                                {selectedTask === task.id ? "Zatvori Pregled" : "📂 Pregledaj Predaje"}
                            </button>
                            
                            {selectedTask === task.id && (
                                <div style={{ marginTop: '15px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px' }}>
                                    <h4 style={{marginTop: 0}}>Rešenja studenata:</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {submissions.map(sub => (
                                            <li key={sub.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>
                                                        <strong>{sub.student_name}</strong> 
                                                        <a href={task_api.getDownloadUrl(sub.id)} style={{ marginLeft: '10px', color: 'blue', fontWeight: 'bold', textDecoration: 'none' }}>
                                                            ⬇ Preuzmi .py
                                                        </a>
                                                    </span>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    {sub.grade ? (
                                                        <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '4px', border: '1px solid #28a745' }}>
                                                            <span style={{ fontWeight: 'bold', color: 'green' }}>✅ Ocena: {sub.grade}</span>
                                                            {sub.comment && <span style={{ display: 'block', fontStyle: 'italic', color: '#666', fontSize: '0.9em' }}>"{sub.comment}"</span>}
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <input type="number" min="5" max="10" placeholder="Ocena" value={grades[sub.id] || ''} onChange={(e) => setGrades({...grades, [sub.id]: e.target.value})} style={{ width: '60px' }} />
                                                            <input type="text" placeholder="Komentar..." value={comments[sub.id] || ''} onChange={(e) => setComments({...comments, [sub.id]: e.target.value})} style={{ flex: 1 }} />
                                                            <button onClick={() => handleGradeSubmit(sub.id)} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px' }}>✔</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- DEO ZA STUDENTA (Sada sa statusima) --- */}
                    {!isProfessor && (
                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            {task.grade ? (
                                // 1. Zeleni okvir ako je ocenjeno
                                <div style={{ padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', color: '#155724' }}>
                                    <h4 style={{ margin: 0 }}>🎉 Ocenjeno: {task.grade}</h4>
                                    {task.comment && <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>"{task.comment}"</p>}
                                </div>
                            ) : task.submitted_file ? (
                                // 2. Žuti okvir ako je predato ali čeka ocenu
                                <div style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '5px', color: '#856404' }}>
                                    ⏳ Rešenje predato. Čeka se ocena profesora.
                                </div>
                            ) : (
                                // 3. Forma za slanje ako ništa nije urađeno
                                <>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>Tvoje rešenje (.py):</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="file" accept=".py" onChange={(e) => handleFileChange(task.id, e)} />
                                        <button onClick={() => handleSubmit(task.id)} style={{...btnStyle, backgroundColor: '#17a2b8'}}>Pošalji Rešenje</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

const btnStyle = { padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' };

export default TaskSection;