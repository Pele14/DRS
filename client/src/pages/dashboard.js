import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import AddUserForm from '../components/admin';
import UserList from '../components/users';


import AdminCourseRequests from '../components/adminCourseRequests'; // <--- NOVO

// Importi za PROFESORA/STUDENTA
import CourseManager from '../components/courseMenager'; 

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1>Dashboard</h1>
        
        {/* DESNA STRANA HEADERA: Profil + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link 
                to="/profile" 
                style={{ 
                    textDecoration: 'none', 
                    color: '#007bff', 
                    fontWeight: 'bold',
                    fontSize: '1em'
                }}
            >
                👤 Moj Profil
            </Link>

            <button 
                onClick={logout} 
                style={{ 
                    padding: '10px 20px', 
                    cursor: 'pointer', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}
            >
                Odjavi se
            </button>
        </div>
      </div>

      {/* --- INFO TRAKA --- */}
      <div style={{ marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
          <p style={{ margin: 0, fontSize: '1.1em' }}>
              Prijavljeni ste kao: <strong>{user?.first_name} {user?.last_name}</strong> 
              <span style={{ marginLeft: '10px', padding: '4px 10px', backgroundColor: '#007bff', color: 'white', borderRadius: '15px', fontSize: '0.8em', textTransform: 'uppercase' }}>
                  {user?.role}
              </span>
          </p>
      </div>
      
      {/* --- LOGIKA PRIKAZA --- */}
      {user?.role === 'admin' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* 1. Zahtevi za Kurseve (NOVO) */}
              <section>
                  <h2 style={{ borderLeft: '5px solid #ffc107', paddingLeft: '10px', color: '#333' }}>
                      Zahtevi za odobrenje kurseva
                  </h2>
                  <AdminCourseRequests />
              </section>

              {/* 2. Registracija korisnika */}
              <section>
                  <h2 style={{ borderLeft: '5px solid #28a745', paddingLeft: '10px', color: '#333' }}>
                      Registracija novog korisnika
                  </h2>
                  <AddUserForm />
              </section>

              {/* 3. Lista korisnika */}
              <section>
                  <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: '10px', color: '#333' }}>
                      Upravljanje korisnicima
                  </h2>
                  <UserList />
              </section>
          </div>
      ) : (
          /* --- PROFESOR / STUDENT PANEL --- */
          <div>
               {/* Prikazuje formu za kreiranje (ako je prof) i listu kurseva */}
              <CourseManager />
          </div>
      )}
    </div>
  );
}

export default DashboardPage;