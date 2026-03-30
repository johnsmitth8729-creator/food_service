from flask import Flask
from flask_wtf.csrf import CSRFProtect
from flask_login import LoginManager
from config import Config
from models import db
from models.user import User

csrf = CSRFProtect()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    login_manager.login_message = 'Iltimos, avval tizimga kiring.'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register Blueprints
    from routes.main import main_bp
    from routes.menu import menu_bp
    from routes.orders import orders_bp
    from routes.auth import auth_bp
    from routes.user import user_bp
    from routes.admin import admin_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(menu_bp, url_prefix='/menu')
    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
