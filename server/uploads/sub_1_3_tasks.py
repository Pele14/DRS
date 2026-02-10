from datetime import datetime
from src.Database.connection.connection import db

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Veza: omogućava da kroz task.course pristupimo podacima o kursu
    course = db.relationship('Course', backref=db.backref('tasks', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "deadline": self.deadline.strftime('%Y-%m-%d %H:%M:%S'),
            "course_id": self.course_id
        }

class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False) # Lokacija .py fajla
    grade = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Veze ka studentu i zadatku
    student = db.relationship('User', backref=db.backref('submissions', lazy=True))
    task = db.relationship('Task', backref=db.backref('submissions', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": f"{self.student.first_name} {self.student.last_name}",
            "task_id": self.task_id,
            "file_path": self.file_path,
            "grade": self.grade,
            "comment": self.comment,
            "submitted_at": self.submitted_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class TaskRepository:
    @staticmethod
    def create(task):
        db.session.add(task)
        db.session.commit()
        return task

    @staticmethod
    def get_by_course(course_id):
        return Task.query.filter_by(course_id=course_id).all()

    @staticmethod
    def get_by_id(task_id):
        return Task.query.get(task_id)

class SubmissionRepository:
    @staticmethod
    def create(submission):
        db.session.add(submission)
        db.session.commit()
        return submission

    @staticmethod
    def get_by_task(task_id):
        return Submission.query.filter_by(task_id=task_id).all()

    @staticmethod
    def get_by_id(submission_id):
        return Submission.query.get(submission_id)

    @staticmethod
    def save_changes():
        db.session.commit()