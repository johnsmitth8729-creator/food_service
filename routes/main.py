from flask import Blueprint, render_template, request, flash, redirect, url_for
from models import db
from models.contact import Contact

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    from models.product import Product
    featured_products = Product.query.limit(4).all()
    return render_template('pages/index.html', featured=featured_products)

@main_bp.route('/about')
def about():
    return render_template('pages/about.html')

@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        phone = request.form.get('contact')
        message = request.form.get('message')
        
        new_msg = Contact(name=name, phone=phone, message=message)
        db.session.add(new_msg)
        db.session.commit()
        
        flash("Xabaringiz qabul qilindi! Tez orada aloqaga chiqamiz.", "success")
        return redirect(url_for('main.contact'))
        
    return render_template('pages/contact.html')
