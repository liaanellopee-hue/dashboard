import os
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from models import db
from routes.api_dashboard import api_dashboard
from routes.api_orders import api_orders
from routes.api_warehouse import api_warehouse
from routes.api_products import api_products
from routes.api_settings import api_settings

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SECRET_KEY'] = 'dashpro-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

# Register API Blueprints
app.register_blueprint(api_dashboard)
app.register_blueprint(api_orders)
app.register_blueprint(api_warehouse)
app.register_blueprint(api_products)
app.register_blueprint(api_settings)

# Page Routes (Serving HTML Views)
@app.route('/')
@app.route('/dashboard')
def page_dashboard():
    return render_template('dashboard.html', active_page='dashboard')

@app.route('/orders')
def page_orders():
    return render_template('orders.html', active_page='orders')

@app.route('/warehouse')
def page_warehouse():
    return render_template('warehouse.html', active_page='warehouse')

@app.route('/products')
def page_products():
    return render_template('products.html', active_page='products')

@app.route('/settings')
@app.route('/profile')
def page_settings():
    return render_template('settings.html', active_page='settings')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
