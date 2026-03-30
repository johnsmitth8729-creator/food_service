from app import create_app
from models import db
from models.product import Product
from models.user import User

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.session.remove()
        db.drop_all()
        db.create_all()

        print("Seeding new database with Auth...")

        admin = User(username='admin', role='admin')
        admin.set_password('123456') # Hardcoded or environment based
        db.session.add(admin)

        user1 = User(username='alisher', role='user')
        user1.set_password('123456')
        db.session.add(user1)

        products = [
            {
                "name": "Osh (Palov)",
                "description": "Mol go'shti, devzira guruchi va qazi bilan.",
                "price": 35000,
                "image": "https://images.unsplash.com/photo-1594246549448-9189b8705f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "category": "Milliy Taomlar"
            },
            {
                "name": "Manti",
                "description": "Bug'da pishgan mazali manti. (1 porsiya 5 dona).",
                "price": 30000,
                "image": "https://images.unsplash.com/photo-1627995874415-e9cc28c9b9ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "category": "Milliy Taomlar"
            },
            {
                "name": "Qozon Kabob",
                "description": "Qo'y go'shti va kartoshkadan tayyorlangan qozon kabob.",
                "price": 45000,
                "image": "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "category": "Milliy Taomlar"
            },
            {
                "name": "Gamburger",
                "description": "2 qavatli mol go'shti kotletlari, pishloq fast-food.",
                "price": 28000,
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "category": "Fast Food"
            },
            {
                "name": "Pepperoni Pitsa",
                "description": "Katta o'lchamli pitsa (32cm), italyancha pepperoni.",
                "price": 65000,
                "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "category": "Fast Food"
            }
        ]

        for p_data in products:
            p = Product(**p_data)
            db.session.add(p)

        db.session.commit()
        print(f"Successfully seeded admin, users, and 5 products.")

if __name__ == '__main__':
    seed_data()
