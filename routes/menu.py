from flask import Blueprint, render_template, request, jsonify
from models.product import Product

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('/')
def index():
    search_query = request.args.get('q', '')
    category = request.args.get('category', '')

    query = Product.query

    if search_query:
        query = query.filter(Product.name.ilike(f'%{search_query}%'))
    if category:
        query = query.filter(Product.category == category)
        
    products = query.order_by(Product.name).all()
    categories = Product.query.with_entities(Product.category).distinct().all()
    categories = [cat[0] for cat in categories]

    return render_template('pages/menu.html', products=products, categories=categories, current_cat=category, search_query=search_query)

@menu_bp.route('/api/products')
def api_products():
    """Returns products as JSON for potential dynamic UI loading"""
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])
