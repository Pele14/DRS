import os, smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from multiprocessing import Process
from werkzeug.utils import secure_filename
from src.Database.repositories.tasks import TaskRepository, Task, SubmissionRepository, Submission
from src.Database.repositories.courses import CourseRepository

# KREDA (Promeni SENDER_PASSWORD na App Password!)
SMTP_SERVER, SMTP_PORT = "smtp.gmail.com", 587
SENDER_EMAIL = ""
SENDER_PASSWORD = "" # PROMENI OVO!

def send_bulk_emails(student_emails, course_title, task_title, deadline):
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        for email in student_emails:
            msg = MIMEMultipart()
            msg['From'], msg['To'], msg['Subject'] = SENDER_EMAIL, email, f"Novi zadatak: {course_title}"
            msg.attach(MIMEText(f"Zdravo,\n\nObjavljen je '{task_title}'.\nRok: {deadline}", 'plain'))
            server.sendmail(SENDER_EMAIL, email, msg.as_string())
        server.quit()
    except Exception as e: print(f"Email error: {e}")

class TaskService:
    @staticmethod
    def create_task(data, professor_id):
        course = CourseRepository.get_by_id(data.get('course_id'))
        if not course or course.professor_id != professor_id:
            return {"success": False, "error": "Zabranjeno"}
        
        # Sređivanje datuma (ako stigne kao string sa 'T' iz frontenda)
        dl_str = data.get('deadline').replace('T', ' ')
        new_task = Task(
            title=data.get('title'),
            description=data.get('description'),
            deadline=datetime.strptime(dl_str, '%Y-%m-%d %H:%M') if len(dl_str) < 17 else datetime.strptime(dl_str, '%Y-%m-%d %H:%M:%S'),
            course_id=course.id,
            professor_id=professor_id
        )
        TaskRepository.create(new_task)
        
        emails = [s.email for s in course.students]
        if emails:
            Process(target=send_bulk_emails, args=(emails, course.title, new_task.title, dl_str)).start()
        return {"success": True, "task": new_task.to_dict()}

    @staticmethod
    def submit_solution(task_id, student_id, file):
        if not file.filename.endswith('.py'): return {"success": False}
        
        # Provera da li je već ocenjeno
        existing = Submission.query.filter_by(task_id=task_id, student_id=student_id).first()
        if existing and existing.grade:
            return {"success": False, "error": "Zadatak je već ocenjen, ne možete menjati rad."}

        upload_folder = '/app/uploads'
        if not os.path.exists(upload_folder): os.makedirs(upload_folder)
        
        filename = secure_filename(f"sub_{task_id}_{student_id}_{file.filename}")
        file.save(os.path.join(upload_folder, filename))
        
        SubmissionRepository.create(Submission(student_id=student_id, task_id=task_id, file_path=filename))
        return {"success": True}

    @staticmethod
    def grade_submission(submission_id, data):
        sub = SubmissionRepository.get_by_id(submission_id)
        if not sub: return {"success": False}
        sub.grade, sub.comment = data.get('grade'), data.get('comment')
        SubmissionRepository.save_changes()
        return {"success": True}