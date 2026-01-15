import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- ZA DUGME NAZAD
import { useAuth } from '../context/authcontext';
import api from '../api_services/api';

function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate(); // Hook za navigaciju
    
    const [formData, setFormData] = useState({
        first_name: '', 
        last_name: '', 
        ulica: '', 
        broj: '', 
        drzava: '',
        pol: '',
        datum_rodjenja: ''
    });
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                ulica: user.ulica || '',
                broj: user.broj || '',
                drzava: user.drzava || '',
                pol: user.pol || 'Ostalo',
                // Ako datum postoji, uzimamo prvih 10 karaktera (YYYY-MM-DD) da bi input radio
                datum_rodjenja: user.datum_rodjenja ? user.datum_rodjenja.substring(0, 10) : ''
            });
            setPreview(user.profile_image);
        }
    }, [user]);

    const handleFile = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        
        // Dodajemo sve podatke u FormData
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        if (imageFile) data.append('profile_image', imageFile);

        try {
            await api.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Uspešno sačuvano!");
            // Ne reloadujemo celu stranu, nego možemo nazad na dashboard ili osvežimo podatke
            window.location.reload(); 
        } catch (err) {
            console.error(err);
            alert("Greška pri čuvanju!");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            
            {/* HEDER SA DUGMETOM NAZAD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Uredi Profil</h2>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    ← Nazad na Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Slika */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '150px', height: '150px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid #007bff' }}>
                        <img 
                            src={preview || 'https://via.placeholder.com/150'} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <label style={{ display: 'block', marginTop: '10px', cursor: 'pointer', color: '#007bff', fontWeight: 'bold' }}>
                        Promeni sliku
                        <input type="file" onChange={handleFile} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Read-only polja (Informacije) */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
                    <small style={{ color: '#666' }}>Email: {user?.email}</small><br/>
                    <small style={{ color: '#666' }}>Uloga: <strong>{user?.role}</strong></small>
                </div>

                {/* Lični podaci */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Ime:</label>
                        <input 
                            value={formData.first_name} 
                            onChange={e => setFormData({...formData, first_name: e.target.value})} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Prezime:</label>
                        <input 
                            value={formData.last_name} 
                            onChange={e => setFormData({...formData, last_name: e.target.value})} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                {/* Datum i Pol */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Datum rođenja:</label>
                        <input 
                            type="date"
                            value={formData.datum_rodjenja} 
                            onChange={e => setFormData({...formData, datum_rodjenja: e.target.value})} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Pol:</label>
                        <select 
                            value={formData.pol} 
                            onChange={e => setFormData({...formData, pol: e.target.value})}
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        >
                            <option value="">Izaberite...</option>
                            <option value="Muski">Muški</option>
                            <option value="Zenski">Ženski</option>
                        </select>
                    </div>
                </div>

                {/* Adresa */}
                <div>
                    <label>Država:</label>
                    <input 
                        value={formData.drzava} 
                        onChange={e => setFormData({...formData, drzava: e.target.value})} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 3 }}>
                        <label>Ulica:</label>
                        <input 
                            value={formData.ulica} 
                            onChange={e => setFormData({...formData, ulica: e.target.value})} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Broj:</label>
                        <input 
                            value={formData.broj} 
                            onChange={e => setFormData({...formData, broj: e.target.value})} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1em' }}>
                    💾 Sačuvaj Izmene
                </button>
            </form>
        </div>
    );
}

export default ProfilePage;