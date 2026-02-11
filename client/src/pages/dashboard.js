import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import AddUserForm from '../components/admin';
import UserList from '../components/users';
import AdminCourseRequests from '../components/adminCourseRequests'; 
import CourseManager from '../components/courseMenager'; 

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* --- HEADER --- */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.6s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Dashboard</h1>
          
          {/* DESNA STRANA HEADERA: Profil + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link 
                  to="/profile" 
                  style={{ 
                      textDecoration: 'none', 
                      color: '#4F46E5',
                      fontWeight: '600',
                      fontSize: '1em',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      border: '2px solid transparent'
                  }}
              >
                  👤 Moj Profil
              </Link>

              <button 
                  onClick={logout} 
                  className="btn-danger"
                  style={{ padding: '10px 20px' }}
              >
                  Odjavi se
              </button>
          </div>
        </div>

        {/* --- INFO TRAKA --- */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
            <p style={{ margin: 0, fontSize: '1.1em', color: '#374151' }}>
                Prijavljeni ste kao: <strong style={{ color: '#1F2937' }}>{user?.first_name} {user?.last_name}</strong> 
                <span className="badge-primary" style={{ 
                  marginLeft: '12px', 
                  padding: '6px 14px',
                  display: 'inline-block'
                }}>
                    {user?.role}
                </span>
            </p>
        </div>
      </div>
      
      {/* --- LOGIKA PRIKAZA --- */}
      {user?.role === 'admin' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* 1. Zahtevi za Kurseve */}
              <section style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.7s ease'
              }}>
                  <h2 style={{ 
                    borderLeft: '5px solid #F59E0B', 
                    paddingLeft: '16px', 
                    color: '#1F2937',
                    marginBottom: '24px'
                  }}>
                      Zahtevi za odobrenje kurseva
                  </h2>
                  <AdminCourseRequests />
              </section>

              {/* 2. Registracija korisnika */}
              <section style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.8s ease'
              }}>
                  <h2 style={{ 
                    borderLeft: '5px solid #10B981', 
                    paddingLeft: '16px', 
                    color: '#1F2937',
                    marginBottom: '24px'
                  }}>
                      Registracija novog korisnika
                  </h2>
                  <AddUserForm />
              </section>

              {/* 3. Lista korisnika */}
              <section style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.9s ease'
              }}>
                  <h2 style={{ 
                    borderLeft: '5px solid #4F46E5', 
                    paddingLeft: '16px', 
                    color: '#1F2937',
                    marginBottom: '24px'
                  }}>
                      Upravljanje korisnicima
                  </h2>
                  <UserList />
              </section>
          </div>
      ) : (
          /* --- PROFESOR / STUDENT PANEL --- */
          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.7s ease'
          }}>
               {/* Prikazuje formu za kreiranje (ako je prof) i listu kurseva */}
              <CourseManager />
          </div>
      )}
    </div>
  );
}

export default DashboardPage;