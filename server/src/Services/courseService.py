from src.Database.repositories.courses import CourseRepository, Course
from src.Database.repositories.users import UserRepository

class CourseService:
    
    @staticmethod
    def create_course(data, user_id):
        # Provera korisnika
        user = UserRepository.get_by_id(user_id)
        
        # Pazi na poravnanje ove linije:
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
        from src.Database.repositories.courses import CourseRepository # Import unutar metode da izbegnemo kružni import
        courses = CourseRepository.get_by_professor(professor_id)
        return [c.to_dict() for c in courses]
    @staticmethod
    def update_course_status(course_id, new_status):
        # 1. Pronađi kurs
        from src.Database.repositories.courses import CourseRepository
        from src.Database.connection.connection import db
        
        course = CourseRepository.get_by_id(course_id)
        if not course:
            return {"success": False, "error": "Kurs nije pronađen"}
        
        # 2. Promeni status
        course.status = new_status
        db.session.commit() # Čuvamo izmenu
        
        return {"success": True}