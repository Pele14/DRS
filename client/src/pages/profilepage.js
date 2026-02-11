import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/authcontext';
import api from '../api_services/api';

function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    
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
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                ulica: user.ulica || '',
                broj: user.broj || '',
                drzava: user.drzava || '',
                pol: user.pol || '',
                datum_rodjenja: user.datum_rodjenja ? user.datum_rodjenja.substring(0, 10) : ''
            });
            setPreview(user.profile_image);
        }
    }, [user]);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('Slika je prevelika. Maksimalna veličina je 5MB.');
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrorMessage('Molimo izaberite sliku.');
                return;
            }
            setErrorMessage('');
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });
        
        if (imageFile) data.append('profile_image', imageFile);

        try {
            await api.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage('Profil je uspešno ažuriran!');
            setTimeout(() => {
                window.location.reload(); 
            }, 1500);
        } catch (err) {
            console.error(err);
            setErrorMessage('Greška pri čuvanju. Pokušajte ponovo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
          minHeight: '100vh',
          padding: '40px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
            <div className="form-container" style={{ 
              maxWidth: '700px',
              width: '100%',
              animation: 'fadeIn 0.6s ease'
            }}>
            
            {/* HEADER SA DUGMETOM NAZAD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ 
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Uredi Profil</h2>
                <button 
                    onClick={() => navigate('/')}
                    className="btn-secondary"
                    disabled={isLoading}
                >
                    ← Nazad
                </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Slika */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{ 
                      width: '150px', 
                      height: '150px', 
                      margin: '0 auto', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      border: '4px solid transparent',
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                    }}>
                        <img 
                            src={preview || 'https://via.placeholder.com/150'} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <label style={{ 
                      display: 'inline-block', 
                      marginTop: '16px', 
                      cursor: isLoading ? 'not-allowed' : 'pointer', 
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      borderRadius: '8px',
                      color: '#4F46E5',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      opacity: isLoading ? 0.6 : 1
                    }}>
                        📷 Promeni sliku
                        <input 
                            type="file" 
                            onChange={handleFile} 
                            style={{ display: 'none' }} 
                            disabled={isLoading}
                            accept="image/*"
                        />
                    </label>
                </div>

                {/* Read-only polja (Informacije) */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}>
                    <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9em' }}>
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9em' }}>
                      <strong>Uloga:</strong> <span className="badge-primary" style={{ marginLeft: '8px' }}>{user?.role}</span>
                    </p>
                </div>

                {/* Lični podaci */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                            Ime
                        </label>
                        <input 
                            type="text"
                            value={formData.first_name} 
                            onChange={e => setFormData({...formData, first_name: e.target.value})}
                            disabled={isLoading}
                            placeholder="Vaše ime"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                            Prezime
                        </label>
                        <input 
                            type="text"
                            value={formData.last_name} 
                            onChange={e => setFormData({...formData, last_name: e.target.value})}
                            disabled={isLoading}
                            placeholder="Vaše prezime"
                        />
                    </div>
                </div>

                {/* Datum i Pol */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                            Datum rođenja
                        </label>
                        <input 
                            type="date"
                            value={formData.datum_rodjenja} 
                            onChange={e => setFormData({...formData, datum_rodjenja: e.target.value})}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                            Pol
                        </label>
                        <select 
                            value={formData.pol} 
                            onChange={e => setFormData({...formData, pol: e.target.value})}
                            disabled={isLoading}
                        >
                            <option value="">Izaberite...</option>
                            <option value="Muski">Muški</option>
                            <option value="Zenski">Ženski</option>
                        </select>
                    </div>
                </div>

                {/* Adresa */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                        Država
                    </label>
                    <input 
                        type="text"
                        value={formData.drzava} 
                        onChange={e => setFormData({...formData, drzava: e.target.value})}
                        disabled={isLoading}
                        placeholder="Npr. Srbija"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                            Ulica
                        </label>
                        <input 
                            type="text"
                            value={formData.ulica} 
                            onChange={e => setFormData({...formData, ulica: e.target.value})}
                            disabled={isLoading}
                            placeholder="Naziv ulice"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                            Broj
                        </label>
                        <input 
                            type="text"
                            value={formData.broj} 
                            onChange={e => setFormData({...formData, broj: e.target.value})}
                            disabled={isLoading}
                            placeholder="12"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn-success" 
                    style={{ 
                      marginTop: '8px', 
                      padding: '14px',
                      fontSize: '1.05em'
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? '⏳ Čuvanje...' : '💾 Sačuvaj Izmene'}
                </button>
            </form>
            </div>
        </div>
    );
}

export default ProfilePage;
