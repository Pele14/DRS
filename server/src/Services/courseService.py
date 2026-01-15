import os
from werkzeug.utils import secure_filename
from src.Database.repositories.courses import CourseRepository, Course
from src.Database.repositories.users import UserRepository

# Putanja gde čuvamo fajlove (unutar server foldera)
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class CourseService:
    
    @staticmethod
    def create_course(data, user_id):
        user = UserRepository.get_by_id(user_id)
        if not user or user.role.value == 'student':
            return {"success": False, "error": "Samo profesori mogu kreirati kurseve."}

        new_course = Course(
            title=data.get('title'),
            description=data.get('description'),
            professor_id=user_id
        )
        CourseRepository.create(new_course)
        return {"success": True, "course": new_course.to_dict()}

    @staticmethod
    def get_courses():
        courses = CourseRepository.get_all()
        return [c.to_dict() for c in courses]
    
    @staticmethod
    def get_courses_by_professor(professor_id):
        from src.Database.repositories.courses import CourseRepository
        courses = CourseRepository.get_by_professor(professor_id)
        return [c.to_dict() for c in courses]

    @staticmethod
    def update_course_status(course_id, new_status):
        course = CourseRepository.get_by_id(course_id)
        if not course: return {"success": False, "error": "Kurs nije pronađen"}
        course.status = new_status
        CourseRepository.save_changes()
        return {"success": True}

    # --- NOVO: IZMENA PODATAKA ---
    @staticmethod
    def update_course_details(course_id, data):
        course = CourseRepository.get_by_id(course_id)
        if not course: return {"success": False, "error": "Kurs nije pronađen"}
        
        course.title = data.get('title', course.title)
        course.description = data.get('description', course.description)
        CourseRepository.save_changes()
        return {"success": True, "course": course.to_dict()}

    # --- NOVO: UPLOAD PDF-a ---
    @staticmethod
    def upload_material(course_id, file):
        course = CourseRepository.get_by_id(course_id)
        if not course: return {"success": False, "error": "Kurs nije pronađen"}

        if file:
            filename = secure_filename(f"course_{course_id}_{file.filename}")
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            course.material_link = filename
            CourseRepository.save_changes()
            return {"success": True, "file": filename}
        return {"success": False, "error": "Nema fajla"}

    # --- NOVO: DODAVANJE STUDENTA PO EMAILU ---
    @staticmethod
    def add_student_to_course(course_id, student_email):
        from src.Database.repositories.users import User # Import ovde da izbegnemo kruzni
        
        course = CourseRepository.get_by_id(course_id)
        if not course: return {"success": False, "error": "Kurs nije pronađen"}

        student = User.query.filter_by(email=student_email).first()
        if not student:
            return {"success": False, "error": "Korisnik sa tim emailom ne postoji"}
        
        if student.role.value != 'student':
            return {"success": False, "error": "Ovaj korisnik nije student"}

        if student in course.students:
            return {"success": False, "error": "Student je već na kursu"}

        course.students.append(student)
        CourseRepository.save_changes()
        return {"success": True, "student": f"{student.first_name} {student.last_name}"}


        # --- NOVO: Vraća kurseve na koje je student upisan ---
    @staticmethod
    def get_courses_for_student(student_id):
        from src.Database.repositories.users import UserRepository
        user = UserRepository.get_by_id(student_id)
        
        if not user:
            return []
            
        # Koristimo relaciju 'enrolled_courses' koju smo definisali u modelu
        # Moramo pretvoriti u listu jer je lazy='dynamic'
        return [c.to_dict() for c in user.enrolled_courses]