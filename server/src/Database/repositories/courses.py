from src.Database.connection.connection import db

# 1. TABELA POVEZIVANJA (Student <-> Kurs)
enrollments = db.Table('enrollments',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True)
)

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    professor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    status = db.Column(db.String(20), default='pending') 
    
    # 2. NOVO: Putanja do PDF fajla
    material_link = db.Column(db.String(255), nullable=True)

    professor = db.relationship('User', backref=db.backref('courses', lazy=True))
    
    # 3. NOVO: Lista studenata na kursu
    students = db.relationship('User', secondary=enrollments, backref=db.backref('enrolled_courses', lazy='dynamic'))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "professor": f"{self.professor.first_name} {self.professor.last_name}",
            "professor_id": self.professor_id,
            "material_link": self.material_link, # Vraćamo link fajla
            # Vraćamo listu studenata (samo imena i emailovi)
            "students": [{"id": s.id, "name": f"{s.first_name} {s.last_name}", "email": s.email} for s in self.students]
        }

class CourseRepository:
    @staticmethod
    def create(course):
        db.session.add(course)
        db.session.commit()
        return course

    @staticmethod
    def get_all():
        return Course.query.all()
    
    @staticmethod
    def get_by_id(course_id):
        return Course.query.get(course_id)

    @staticmethod
    def get_by_professor(professor_id):
        return Course.query.filter_by(professor_id=professor_id).all()
        
    @staticmethod
    def save_changes():
        db.session.commit()