import { useState } from 'react';
import { useAuth } from '../context/authcontext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  // navigate nam vise ne treba ovde, koristimo "tvrdo" prebacivanje
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      
      // OVO JE PROMENA: Umesto navigate, radimo full reload
      // Ovo garantuje da ce browser povuci svezu sesiju
      window.location.href = '/'; 
      
    } catch (err) {
      console.error(err);
      setError("Greška pri logovanju. Proverite podatke.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Prijava</h2>
        
        {error && <div style={{ color: 'red', textAlign: 'center', fontSize: '0.9em' }}>{error}</div>}

        <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Lozinka" required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Uloguj se
        </button>
      </form>
    </div>
  );
}

export default LoginPage;