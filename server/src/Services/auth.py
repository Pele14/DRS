from werkzeug.security import generate_password_hash, check_password_hash
from src.Database.repositories.users import UserRepository, User, UserRole

class AuthService:
    
    @staticmethod
    def login_user(email, password):
        user = UserRepository.get_by_email(email)
        
        if user and check_password_hash(user.password_hash, password):
            return {"success": True, "user": user.to_dict()}
        
        return {"success": False, "error": "Pogrešan email ili lozinka"}

    @staticmethod
    def register_user(data):
        # 1. Provera da li korisnik već postoji
        existing_user = UserRepository.get_by_email(data.get('email'))
        
        # POPRAVKA: Samo proveravamo da li je existing_user različit od None
        if existing_user:
            return {"success": False, "error": "Korisnik sa tim emailom već postoji"}

        # 2. Heširanje lozinke
        hashed_pw = generate_password_hash(data.get('password', 'default123'))

        # 3. Kreiranje objekta
        try:
            # Mapiranje stringa 'admin'/'profesor' u Enum
            role_str = data.get('role', 'student')
            role_enum = UserRole.STUDENT
            if role_str == 'admin': role_enum = UserRole.ADMIN
            elif role_str == 'profesor': role_enum = UserRole.PROFESSOR

            new_user = User(
                email=data.get('email'),
                password_hash=hashed_pw,
                role=role_enum,
                first_name=data.get('firstName'),
                last_name=data.get('lastName'),
                datum_rodjenja=data.get('datumRodjenja'),
                pol=data.get('pol'),
                drzava=data.get('drzava'),
                ulica=data.get('ulica'),
                broj=data.get('broj')
            )

            # 4. Snimanje u bazu
            created_user = UserRepository.create(new_user)
            return {"success": True, "user": created_user.to_dict()}
            
        except Exception as e:
            print(f"GRESKA PRILIKOM REGISTRACIJE: {e}") # Da vidimo u logovima ako pukne
            return {"success": False, "error": str(e)}