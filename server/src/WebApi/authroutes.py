from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from src.Database.repositories.users import UserRepository, User, UserRole
from src.Database.connection.connection import db

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'], strict_slashes=False)
def register():
    try:
        data = request.json
        print(f"DEBUG REGISTER: {data}", flush=True) # Da vidimo šta stiže

        email = data.get('email')
        password = data.get('password')
        if UserRepository.get_by_email(email):
            return jsonify({"error": "Email već postoji"}), 400
        first_name = data.get('firstName') or data.get('first_name')
        last_name = data.get('lastName') or data.get('last_name')
        ulica = data.get('ulica')
        broj = data.get('broj')
        drzava = data.get('drzava')
        pol = data.get('pol')
        datum_rodjenja = data.get('datumRodjenja')
        if datum_rodjenja == '': 
            datum_rodjenja = None

        role_str = data.get('role', 'student')
        if role_str == 'admin': role_enum = UserRole.ADMIN
        elif role_str == 'profesor': role_enum = UserRole.PROFESSOR
        else: role_enum = UserRole.STUDENT


        new_user = User(
            email=email,
            password_hash=generate_password_hash(password),
            role=role_enum,
            first_name=first_name,
            last_name=last_name,
            ulica=ulica,
            broj=broj,
            drzava=drzava,
            pol=pol,
            datum_rodjenja=datum_rodjenja,
            profile_image=None
        )
        
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Uspešna registracija"}), 201

    except Exception as e:
        print(f"GRESKA REGISTRACIJA: {str(e)}", flush=True)
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'], strict_slashes=False)
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if isinstance(email, dict):
        password = email.get('password')
        email = email.get('email')

    user = UserRepository.get_by_email(email)

    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        session['role'] = user.role.value if hasattr(user.role, 'value') else user.role
        return jsonify({"message": "Uspesno logovanje", "role": session['role']}), 200
    
    return jsonify({"error": "Pogresni podaci"}), 401

@auth_bp.route('/logout', methods=['POST'], strict_slashes=False)
def logout():
    session.clear()
    return jsonify({"message": "Uspesno odjavljen"}), 200

@auth_bp.route('/me', methods=['GET'], strict_slashes=False)
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(None), 200
    
    user = UserRepository.get_by_id(user_id)
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify(None), 200