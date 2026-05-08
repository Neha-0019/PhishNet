from flask import Blueprint, request, jsonify
from database.models import db, Feedback
from datetime import datetime

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    scan_id = data.get('scan_id')
    correct_label = data.get('correct_label')
    comment = data.get('user_comment', '')
    
    if not correct_label:
        return jsonify({"error": "correct_label is required"}), 400
        
    feedback = Feedback(
        scan_id=scan_id,
        correct_label=correct_label,
        comment=comment,
        timestamp=datetime.utcnow()
    )
    db.session.add(feedback)
    db.session.commit()
    
    return jsonify({"message": "Feedback recorded"})
