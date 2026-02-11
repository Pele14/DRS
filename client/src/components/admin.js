import { useState } from 'react';
import { auth_api } from '../api_services/authservices';
import { initialUserState } from '../models/userModel';

function AddUserForm() {

  const [formData, setFormData] = useState(initialUserState);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    console.log("ŠALJEM PODATKE:", formData); 

    try {
      if (!auth_api.registerUser && !auth_api.register) {
          alert("GREŠKA: U authservices.js ne postoji funkcija 'registerUser' ni 'register'!");
          return;
      }

      if (auth_api.registerUser) {
          await auth_api.registerUser(formData);
      } else {
          await auth_api.register(formData);
      }

      alert("✅ KORISNIK USPEŠNO KREIRAN!");
      setFormData(initialUserState); 

    } catch (err) {
      console.error("DETALJI GREŠKE:", err);

      if (err.response) {
          alert(`❌ GREŠKA SERVERA (${err.response.status}):\n` + 
                JSON.stringify(err.response.data));
      } else if (err.request) {
          alert("❌ SERVER NEDOSTUPAN (Network Error). Proveri da li Docker radi.");
      } else {
          alert("❌ GREŠKA U KODU: " + err.message);
      }
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      padding: '28px', 
      borderRadius: '12px', 
      maxWidth: '600px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        marginTop: 0,
        marginBottom: '24px',
        color: '#1F2937'
      }}>Admin Panel: Dodaj novog korisnika</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Osnovni podaci */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Email</label>
          <input name="email" value={formData.email} onChange={handleChange} placeholder="email@primer.com" required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Lozinka</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Uloga</label>
          <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="profesor">Profesor</option>
              <option value="admin">Admin</option>
          </select>
        </div>

        <hr style={{ width: '100%', border: 'none', borderTop: '2px solid rgba(102, 126, 234, 0.2)', margin: '8px 0' }} />

        {/* Lični podaci */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Ime</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ime" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Prezime</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Prezime" required />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Datum rođenja</label>
          <input name="datumRodjenja" type="date" value={formData.datumRodjenja} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Pol</label>
          <select name="pol" value={formData.pol} onChange={handleChange}>
              <option value="Muski">Muški</option>
              <option value="Zenski">Ženski</option>
              <option value="Ostalo">Ostalo</option>
          </select>
        </div>

        <hr style={{ width: '100%', border: 'none', borderTop: '2px solid rgba(102, 126, 234, 0.2)', margin: '8px 0' }} />

        {/* Adresa */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Država</label>
          <input name="drzava" value={formData.drzava} onChange={handleChange} placeholder="Država" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Ulica</label>
            <input name="ulica" value={formData.ulica} onChange={handleChange} placeholder="Ulica" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Broj</label>
            <input name="broj" value={formData.broj} onChange={handleChange} placeholder="Broj" />
          </div>
        </div>

        <button type="submit" className="btn-success" style={{ marginTop: '8px' }}>
            ✅ Sačuvaj Korisnika
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };

export default AddUserForm;