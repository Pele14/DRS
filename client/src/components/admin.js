import { useState } from 'react';
import { auth_api } from '../api_services/authservices';
// Ako nemas validatore, zakomentarisi ovu liniju privremeno da ne puca

import { initialUserState } from '../models/userModel';

function AddUserForm() {
  // Ako nemas initialUserState, koristi ovo zakomentarisano:
  // const initialUserState = { email: '', password: '', role: 'student', firstName: '', lastName: '', datumRodjenja: '', pol: 'Ostalo', drzava: '', ulica: '', broj: '' };
  
  const [formData, setFormData] = useState(initialUserState);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Privremeno isključujemo validaciju da vidimo da li server radi
    // const error = validateRegistration(formData);
    // if (error) return alert(error);

    console.log("ŠALJEM PODATKE:", formData); // Pogledaj u Console (F12) šta se šalje

    try {
      // Provera da li funkcija uopšte postoji
      if (!auth_api.registerUser && !auth_api.register) {
          alert("GREŠKA: U authservices.js ne postoji funkcija 'registerUser' ni 'register'!");
          return;
      }

      // Pozivamo funkciju (probamo oba naziva za svaki slucaj)
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
          // Server je odgovorio sa greškom (4xx ili 5xx)
          alert(`❌ GREŠKA SERVERA (${err.response.status}):\n` + 
                JSON.stringify(err.response.data));
      } else if (err.request) {
          // Server se ne javlja
          alert("❌ SERVER NEDOSTUPAN (Network Error). Proveri da li Docker radi.");
      } else {
          // Greška u React kodu
          alert("❌ GREŠKA U KODU: " + err.message);
      }
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', borderRadius: '8px', maxWidth: '500px', backgroundColor: 'white' }}>
      <h3>Admin Panel: Dodaj novog korisnika</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Osnovni podaci */}
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={inputStyle} />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Lozinka" required style={inputStyle} />
        
        <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
            <option value="student">Student</option>
            <option value="profesor">Profesor</option>
            <option value="admin">Admin</option>
        </select>

        <hr style={{ width: '100%' }} />

        {/* Lični podaci */}
        <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ime" required style={inputStyle} />
        <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Prezime" required style={inputStyle} />
        
        <label style={{ fontSize: '0.8em' }}>Datum rođenja:</label>
        <input name="datumRodjenja" type="date" value={formData.datumRodjenja} onChange={handleChange} required style={inputStyle} />
        
        <select name="pol" value={formData.pol} onChange={handleChange} style={inputStyle}>
            <option value="Muski">Muški</option>
            <option value="Zenski">Ženski</option>
            <option value="Ostalo">Ostalo</option>
        </select>

        <hr style={{ width: '100%' }} />

        {/* Adresa */}
        <input name="drzava" value={formData.drzava} onChange={handleChange} placeholder="Država" style={inputStyle} />
        <div style={{ display: 'flex', gap: '10px' }}>
            <input name="ulica" value={formData.ulica} onChange={handleChange} placeholder="Ulica" style={{ flex: 1, ...inputStyle }} />
            <input name="broj" value={formData.broj} onChange={handleChange} placeholder="Broj" style={{ width: '60px', ...inputStyle }} />
        </div>

        <button type="submit" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Sačuvaj Korisnika
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };

export default AddUserForm;