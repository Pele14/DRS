import os
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
from src.Database.repositories.users import UserRepository
from src.Database.connection.connection import db # Treba nam db za commit

user_bp = Blueprint('user_bp', __name__)

# 1. LISTANJE SVIH (Za dashboard)
@user_bp.route('/', methods=['GET'])
def list_users():
    users = UserRepository.get_all()
    user_list = [user.to_dict() for user in users]
    return jsonify(user_list), 200

# 2. BRISANJE
@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    result = UserRepository.delete(user_id)
    if result:
        return jsonify({"message": "Korisnik obrisan"}), 200
    return jsonify({"error": "Korisnik nije pronadjen"}), 404

# 3. IZMENA PROFILA (OVO JE FALILO)
@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Niste ulogovani"}), 401
    
    user = UserRepository.get_by_id(user_id)
    if not user:
        return jsonify({"error": "Korisnik nije pronađen"}), 404

    # A) Slika
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and file.filename != '':
            filename = secure_filename(f"user_{user_id}_{file.filename}")
            # Osiguravamo putanju
            upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(upload_path)
            # Čuvamo URL do slike u bazi
            user.profile_image = f"http://localhost:5000/uploads/{filename}"

    # B) Tekstualni podaci
    if 'first_name' in request.form: user.first_name = request.form['first_name']
    if 'last_name' in request.form: user.last_name = request.form['last_name']
    if 'ulica' in request.form: user.ulica = request.form['ulica']
    if 'broj' in request.form: user.broj = request.form['broj']
    if 'drzava' in request.form: user.drzava = request.form['drzava']
    if 'pol' in request.form: user.pol = request.form['pol']
    
    if 'datum_rodjenja' in request.form:
         if request.form['datum_rodjenja']:
            user.datum_rodjenja = request.form['datum_rodjenja']

    # C) Čuvanje u bazi
    db.session.commit()
    
    return jsonify({"success": True, "user": user.to_dict()}), 200