from flask import Blueprint, jsonify
from models import db, WarehouseLog, Product

api_warehouse = Blueprint('api_warehouse', __name__)

@api_warehouse.route('/api/warehouse/stats', methods=['GET'])
def get_warehouse_stats():
    # Matching Warehouse wireframe:
    # Total Stok: 2.456 (Semua barang tersedia)
    # Barang Masuk: 2.456 (Bulan ini)
    # Barang Return: 23 (Bulan ini)
    # Total Produk: 342 (SKU aktif)
    # Total Produk (Low Stock warning): 256 (SKU aktif)
    return jsonify({
        "total_stock": {"value": "2.456", "subtext": "Semua barang tersedia"},
        "barang_masuk": {"value": "2.456", "subtext": "Bulan ini"},
        "barang_return": {"value": "23", "subtext": "Bulan ini"},
        "total_produk": {"value": "342", "subtext": "SKU aktif"},
        "warning_produk": {"value": "256", "subtext": "SKU aktif"}
    })

@api_warehouse.route('/api/warehouse/inbound', methods=['GET'])
def get_inbound_goods():
    logs = WarehouseLog.query.filter_by(type="Barang Masuk").limit(8).all()
    return jsonify([l.to_dict() for l in logs])

@api_warehouse.route('/api/warehouse/stock-summary', methods=['GET'])
def get_stock_summary():
    # Donut chart data matching Ringkasan Stok Wireframe
    categories = [
        {"category": "Merchandise", "total_stock": 1256, "percentage": 54, "color": "#3B82F6"}, # Blue
        {"category": "Buku", "total_stock": 856, "percentage": 35, "color": "#10B981"},        # Green
        {"category": "Pakaian", "total_stock": 244, "percentage": 10, "color": "#F59E0B"},     # Orange/Yellow
        {"category": "Catkul", "total_stock": 100, "percentage": 4, "color": "#EF4444"}        # Red
    ]
    return jsonify({
        "total_all_stock": "2.456",
        "categories": categories
    })

@api_warehouse.route('/api/warehouse/activities', methods=['GET'])
def get_recent_activities():
    activities = WarehouseLog.query.order_by(WarehouseLog.id.desc()).limit(4).all()
    return jsonify([a.to_dict() for a in activities])
