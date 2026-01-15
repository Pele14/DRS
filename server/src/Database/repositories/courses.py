from src.Database.connection.connection import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    professor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # NOVO: Status kursa (pending = zahtev, approved = vidljiv studentima)
    status = db.Column(db.String(20), default='pending') 

    professor = db.relationship('User', backref=db.backref('courses', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status, # Vraćamo i status
            "professor": f"{self.professor.first_name} {self.professor.last_name}",
            "professor_id": self.professor_id
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
    
    # NOVO: Metoda za dohvatanje jednog kursa
    @staticmethod
    def get_by_id(course_id):
        return Course.query.get(course_id)

    @staticmethod
    def get_by_professor(professor_id):
        return Course.query.filter_by(professor_id=professor_id).all()