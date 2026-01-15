import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // OVO JE KLJUČ ZA LOGIN! BEZ OVOGA NE RADI.
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;