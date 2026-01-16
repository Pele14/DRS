import { createContext, useContext, useState, useEffect } from 'react';
import { auth_api } from '../api_services/authservices'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const res = await auth_api.me();
            console.log("CheckUser User:", res.data); 
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
        const data = { email, password };
        await auth_api.login(data);
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