from flask import Blueprint, render_template
from flask_login import login_required, current_user
from models.order import Order

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.is_admin:
        return render_template('pages/dashboard.html', is_admin=True)
        
    # Get user's orders sorted by newest
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('pages/dashboard.html', orders=orders)
