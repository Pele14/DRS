import { createContext, useContext, useState, useEffect } from 'react';
import { auth_api } from '../api_services/authservices'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            // Sada ovo gadja 'me()' funkciju koju smo popravili u servisu
            const res = await auth_api.me();
            console.log("CheckUser User:", res.data); // Debug
            setUser(res.data);
        } catch (err) {
            console.log("CheckUser: Nije ulogovan");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        // Pravimo objekat ovde
        const data = { email, password };
        // Šaljemo objekat u servis (koji sada očekuje objekat)
        await auth_api.login(data);
        // Osvežavamo korisnika
        await checkUser(); 
    };

    const logout = async () => {
        await auth_api.logout();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);