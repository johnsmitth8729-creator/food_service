from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from models import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash("Tizimga muvaffaqiyatli kirdingiz!", "success")
            next_page = request.args.get('next')
            if user.is_admin:
                return redirect(next_page or url_for('admin.dashboard'))
            return redirect(next_page or url_for('user.dashboard'))
        else:
            flash("Login yoki parol noto'g'ri", "danger")
            
    return render_template('pages/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash("Parollar mos kelmadi!", "warning")
            return redirect(url_for('auth.register'))
            
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash("Bu login band, iltimos boshqasini tanlang.", "danger")
            return redirect(url_for('auth.register'))
            
        user = User(username=username, role='user')
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        flash("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.", "success")
        return redirect(url_for('auth.login'))
        
    return render_template('pages/register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Tizimdan chiqdingiz.", "info")
    return redirect(url_for('main.index'))
