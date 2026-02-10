import api from './api';

export const task_api = {
    // 1. KREIRANJE ZADATKA (Samo Profesor)
    // Šalje naslov, opis, rok i ID kursa
    create: (taskData) => {
        return api.post('/tasks/create', taskData);
    },

    // 2. PREUZIMANJE ZADATAKA (Svi)
    // Vraća listu zadataka za određeni kurs
    getByCourse: (courseId) => {
        return api.get(`/tasks/course/${courseId}`);
    },

    // 3. SLANJE REŠENJA (Samo Student)
    // KLJUČNO: Ovde moramo da promenimo Content-Type jer šaljemo FAJL (.py)
    submitSolution: (taskId, formData) => {
        return api.post(`/tasks/${taskId}/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' 
            }
        });
    },

    // 4. PREGLED PREDAJA (Samo Profesor)
    // Vraća listu svih studenata koji su predali rešenje za konretan zadatak
    getSubmissions: (taskId) => {
        return api.get(`/tasks/${taskId}/submissions`);
    },

    // 5. OCENJIVANJE (Samo Profesor)
    // Šalje ocenu (5-10) i opcioni komentar
    gradeSubmission: (submissionId, gradeData) => {
        return api.patch(`/tasks/submission/${submissionId}/grade`, gradeData);
    },

    // 6. HELPER ZA DOWNLOAD (Samo Profesor)
    // Ovo nije Axios poziv, već samo generiše link koji ćemo staviti u <a href="...">
    getDownloadUrl: (submissionId) => {
        return `http://localhost:5000/api/tasks/submission/${submissionId}/download`;
    }
};