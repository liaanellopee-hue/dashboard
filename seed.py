from app import app, db
from models import User, Product, Order, OrderItem, WarehouseLog
from datetime import datetime, timedelta
import random

def seed_database():
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("Creating initial user profile...")
        user = User(
            full_name="Lia Vrillia",
            email="liavrillia229@gmail.com",
            phone="+62 859-4302-6575",
            role="Admin",
            avatar_url="",
            theme="light",
            primary_color="blue",
            email_notifications=True,
            order_updates=True,
            marketing_emails=True,
            system_alerts=True,
            member_since=datetime(2024, 5, 20),
            last_login=datetime(2024, 5, 31, 9, 42),
            status="Active"
        )
        db.session.add(user)

        print("Creating products catalog...")
        products_data = [
            # Top sellers on dashboard
            {"sku": "SKU-001", "name": "Wireless Headphone", "product_type": "Electronics", "category": "Merchandise", "price": 450000, "stock": 50, "status": "In Stock", "sales_count": 328},
            {"sku": "SKU-002", "name": "Smart Watch", "product_type": "Electronics", "category": "Merchandise", "price": 850000, "stock": 35, "status": "In Stock", "sales_count": 214},
            {"sku": "SKU-003", "name": "Mechanical Keyboard", "product_type": "Electronics", "category": "Merchandise", "price": 650000, "stock": 42, "status": "In Stock", "sales_count": 189},
            {"sku": "SKU-004", "name": "Wireless Mouse", "product_type": "Electronics", "category": "Merchandise", "price": 250000, "stock": 80, "status": "In Stock", "sales_count": 163},
            {"sku": "SKU-005", "name": "USB-C Hub", "product_type": "Electronics", "category": "Merchandise", "price": 180000, "stock": 60, "status": "In Stock", "sales_count": 142},
            # Books from Products Page Wireframe
            {"sku": "SKU-006", "name": "Pengantar Perencanaan Perkotaan", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 120000, "stock": 100, "status": "In Stock", "sales_count": 85},
            {"sku": "SKU-007", "name": "Pengantar Praktik Penggunaan Latex", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 95000, "stock": 100, "status": "In Stock", "sales_count": 76},
            {"sku": "SKU-008", "name": "Pengantar Prinsip Keberlanjutan", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 110000, "stock": 100, "status": "In Stock", "sales_count": 64},
            {"sku": "SKU-009", "name": "Pengantar Teknik Geofisika", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 130000, "stock": 100, "status": "In Stock", "sales_count": 52},
            {"sku": "SKU-010", "name": "Pengantar Geofisika", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 105000, "stock": 100, "status": "In Stock", "sales_count": 40},
            {"sku": "SKU-011", "name": "Pemodelan dan Inversi Waktu Tempuh Gelombang Seismik", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 145000, "stock": 100, "status": "In Stock", "sales_count": 38},
            {"sku": "SKU-012", "name": "Pemodelan dan Simulasi Berbasis Agen untuk Sistem Sosial", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 150000, "stock": 100, "status": "In Stock", "sales_count": 45},
            {"sku": "SKU-013", "name": "Pemodelan Numerik Deformasi Kerak", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 135000, "stock": 100, "status": "In Stock", "sales_count": 29},
            {"sku": "SKU-014", "name": "Pemodelan Interaktif Sistem Agen", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 125000, "stock": 100, "status": "In Stock", "sales_count": 31},
            {"sku": "SKU-015", "name": "Penambatan Molekul", "product_type": "Buku Perkuliahan", "category": "Buku", "price": 160000, "stock": 100, "status": "In Stock", "sales_count": 92},
            # Merchandise / Apparel / Catkul
            {"sku": "SKU-016", "name": "Kaos ITB", "product_type": "Pakaian Kampus", "category": "Pakaian", "price": 85000, "stock": 244, "status": "In Stock", "sales_count": 120},
            {"sku": "SKU-017", "name": "Stok Ganci ITB", "product_type": "Merchandise", "category": "Merchandise", "price": 25000, "stock": 1256, "status": "In Stock", "sales_count": 450},
            {"sku": "SKU-018", "name": "Stok Tumblr ITB", "product_type": "Merchandise", "category": "Merchandise", "price": 95000, "stock": 8, "status": "Low Stock", "sales_count": 90},
            {"sku": "SKU-019", "name": "Catkul ITB", "product_type": "Catatan Kuliah", "category": "Catkul", "price": 45000, "stock": 100, "status": "In Stock", "sales_count": 110},
        ]

        products_dict = {}
        for p in products_data:
            prod = Product(**p)
            db.session.add(prod)
            db.session.flush()
            products_dict[prod.sku] = prod

        print("Creating orders...")
        customers = [
            {"name": "Lia", "email": "lia@gmail.com"},
            {"name": "Caca", "email": "caca@gmail.com"},
            {"name": "Kinan", "email": "kinan@gmail.com"},
            {"name": "Neli", "email": "neli@gmail.com"},
            {"name": "Namacustomer", "email": "akungmail@gmail.com"},
            {"name": "Budi Santoso", "email": "budi@gmail.com"},
            {"name": "Siti Rahma", "email": "siti@gmail.com"},
            {"name": "Andi Wijaya", "email": "andi@gmail.com"}
        ]

        statuses = ["Completed", "Processing", "Pending", "Cancelled"]
        status_weights = [0.67, 0.20, 0.05, 0.08]
        payments = ["Qriss", "Debit", "Cash", "—"]

        # Specific recent orders matching Dashboard Wireframe (#ORD-00124 to #ORD-00121)
        recent_orders_spec = [
            {"order_number": "#ORD-00124", "customer_name": "Lia", "customer_email": "lia@gmail.com", "total": 850000, "status": "Completed", "payment": "Debit", "date": datetime(2026, 5, 20, 10, 15)},
            {"order_number": "#ORD-00123", "customer_name": "Caca", "customer_email": "caca@gmail.com", "total": 1250000, "status": "Processing", "payment": "Qriss", "date": datetime(2026, 5, 20, 9, 45)},
            {"order_number": "#ORD-00122", "customer_name": "Kinan", "customer_email": "kinan@gmail.com", "total": 560000, "status": "Pending", "payment": "Cash", "date": datetime(2026, 5, 20, 9, 10)},
            {"order_number": "#ORD-00121", "customer_name": "Neli", "customer_email": "neli@gmail.com", "total": 980000, "status": "Completed", "payment": "Debit", "date": datetime(2026, 5, 20, 8, 30)},
        ]

        for spec in recent_orders_spec:
            order = Order(
                order_number=spec["order_number"],
                customer_name=spec["customer_name"],
                customer_email=spec["customer_email"],
                order_date=spec["date"],
                total_amount=spec["total"],
                status=spec["status"],
                payment_method=spec["payment"],
                items_count=random.randint(1, 3)
            )
            db.session.add(order)
            db.session.flush()
            # Add an order item
            item = OrderItem(
                order_id=order.id,
                product_id=products_dict["SKU-001"].id,
                product_name=products_dict["SKU-001"].name,
                quantity=1,
                unit_price=spec["total"]
            )
            db.session.add(item)

        # Orders for Orders Page (#ORD-00101 to #ORD-00120)
        base_date = datetime(2026, 7, 22, 9, 0)
        for i in range(1, 21):
            st = random.choices(statuses, weights=status_weights)[0]
            pay = random.choice(payments) if st != "Cancelled" else "—"
            cust = random.choice(customers)
            ord_no = f"#ORD-00{120 - i:03d}"
            tot = random.choice([100000, 150000, 200000, 350000, 500000, 850000])

            order = Order(
                order_number=ord_no,
                customer_name=cust["name"],
                customer_email=cust["email"],
                order_date=base_date - timedelta(hours=i*2),
                total_amount=tot,
                status=st,
                payment_method=pay,
                items_count=random.randint(1, 4)
            )
            db.session.add(order)

        print("Creating warehouse transaction logs...")
        # 8 Inbound logs matching Warehouse table Wireframe
        for i in range(8):
            log = WarehouseLog(
                product_name="Buku",
                transaction_no="08889762",
                supplier="PT. ITB Press",
                type="Barang Masuk",
                quantity=100,
                status="Selesai",
                user_name="Lia",
                created_at=datetime(2026, 8, 17),
                time_ago_str="17 Agu 2026"
            )
            db.session.add(log)

        # Recent activities feed on warehouse page
        activities_data = [
            {"product_name": "Kaos ITB", "type": "Barang Masuk", "quantity": 25, "time_ago": "1 Jam yang lalu", "supplier": "PT. ITB Press"},
            {"product_name": "Buku ITB", "type": "Barang Return", "quantity": 4, "time_ago": "1 Jam yang lalu", "supplier": "PT. ITB Press"},
            {"product_name": "Stok Ganci", "type": "Stok Diperbarui", "quantity": 1256, "time_ago": "1 Jam yang lalu", "supplier": "Internal"},
            {"product_name": "Stok Tumblr", "type": "Stok Menipis", "quantity": 8, "time_ago": "1 Jam yang lalu", "supplier": "Internal"}
        ]
        for act in activities_data:
            wlog = WarehouseLog(
                product_name=act["product_name"],
                transaction_no=f"TRX-{random.randint(1000,9999)}",
                supplier=act["supplier"],
                type=act["type"],
                quantity=act["quantity"],
                status="Selesai",
                user_name="Lia",
                created_at=datetime.utcnow(),
                time_ago_str=act["time_ago"]
            )
            db.session.add(wlog)

        db.session.commit()
        print("Database successfully seeded with realistic DashPro wireframe data!")

if __name__ == "__main__":
    seed_database()
