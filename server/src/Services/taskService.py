import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from multiprocessing import Process
from werkzeug.utils import secure_filename
from src.Database.repositories.tasks import TaskRepository, Task, SubmissionRepository, Submission
from src.Database.repositories.courses import CourseRepository

# Konfiguracija za mejlove (istu koristi i tvoj drugar u courseroutes)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "aleksa.pele003@gmail.com"  
SENDER_PASSWORD = "xykzqcbmpuztpnkv"

def send_bulk_emails(student_emails, course_title, task_title, deadline):
    """
    Funkcija koja se pokreće u zasebnom PROCESU.
    Prolazi kroz listu studenata i šalje obaveštenja.
    """
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        for email in student_emails:
            msg = MIMEMultipart()
            msg['From'] = SENDER_EMAIL
            msg['To'] = email
            msg['Subject'] = f"Novi zadatak na kursu: {course_title}"

            body = f"Zdravo,\n\nObjavljen je novi zadatak '{task_title}'.\nRok za predaju: {deadline}\n\nSrećan rad!"
            msg.attach(MIMEText(body, 'plain'))
            server.sendmail(SENDER_EMAIL, email, msg.as_string())
        
        server.quit()
        print(f"✅ [PROCES] Mejlovi uspešno poslati za {len(student_emails)} studenata.")
    except Exception as e:
        print(f"❌ [PROCES GREŠKA] Slanje mejlova nije uspelo: {e}")

class TaskService:

    @staticmethod
    def create_task(data, professor_id):
        # 1. Provera da li kurs postoji i da li je profesor vlasnik
        course = CourseRepository.get_by_id(data.get('course_id'))
        if not course or course.professor_id != professor_id:
            return {"success": False, "error": "Nemate dozvolu za kreiranje zadatka na ovom kursu."}

        # 2. Kreiranje zadatka u bazi
        new_task = Task(
            title=data.get('title'),
            description=data.get('description'),
            deadline=data.get('deadline'), # Očekuje se string 'YYYY-MM-DD HH:MM:SS'
            course_id=course.id
        )
        TaskRepository.create(new_task)

        # 3. POKRETANJE ZASEBNOG PROCESA ZA MEJLOVE (10 poena)
        student_emails = [s.email for s in course.students]
        if student_emails:
            p = Process(target=send_bulk_emails, args=(
                student_emails, course.title, new_task.title, data.get('deadline')
            ))
            p.start()

        return {"success": True, "task": new_task.to_dict()}

    @staticmethod
    def submit_solution(task_id, student_id, file):
        # 1. Validacija ekstenzije (samo .py)
        if not file.filename.endswith('.py'):
            return {"success": False, "error": "Dozvoljeni su samo .py fajlovi."}

        # 2. Čuvanje fajla
        filename = secure_filename(f"sub_{task_id}_{student_id}_{file.filename}")
        upload_path = os.path.join('uploads', filename)
        file.save(upload_path)

        # 3. Upis u bazu
        new_submission = Submission(
            student_id=student_id,
            task_id=task_id,
            file_path=filename
        )
        SubmissionRepository.create(new_submission)
        return {"success": True, "submission": new_submission.to_dict()}

    @staticmethod
    def grade_submission(submission_id, data):
        submission = SubmissionRepository.get_by_id(submission_id)
        if not submission:
            return {"success": False, "error": "Predaja nije pronađena."}

        submission.grade = data.get('grade')
        submission.comment = data.get('comment')
        SubmissionRepository.save_changes()
        return {"success": True}