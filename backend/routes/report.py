from flask import Blueprint, request, jsonify
from database.models import db, Report
from datetime import datetime

report_bp = Blueprint('report', __name__)

@report_bp.route('/report', methods=['POST'])
def report_url():
    data = request.json
    url = data.get('url')
    reported_by = data.get('reported_by', 'Anonymous')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
        
    report = Report(
        url=url,
        reported_by=reported_by,
        timestamp=datetime.utcnow()
    )
    db.session.add(report)
    db.session.commit()
    
    return jsonify({"message": "URL reported successfully"})
