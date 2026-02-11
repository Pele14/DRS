import { useState } from 'react';
import { useAuth } from '../context/authcontext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      window.location.href = '/'; 
    } catch (err) {
      console.error(err);
      setError("Greška pri logovanju. Proverite podatke.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <form onSubmit={handleLogin} className="form-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        width: '100%',
        maxWidth: '400px',
        animation: 'fadeIn 0.6s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2rem',
            fontWeight: '700'
          }}>Dobrodošli</h2>
          <p style={{ color: '#6B7280', margin: 0 }}>Prijavite se na svoj nalog</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
            Email adresa
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="ime@primer.com" 
            disabled={isLoading}
            required 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
            Lozinka
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            disabled={isLoading}
            required 
          />
        </div>
        
        <button 
          type="submit" 
          style={{ marginTop: '10px' }}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Prijavljivanje...' : '🔐 Uloguj se'}
        </button>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '8px', 
          paddingTop: '16px', 
          borderTop: '1px solid #E5E7EB' 
        }}>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
            Sistem za upravljanje kursevima
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
