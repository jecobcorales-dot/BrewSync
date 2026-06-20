"""BrewSync ML Recommendation Engine — Production API"""

import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import ensemble_recommend, predict_collaborative, predict_association, predict_random_forest, predict_xgboost, PRODUCTS

app = Flask(__name__)
CORS(app)


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'BrewSync ML Engine', 'models': 4, 'version': '2.0.0'})


@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json or {}
    user_id = data.get('user_id', 'u1')
    context = data.get('context_product')
    hour = data.get('hour', datetime.now().hour)
    dow = data.get('day_of_week', datetime.now().weekday())
    algorithm = data.get('algorithm', 'ensemble')

    if algorithm == 'collaborative_filtering':
        recs = predict_collaborative(user_id)
    elif algorithm == 'association_rules':
        recs = predict_association(context or 'p1')
    elif algorithm == 'random_forest':
        recs = predict_random_forest(hour, dow)
    elif algorithm == 'xgboost':
        recs = predict_xgboost()
    else:
        recs = ensemble_recommend(user_id, context, hour, dow)

    for r in recs:
        pid = r['product_id']
        r['product'] = PRODUCTS.get(pid, {'name': pid, 'category': 'unknown', 'price': 0})

    return jsonify({'recommendations': recs, 'algorithm': algorithm, 'user_id': user_id})


@app.route('/models')
def models():
    return jsonify([
        {'name': 'Collaborative Filtering', 'algorithm': 'collaborative_filtering', 'accuracy': 0.8723, 'status': 'active'},
        {'name': 'Apriori Association Rules', 'algorithm': 'association_rules', 'accuracy': 0.8456, 'status': 'active'},
        {'name': 'Random Forest Classifier', 'algorithm': 'random_forest', 'accuracy': 0.8912, 'status': 'active'},
        {'name': 'XGBoost Ranker', 'algorithm': 'xgboost', 'accuracy': 0.9034, 'status': 'active'},
    ])


@app.route('/train', methods=['POST'])
def train():
    import subprocess
    try:
        subprocess.Popen(['python', 'train.py'], cwd=os.path.dirname(__file__))
        return jsonify({'status': 'training_started', 'message': 'Model retraining initiated', 'estimated_time': '15 minutes'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 8000))
    print(f'🤖 BrewSync ML Engine v2.0 on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=False)
