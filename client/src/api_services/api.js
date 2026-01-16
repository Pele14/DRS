import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.0.20:5000/api',
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;