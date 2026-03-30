from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from functools import wraps
from models import db
from models.user import User
from models.product import Product
from models.order import Order
from models.contact import Contact

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            flash("Kechirasiz, sizda bu sahifaga kirish huquqi yo'q.", "danger")
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/')
@admin_required
def dashboard():
    # Statistics
    total_users = User.query.filter_by(role='user').count()
    total_orders = Order.query.count()
    total_income = sum(o.total_price for o in Order.query.all())
    pending_orders = Order.query.filter_by(status='Kutilmoqda').count()
    
    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    
    return render_template('pages/admin_dashboard.html', 
        users_count=total_users, 
        orders_count=total_orders, 
        income=total_income, 
        pending=pending_orders,
        recent=recent_orders
    )

@admin_bp.route('/users')
@admin_required
def users():
    all_users = User.query.filter_by(role='user').order_by(User.id.desc()).all()
    return render_template('pages/admin_users.html', users=all_users)

@admin_bp.route('/users/delete/<int:user_id>', methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.role != 'admin':
        db.session.delete(user)
        db.session.commit()
        flash('Foydalanuvchi o\'chirildi.', 'success')
    return redirect(url_for('admin.users'))

@admin_bp.route('/products', methods=['GET', 'POST'])
@admin_required
def products():
    if request.method == 'POST':
        # Add product functionality
        new_prod = Product(
            name=request.form.get('name'),
            description=request.form.get('description'),
            price=float(request.form.get('price')),
            image=request.form.get('image'),
            category=request.form.get('category')
        )
        db.session.add(new_prod)
        db.session.commit()
        flash('Mahsulot qo\'shildi!', 'success')
        return redirect(url_for('admin.products'))
        
    all_products = Product.query.order_by(Product.id.desc()).all()
    return render_template('pages/admin_products.html', products=all_products)

@admin_bp.route('/products/delete/<int:prod_id>', methods=['POST'])
@admin_required
def delete_product(prod_id):
    prod = Product.query.get_or_404(prod_id)
    db.session.delete(prod)
    db.session.commit()
    flash('Mahsulot o\'chirildi.', 'success')
    return redirect(url_for('admin.products'))

@admin_bp.route('/orders')
@admin_required
def orders():
    all_orders = Order.query.order_by(Order.created_at.desc()).all()
    return render_template('pages/admin_orders.html', orders=all_orders)

@admin_bp.route('/orders/status/<int:order_id>', methods=['POST'])
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status')
    if new_status in ['Kutilmoqda', 'Tayyorlanmoqda', 'Yetkazildi', 'Bekor qilindi']:
        order.status = new_status
        db.session.commit()
        flash('Buyurtma holati yangilandi.', 'success')
    return redirect(url_for('admin.orders'))

@admin_bp.route('/contacts')
@admin_required
def contacts():
    msgs = Contact.query.order_by(Contact.created_at.desc()).all()
    return render_template('pages/admin_contacts.html', contacts=msgs)
