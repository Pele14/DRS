import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // AKO SE UCITAVA, PRIKAZI "LOADING..." UMESTO DA GA IZBACIS
    if (loading) {
        return <div>Učitavanje...</div>;
    }

    // Tek kad je ucitavanje gotovo, proveri da li je ulogovan
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;