from flask import Blueprint, request, jsonify, session, send_file
from src.Services.taskService import TaskService
from src.Database.repositories.tasks import TaskRepository, SubmissionRepository
import os

task_bp = Blueprint('task_bp', __name__)

@task_bp.route('/create', methods=['POST'])
def create_task():
    user_id = session.get('user_id')
    if not user_id or session.get('role') != 'profesor':
        return jsonify({"error": "Samo profesori mogu kreirati zadatke"}), 403
    result = TaskService.create_task(request.json, user_id)
    return jsonify(result), 201 if result.get("success") else 400

@task_bp.route('/course/<int:course_id>', methods=['GET'])
def get_tasks_by_course(course_id):
    user_id = session.get('user_id')
    role = session.get('role')
    tasks = TaskRepository.get_by_course(course_id, user_id, role)
    # Handle-ujemo i objekte i rečnike
    return jsonify([t if isinstance(t, dict) else t.to_dict() for t in tasks]), 200

@task_bp.route('/<int:task_id>/submit', methods=['POST'])
def submit_solution(task_id):
    user_id = session.get('user_id')
    if not user_id or session.get('role') != 'student':
        return jsonify({"error": "Samo studenti"}), 403
    if 'file' not in request.files:
        return jsonify({"error": "Nije poslat fajl"}), 400
    result = TaskService.submit_solution(task_id, user_id, request.files['file'])
    return jsonify(result), 201 if result.get("success") else 400

@task_bp.route('/<int:task_id>/submissions', methods=['GET'])
def get_submissions(task_id):
    submissions = SubmissionRepository.get_by_task(task_id)
    return jsonify([s.to_dict() for s in submissions]), 200

@task_bp.route('/submission/<int:submission_id>/grade', methods=['PATCH'])
def grade_submission(submission_id):
    if session.get('role') != 'profesor':
        return jsonify({"error": "Zabranjeno"}), 403
    result = TaskService.grade_submission(submission_id, request.json)
    return jsonify(result), 200 if result.get("success") else 400

# NOVA RUTA ZA DOWNLOAD
@task_bp.route('/submission/<int:submission_id>/download', methods=['GET'])
def download_submission(submission_id):
    sub = SubmissionRepository.get_by_id(submission_id)
    if not sub: return "Nema", 404
    # Fajlovi su u /app/uploads/ (Docker putanja)
    path = os.path.join('/app/uploads', sub.file_path)
    return send_file(path, as_attachment=True)