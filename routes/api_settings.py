from flask import Blueprint, jsonify, request
from models import db, User

api_settings = Blueprint('api_settings', __name__)

@api_settings.route('/api/settings', methods=['GET'])
def get_settings():
    user = User.query.first()
    if not user:
        user = User()
        db.session.add(user)
        db.session.commit()
    return jsonify(user.to_dict())

@api_settings.route('/api/settings/profile', methods=['PUT'])
def update_profile():
    user = User.query.first()
    data = request.json or {}

    user.full_name = data.get('full_name', user.full_name)
    user.email = data.get('email', user.email)
    user.phone = data.get('phone', user.phone)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": user.to_dict()})

@api_settings.route('/api/settings/preferences', methods=['PUT'])
def update_preferences():
    user = User.query.first()
    data = request.json or {}

    user.email_notifications = data.get('email_notifications', user.email_notifications)
    user.order_updates = data.get('order_updates', user.order_updates)
    user.marketing_emails = data.get('marketing_emails', user.marketing_emails)
    user.system_alerts = data.get('system_alerts', user.system_alerts)

    db.session.commit()
    return jsonify({"message": "Preferences updated successfully", "user": user.to_dict()})

@api_settings.route('/api/settings/appearance', methods=['PUT'])
def update_appearance():
    user = User.query.first()
    data = request.json or {}

    user.theme = data.get('theme', user.theme)
    user.primary_color = data.get('primary_color', user.primary_color)

    db.session.commit()
    return jsonify({"message": "Appearance settings updated successfully", "user": user.to_dict()})
