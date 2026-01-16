import os
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from multiprocessing import Process
from flask import Blueprint, request, jsonify, session, send_from_directory
from src.Services.courseService import CourseService
from src.Database.repositories.courses import CourseRepository


course_bp = Blueprint('course_bp', __name__)

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "aleksa.pele003@gmail.com"  
SENDER_PASSWORD = "xykzqcbmpuztpnkv"       

def send_email_notification(target_email, course_title, status):
    """
    Ova funkcija se izvršava u zasebnom PROCESU (u pozadini).
    """
    try:
        print(f"⏳ [PROCES] Povezujem se na Gmail za slanje na: {target_email}...", flush=True)
        
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = target_email
        msg['Subject'] = f"Obaveštenje o kursu: {course_title}"

        if status == 'approved':
            body = f"Poštovani,\n\nVaš zahtev za kurs '{course_title}' je PRIHVAĆEN.\nKurs je sada aktivan i vidljiv studentima.\n\nSrdačan pozdrav,\nAdmin Tim"
        else:
            body = f"Poštovani,\n\nVaš zahtev za kurs '{course_title}' je ODBIJEN.\nKontaktirajte administraciju za više detalja.\n\nSrdačan pozdrav,\nAdmin Tim"

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, target_email, text)
        server.quit()

        print(f"✅ [PROCES USPEO] Email uspešno poslat na {target_email}!", flush=True)

    except Exception as e:
        print(f"❌ [PROCES GREŠKA] Nisam uspeo da pošaljem email: {e}", flush=True)

@course_bp.route('/', methods=['GET'], strict_slashes=False)
def get_courses():
    courses = CourseService.get_courses()
    return jsonify(courses), 200

@course_bp.route('/', methods=['POST'], strict_slashes=False)
def create_course():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Niste ulogovani"}), 401

    data = request.json
    result = CourseService.create_course(data, user_id)

    if result["success"]:
        return jsonify(result), 201
    return jsonify(result), 403

@course_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = CourseRepository.get_by_id(course_id)
    if course:
        return jsonify(course.to_dict()), 200
    return jsonify({"error": "Kurs nije pronađen"}), 404

@course_bp.route('/my-courses', methods=['GET'], strict_slashes=False)
def get_my_courses():
    user_id = session.get('user_id')
    if not user_id: return jsonify({"error": "Niste ulogovani"}), 401
    
    courses = CourseService.get_courses_by_professor(user_id)
    return jsonify(courses), 200 

@course_bp.route('/<int:course_id>/status', methods=['PUT'])
def update_status(course_id):
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id or role != 'admin':
         return jsonify({"error": "Samo admin može menjati status"}), 403
         
    data = request.json
    new_status = data.get('status') 
    
    result = CourseService.update_course_status(course_id, new_status)
    
    if result["success"]:
        course = CourseRepository.get_by_id(course_id)
        if course:
            prof_email = course.professor.email
            course_title = course.title
            p = Process(target=send_email_notification, args=(prof_email, course_title, new_status))
            p.start()

        return jsonify(result), 200
    
    return jsonify(result), 400


@course_bp.route('/<int:course_id>/details', methods=['PUT'])
def update_details(course_id):
    user_id = session.get('user_id')
    course = CourseRepository.get_by_id(course_id)
    if not course or course.professor_id != user_id:
         return jsonify({"error": "Niste vlasnik kursa"}), 403

    data = request.json
    result = CourseService.update_course_details(course_id, data)
    return jsonify(result)

@course_bp.route('/<int:course_id>/upload', methods=['POST'])
def upload_material(course_id):
    user_id = session.get('user_id')
    course = CourseRepository.get_by_id(course_id)
    
    if not course or course.professor_id != user_id:
        return jsonify({"error": "Niste vlasnik kursa"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "Nije poslat fajl"}), 400

    file = request.files['file']
    result = CourseService.upload_material(course_id, file)
    return jsonify(result)

@course_bp.route('/<int:course_id>/students', methods=['POST'])
def add_student(course_id):
    user_id = session.get('user_id')
    course = CourseRepository.get_by_id(course_id)
    
    if not course or course.professor_id != user_id:
        return jsonify({"error": "Niste vlasnik kursa"}), 403

    data = request.json
    email = data.get('email')
    
    result = CourseService.add_student_to_course(course_id, email)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400

@course_bp.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(os.path.join(os.getcwd(), 'uploads'), filename)

@course_bp.route('/student-courses', methods=['GET'], strict_slashes=False)
def get_student_courses():
    user_id = session.get('user_id')
    if not user_id: 
        return jsonify({"error": "Niste ulogovani"}), 401
    
    courses = CourseService.get_courses_for_student(user_id)
    return jsonify(courses), 200