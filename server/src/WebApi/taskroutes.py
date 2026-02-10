from flask import Blueprint, request, jsonify, session
from src.Services.taskService import TaskService
from src.Database.repositories.tasks import TaskRepository, SubmissionRepository

task_bp = Blueprint('task_bp', __name__)

# 1. Kreiranje zadatka (Samo profesor)
@task_bp.route('/create', methods=['POST'])
def create_task():
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id or role != 'profesor':
        return jsonify({"error": "Samo profesori mogu kreirati zadatke"}), 403

    data = request.json
    result = TaskService.create_task(data, user_id)
    
    if result["success"]:
        return jsonify(result), 201
    return jsonify(result), 400

# 2. Listanje zadataka za određeni kurs
@task_bp.route('/course/<int:course_id>', methods=['GET'])
def get_tasks_by_course(course_id):
    tasks = TaskRepository.get_by_course(course_id)
    return jsonify([t.to_dict() for t in tasks]), 200

# 3. Predaja rešenja (Samo student)
@task_bp.route('/<int:task_id>/submit', methods=['POST'])
def submit_solution(task_id):
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id or role != 'student':
        return jsonify({"error": "Samo studenti mogu predavati rešenja"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "Nije poslat fajl"}), 400

    file = request.files['file']
    result = TaskService.submit_solution(task_id, user_id, file)
    
    if result["success"]:
        return jsonify(result), 201
    return jsonify(result), 400

# 4. Pregled svih predaja za jedan zadatak (Samo profesor)
@task_bp.route('/<int:task_id>/submissions', methods=['GET'])
def get_submissions(task_id):
    # Ovde bi idealno bilo proveriti da li je ulogovani profesor vlasnik kursa
    submissions = SubmissionRepository.get_by_task(task_id)
    return jsonify([s.to_dict() for s in submissions]), 200

# 5. Ocenjivanje predaje (Samo profesor)
@task_bp.route('/submission/<int:submission_id>/grade', methods=['PATCH'])
def grade_submission(submission_id):
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id or role != 'profesor':
        return jsonify({"error": "Nemate ovlašćenja za ocenjivanje"}), 403

    data = request.json
    result = TaskService.grade_submission(submission_id, data)
    
    if result["success"]:
        return jsonify({"message": "Uspešno ocenjeno"}), 200
    return jsonify(result), 400