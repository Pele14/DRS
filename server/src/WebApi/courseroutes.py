from flask import Blueprint, request, jsonify, session
from src.Services.courseService import CourseService
from src.Database.repositories.courses import CourseRepository

course_bp = Blueprint('course_bp', __name__)

# --- DODATO strict_slashes=False DA SPREČIMO 308 GREŠKU ---
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
    if not user_id:
        return jsonify({"error": "Niste ulogovani"}), 401
    
    courses = CourseService.get_courses_by_professor(user_id)
    return jsonify(courses), 200 

@course_bp.route('/<int:course_id>/status', methods=['PUT'])
def update_status(course_id):
    # Provera da li je Admin (u sesiji)
    user_id = session.get('user_id')
    if not user_id:
         return jsonify({"error": "Niste ulogovani"}), 401
         
    data = request.json
    status = data.get('status') # 'approved' ili 'rejected'
    
    result = CourseService.update_course_status(course_id, status)
    if result["success"]:
        return jsonify(result), 200
    return jsonify(result), 400