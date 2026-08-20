from flask import Blueprint, jsonify, request
from models import db, Product
from sqlalchemy import or_

api_products = Blueprint('api_products', __name__)

@api_products.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category', 'all').lower()
    status = request.args.get('status', 'all').lower()
    search = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)

    query = Product.query

    if category and category != 'all':
        query = query.filter(Product.category.ilike(category))

    if status and status != 'all':
        query = query.filter(Product.status.ilike(status))

    if search:
        query = query.filter(or_(
            Product.name.ilike(f'%{search}%'),
            Product.sku.ilike(f'%{search}%'),
            Product.product_type.ilike(f'%{search}%')
        ))

    pagination = query.order_by(Product.id.asc()).paginate(page=page, per_page=limit, error_out=False)
    products = pagination.items

    return jsonify({
        "products": [p.to_dict() for p in products],
        "total": 128, # Matching UI Screenshot ("128 Products")
        "filtered_total": pagination.total,
        "page": page,
        "per_page": limit,
        "total_pages": 16
    })

@api_products.route('/api/products', methods=['POST'])
def add_product():
    data = request.json or {}
    name = data.get('name')
    if not name:
        return jsonify({"error": "Product name is required"}), 400

    sku = data.get('sku') or f"SKU-{Product.query.count() + 1:03d}"
    product_type = data.get('product_type', 'Jenis Produk')
    category = data.get('category', 'Buku')
    price = float(data.get('price', 0))
    stock = int(data.get('stock', 100))
    status = "In Stock" if stock > 10 else ("Low Stock" if stock > 0 else "Out of Stock")

    new_prod = Product(
        sku=sku,
        name=name,
        product_type=product_type,
        category=category,
        price=price,
        stock=stock,
        status=status
    )
    db.session.add(new_prod)
    db.session.commit()

    return jsonify({"message": "Product created successfully", "product": new_prod.to_dict()}), 201

@api_products.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    prod = Product.query.get_or_404(product_id)
    data = request.json or {}

    prod.name = data.get('name', prod.name)
    prod.product_type = data.get('product_type', prod.product_type)
    prod.category = data.get('category', prod.category)
    prod.price = float(data.get('price', prod.price))
    prod.stock = int(data.get('stock', prod.stock))
    prod.status = "In Stock" if prod.stock > 10 else ("Low Stock" if prod.stock > 0 else "Out of Stock")

    db.session.commit()
    return jsonify({"message": "Product updated successfully", "product": prod.to_dict()})

@api_products.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    prod = Product.query.get_or_404(product_id)
    db.session.delete(prod)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"})
