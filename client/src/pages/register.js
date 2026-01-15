import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'student'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', formData);
      alert("Registracija uspešna! Sada se uloguj.");
      navigate('/login');
    } catch (err) {
      alert("Greška: " + (err.response?.data?.error || "Neuspešna registracija"));
    }
  };

  return (
    <div>
      <h2>Registracija</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Ime" onChange={e => setFormData({...formData, firstName: e.target.value})} />
        <br />
        <input type="text" placeholder="Prezime" onChange={e => setFormData({...formData, lastName: e.target.value})} />
        <br />
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
        <br />
        <input type="password" placeholder="Lozinka" onChange={e => setFormData({...formData, password: e.target.value})} />
        <br />
        <select onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="student">Student</option>
            <option value="profesor">Profesor</option>
        </select>
        <br /><br />
        <button type="submit">Registruj se</button>
      </form>
      <Link to="/login">Nazad na login</Link>
    </div>
  );
}

export default Register;