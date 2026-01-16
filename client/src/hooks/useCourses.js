import { useState, useEffect, useCallback } from 'react';
import { course_api } from '../api_services/courseservices';


export const useCourses = () => {
    const [courses, setCourses] = useState([]); 
    const [myCourses, setMyCourses] = useState([]); 
    const [loading, setLoading] = useState(true);

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

    const loadMyCourses = useCallback(async () => {
        try {
            const res = await course_api.getMyCourses();
            setMyCourses(res.data);
        } catch (err) {
            console.error("Greška pri učitavanju mojih kurseva", err);
        }
    }, []);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const createCourse = async (courseData) => {
        try {
            await course_api.create(courseData);
            loadCourses(); 
            loadMyCourses();   
            
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Greška pri kreiranju";
            alert(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    return { 
        courses, 
        loading, 
        createCourse, 
        myCourses,      
        loadMyCourses   
    };
};