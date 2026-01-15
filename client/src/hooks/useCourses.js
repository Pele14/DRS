import { useState, useEffect, useCallback } from 'react';
import { course_api } from '../api_services/courseservices';


export const useCourses = () => {
    const [courses, setCourses] = useState([]);      // Svi kursevi (javni)
    const [myCourses, setMyCourses] = useState([]);  // <--- Kursevi ulogovanog profesora
    const [loading, setLoading] = useState(true);

    // 1. Funkcija za učitavanje SVIH kurseva (Katalog)
    const loadCourses = useCallback(async () => {
        try {
            const res = await course_api.getAll();
            setCourses(res.data);
        } catch (err) {
            console.error("Greška pri učitavanju kurseva", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. NOVO: Funkcija za učitavanje SAMO MOJIH kurseva
    const loadMyCourses = useCallback(async () => {
        try {
            const res = await course_api.getMyCourses(); // Poziva /api/courses/my-courses
            setMyCourses(res.data);
        } catch (err) {
            console.error("Greška pri učitavanju mojih kurseva", err);
        }
    }, []);

    // Učitaj javne kurseve odmah pri startovanju
    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    // 3. Ažurirana funkcija za kreiranje
    const createCourse = async (courseData) => {
        try {
            await course_api.create(courseData);
            
            // Osveži obe liste odmah nakon uspešnog kreiranja
            loadCourses();     // Da se pojavi u katalogu (ako je odobren)
            loadMyCourses();   // Da se pojavi na tvom dashboardu (kao pending)
            
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Greška pri kreiranju";
            alert(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    // 4. Vraćamo i nove funkcije/podatke komponenti
    return { 
        courses, 
        loading, 
        createCourse, 
        myCourses,      // <--- NOVO
        loadMyCourses   // <--- NOVO (da možemo ručno da osvežimo ako treba)
    };
};