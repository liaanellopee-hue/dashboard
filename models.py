from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False, default="Lia Vrillia")
    email = db.Column(db.String(120), nullable=False, default="liavrillia229@gmail.com")
    phone = db.Column(db.String(30), nullable=False, default="+62 859-4302-6575")
    role = db.Column(db.String(50), nullable=False, default="Admin")
    avatar_url = db.Column(db.String(255), nullable=True)
    theme = db.Column(db.String(20), nullable=False, default="light") # light, dark, system
    primary_color = db.Column(db.String(20), nullable=False, default="blue") # blue, yellow, red, purple, green, grey
    email_notifications = db.Column(db.Boolean, default=True)
    order_updates = db.Column(db.Boolean, default=True)
    marketing_emails = db.Column(db.Boolean, default=True)
    system_alerts = db.Column(db.Boolean, default=True)
    member_since = db.Column(db.DateTime, default=datetime(2024, 5, 20))
    last_login = db.Column(db.DateTime, default=datetime(2024, 5, 31, 9, 42))
    status = db.Column(db.String(20), default="Active")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "theme": self.theme,
            "primary_color": self.primary_color,
            "email_notifications": self.email_notifications,
            "order_updates": self.order_updates,
            "marketing_emails": self.marketing_emails,
            "system_alerts": self.system_alerts,
            "member_since": self.member_since.strftime("%d %b %Y") if self.member_since else "",
            "last_login": self.last_login.strftime("%d %b %Y, %H:%M AM") if self.last_login else "",
            "status": self.status
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    product_type = db.Column(db.String(100), nullable=False, default="Jenis Produk")
    category = db.Column(db.String(50), nullable=False, default="Buku") # Buku, Merchandise, Pakaian, Catkul
    price = db.Column(db.Float, nullable=False, default=0.0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(50), nullable=False, default="In Stock") # In Stock, Low Stock, Out of Stock
    image_url = db.Column(db.String(255), nullable=True)
    sales_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "sku": self.sku,
            "name": self.name,
            "product_type": self.product_type,
            "category": self.category,
            "price": self.price,
            "stock": self.stock,
            "status": self.status,
            "image_url": self.image_url,
            "sales_count": self.sales_count,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else ""
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), nullable=False, default="Processing") # Completed, Processing, Pending, Cancelled
    payment_method = db.Column(db.String(50), nullable=False, default="Qriss") # Qriss, Debit, Cash, —
    items_count = db.Column(db.Integer, default=1)

    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "order_number": self.order_number,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "order_date": self.order_date.strftime("%d %b %Y") if self.order_date else "",
            "order_time": self.order_date.strftime("%I:%M %p") if self.order_date else "",
            "total_amount": self.total_amount,
            "status": self.status,
            "payment_method": self.payment_method,
            "items_count": self.items_count,
            "items": [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    product_name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Float, nullable=False, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": self.unit_price
        }


class WarehouseLog(db.Model):
    __tablename__ = 'warehouse_logs'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    product_name = db.Column(db.String(150), nullable=False)
    transaction_no = db.Column(db.String(50), nullable=False)
    supplier = db.Column(db.String(100), nullable=False, default="PT. ITB Press")
    type = db.Column(db.String(50), nullable=False, default="Barang Masuk") # Barang Masuk, Barang Return, Stok Diperbarui, Stok Menipis
    quantity = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(50), nullable=False, default="Selesai") # Selesai, Pending
    user_name = db.Column(db.String(100), default="Lia")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    time_ago_str = db.Column(db.String(50), default="1 Jam yang lalu")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "transaction_no": self.transaction_no,
            "supplier": self.supplier,
            "type": self.type,
            "quantity": self.quantity,
            "status": self.status,
            "user_name": self.user_name,
            "date_str": self.created_at.strftime("%d %b %Y") if self.created_at else "",
            "time_ago_str": self.time_ago_str
        }
