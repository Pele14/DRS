from src.Database.repositories.users import UserRepository

class UserService:
    @staticmethod
    def get_all_users():
        users = UserRepository.get_all()
        # Pretvaramo objekte u rečnike (JSON format)
        return [user.to_dict() for user in users]

    @staticmethod
    def delete_user(user_id, current_admin_id):
        if str(user_id) == str(current_admin_id):
            return {"success": False, "error": "Ne možete obrisati sopstveni nalog!"}
            
        success = UserRepository.delete(user_id)
        if success:
            return {"success": True}
        return {"success": False, "error": "Korisnik nije pronađen"}