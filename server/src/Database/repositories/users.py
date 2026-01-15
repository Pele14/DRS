from datetime import datetime
import enum
from src.Database.connection.connection import db 

class UserRole(enum.Enum):
    ADMIN = "admin"
    PROFESSOR = "profesor"
    STUDENT = "student"

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    # OVI MORAJU BITI POPUNJENI (To je OK)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)
    
    # --- PROMENA: OVO SVE MORA BITI 'True' DA NE PUCA ---
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    datum_rodjenja = db.Column(db.Date, nullable=True)
    pol = db.Column(db.String(10), nullable=True)
    drzava = db.Column(db.String(50), nullable=True)
    ulica = db.Column(db.String(100), nullable=True)
    broj = db.Column(db.String(10), nullable=True)
    # ----------------------------------------------------
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    profile_image = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role.value if hasattr(self.role, 'value') else self.role,
            "datum_rodjenja": str(self.datum_rodjenja) if self.datum_rodjenja else None,
            "pol": self.pol,
            "drzava": self.drzava,
            "ulica": self.ulica,
            "broj": self.broj,
            "profile_image": self.profile_image
        }

class UserRepository:
    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def create(user):
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def get_all():
        return User.query.all()

    @staticmethod
    def delete(user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False