import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import ProtectedRoute from './components/protected_route';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import CourseDetailsPage from './pages/coursapage';
import ProfilePage from './pages/profilepage';
function App() {
 return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Javna ruta */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Zaštićene rute */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* <--- 2. NOVA RUTA ZA PROFIL */}
          <Route 
            path="/profile" 
            element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } 
          />

          <Route 
            path="/course/:id" 
            element={
                <ProtectedRoute>
                    <CourseDetailsPage />
                </ProtectedRoute>
            } 
          />
          
          {/* <--- 3. CATCH-ALL RUTA MORA BITI ZADNJA */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;