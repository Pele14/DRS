import { useState, useCallback } from 'react';
import { task_api } from '../api_services/taskService';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);         // Lista zadataka za kurs
    const [submissions, setSubmissions] = useState([]); // Lista rešenja (za profesora)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. UČITAVANJE ZADATAKA (Za Student/Profesor View)
    const loadTasks = useCallback(async (courseId) => {
        setLoading(true);
        try {
            const res = await task_api.getByCourse(courseId);
            setTasks(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Neuspešno učitavanje zadataka.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. KREIRANJE ZADATKA (Samo Profesor)
    const createTask = async (taskData) => {
        setLoading(true);
        try {
            await task_api.create(taskData);
            // Osveži listu odmah nakon kreiranja
            if (taskData.course_id) {
                await loadTasks(taskData.course_id);
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Greška pri kreiranju." };
        } finally {
            setLoading(false);
        }
    };

    // 3. PREDAJA REŠENJA (Samo Student)
    const submitTask = async (taskId, file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file); // Ključ mora biti 'file' jer tako očekuje Flask

        try {
            await task_api.submitSolution(taskId, formData);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Greška pri slanju." };
        } finally {
            setLoading(false);
        }
    };

    // 4. UČITAVANJE PREDAJA (Samo Profesor - kad klikne na zadatak)
    const loadSubmissions = useCallback(async (taskId) => {
        setLoading(true);
        try {
            const res = await task_api.getSubmissions(taskId);
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
            setError("Neuspešno učitavanje rešenja.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 5. OCENJIVANJE (Samo Profesor)
    const gradeStudent = async (submissionId, gradeData) => {
        try {
            await task_api.gradeSubmission(submissionId, gradeData);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Greška pri ocenjivanju." };
        }
    };

    return {
        tasks,
        submissions,
        loading,
        error,
        loadTasks,
        createTask,
        submitTask,
        loadSubmissions,
        gradeStudent
    };
};