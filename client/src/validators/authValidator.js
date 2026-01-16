export const validateRegistration = (data) => {
    if (!data.email.includes('@')) return "Email adresa nije validna.";
    if (data.password.length < 3) return "Lozinka mora imati bar 3 karaktera.";
    if (!data.firstName || !data.lastName) return "Ime i prezime su obavezni.";
    if (!data.datumRodjenja) return "Datum rođenja je obavezan.";
    
    return null; 
};