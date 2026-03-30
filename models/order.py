from . import db
from datetime import datetime
from zoneinfo import ZoneInfo

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Kutilmoqda') # Kutilmoqda, Tayyorlanmoqda, Yetkazildi, Bekor qilindi
    address = db.Column(db.Text, nullable=False) # Still keeping address for delivery destination
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Tashkent")))
    
    # Relationship
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    user = db.relationship('User', backref=db.backref('orders', lazy=True))

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    
    # Relationship to Product
    product = db.relationship('Product', lazy=True)
