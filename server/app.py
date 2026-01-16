from flask import Flask, jsonify, send_from_directory # <--- DODATO send_from_directory
from flask_cors import CORS
from flask_session import Session
import redis
import os
from datetime import timedelta, date

# --- IMPORTI RUTA ---
from src.WebApi.userroutes import user_bp
from src.WebApi.courseroutes import course_bp
from src.WebApi.authroutes import auth_bp

# --- IMPORTI BAZE ---
from src.Database.connection.connection import db
from src.Database.repositories.users import User, UserRole

app = Flask(__name__)

# --- 1. KONFIGURACIJA UPLOADA ---
# Ovo pravi apsolutnu putanju do foldera 'uploads' unutar kontejnera (/app/uploads)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- 2. KONFIGURACIJA BAZE I SESIJA ---
db_url = os.environ.get('DATABASE_URL', 'postgresql://admin:password123@db:5432/skola_db')
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Session-based auth sa Redisom
app.config['SECRET_KEY'] = 'super_tajni_kljuc_123'
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://redis:6379')

# -# Dozvoljavamo pristup sa BILO KOJE IP adrese (zvezdica *)
# supports_credentials=True je važno za login (sesije)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

db.init_app(app)
Session(app)

# --- 4. REGISTRACIJA RUTA ---
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(course_bp, url_prefix='/api/courses')

# --- 5. RUTA ZA PRIKAZ SLIKE (OVO JE FALILO!) ---
# Kada React traži: http://localhost:5000/uploads/slika.png
# Flask gleda u folder i vraća fajl.
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- 6. KREIRANJE BAZE I HARDKODOVANJE ---
with app.app_context():
    try:
        db.create_all()
        
        # Provera da li admin postoji
        from werkzeug.security import generate_password_hash
        if not User.query.filter_by(email="admin@skola.rs").first():
            admin_user = User(
                email="admin@skola.rs",
                password_hash=generate_password_hash("admin123"),
                role=UserRole.ADMIN,
                first_name="Aleksa",
                last_name="Admin",
                datum_rodjenja=date(1995, 1, 1),
                pol="Muski",
                drzava="Srbija",
                ulica="Bulevar",
                broj="10"
            )
            db.session.add(admin_user)
            db.session.commit()
            print(">>> Hardkodovani admin spreman: admin@skola.rs / admin123")
            
    except Exception as e:
        print(f"Greska pri inicijalizaciji: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)