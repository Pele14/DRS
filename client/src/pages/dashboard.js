import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import AddUserForm from '../components/admin';
import UserList from '../components/users';
import AdminCourseRequests from '../components/adminCourseRequests'; 
import CourseManager from '../components/courseMenager'; 

function DashboardPage() {
  const { user, logout } = useAuth();

  // Format user's full name
  const userFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Korisnik';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Dashboard</h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.95em' }}>
              Dobrodošli, {userFullName}
            </p>
          </div>
          
          {/* DESNA STRANA HEADERA: Profil + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                      border: '2px solid transparent',
                      display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
                  }}
              >
                  👤 Moj Profil
              </Link>

              <button 
                  onClick={logout} 
                  className="btn-danger"
                  style={{ padding: '10px 20px' }}
              >
                  🚪 Odjavi se
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '1.05em', color: '#374151' }}>
                    <strong style={{ color: '#1F2937' }}>Email:</strong> {user?.email}
                </p>
                <span className="badge-primary" style={{ 
                  padding: '6px 14px',
                  display: 'inline-block'
                }}>
                    {user?.role?.toUpperCase()}
                </span>
            </div>
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
                animation: 'fadeIn 0.7s ease',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                  <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ 
                        margin: '0 0 8px 0',
                        color: '#1F2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                          <span style={{ 
                              width: '5px', 
                              height: '30px', 
                              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                              borderRadius: '4px'
                          }}></span>
                          Zahtevi za odobrenje kurseva
                      </h2>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9em', paddingLeft: '17px' }}>
                          Pregledajte i odobrite zahteve za nove kurseve
                      </p>
                  </div>
                  <AdminCourseRequests />
              </section>

              {/* 2. Registracija korisnika */}
              <section style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.8s ease',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                  <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ 
                        margin: '0 0 8px 0',
                        color: '#1F2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                          <span style={{ 
                              width: '5px', 
                              height: '30px', 
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              borderRadius: '4px'
                          }}></span>
                          Registracija novog korisnika
                      </h2>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9em', paddingLeft: '17px' }}>
                          Dodajte nove korisnike u sistem
                      </p>
                  </div>
                  <AddUserForm />
              </section>

              {/* 3. Lista korisnika */}
              <section style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.9s ease',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                  <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ 
                        margin: '0 0 8px 0',
                        color: '#1F2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                          <span style={{ 
                              width: '5px', 
                              height: '30px', 
                              background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                              borderRadius: '4px'
                          }}></span>
                          Upravljanje korisnicima
                      </h2>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9em', paddingLeft: '17px' }}>
                          Pregled svih korisnika sistema
                      </p>
                  </div>
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
            animation: 'fadeIn 0.7s ease',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
              <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ 
                    margin: '0 0 8px 0',
                    color: '#1F2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                      <span style={{ 
                          width: '5px', 
                          height: '30px', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px'
                      }}></span>
                      {user?.role === 'profesor' ? 'Moji kursevi' : 'Dostupni kursevi'}
                  </h2>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9em', paddingLeft: '17px' }}>
                      {user?.role === 'profesor' 
                          ? 'Upravljajte svojim kursevima i zadacima' 
                          : 'Pregledajte kurseve na kojima ste upisani'}
                  </p>
              </div>
              {/* Prikazuje formu za kreiranje (ako je prof) i listu kurseva */}
              <CourseManager />
          </div>
      )}
    </div>
  );
}

export default DashboardPage;
