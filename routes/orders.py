from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from models import db
from models.order import Order, OrderItem
from models.product import Product
import json

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/cart')
@login_required
def cart():
    return render_template('pages/cart.html')

@orders_bp.route('/checkout', methods=['POST'])
@login_required
def checkout():
    address = request.form.get('address')
    cart_data = request.form.get('cart_data') 
    
    if not cart_data:
        flash('Savatchangiz bo\'sh!', 'danger')
        return redirect(url_for('orders.cart'))

    try:
        items = json.loads(cart_data)
        if not items:
            flash('Savatchangiz bo\'sh!', 'danger')
            return redirect(url_for('orders.cart'))

        total_price = 0
        for item in items:
            product = Product.query.get(item['id'])
            if product:
                quantity = int(item['quantity'])
                total_price += product.price * quantity

        new_order = Order(
            user_id=current_user.id,
            address=address,
            total_price=total_price,
            status='Kutilmoqda'
        )
        db.session.add(new_order)
        db.session.flush()

        for item in items:
            product = Product.query.get(item['id'])
            if product:
                quantity = int(item['quantity'])
                order_item = OrderItem(order_id=new_order.id, product_id=product.id, quantity=quantity)
                db.session.add(order_item)

        db.session.commit()
        flash('Buyurtma qabul qilindi. Tez orada yetkazib beramiz!', 'success')
        return redirect(url_for('user.dashboard') + '?order=success')

    except Exception as e:
        db.session.rollback()
        flash('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.', 'danger')
        print(f"Checkout Error: {e}")
        return redirect(url_for('orders.cart'))
