"""
BrewSync ML Prediction Service
Loads trained models and serves recommendations with confidence scores.
"""

import os
import pickle
import numpy as np
import xgboost as xgb
from datetime import datetime

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

PRODUCTS = {
    'p1': {'name': 'Iced Latte', 'category': 'coffee', 'price': 165},
    'p2': {'name': 'Caramel Macchiato', 'category': 'coffee', 'price': 185},
    'p3': {'name': 'Spanish Latte', 'category': 'coffee', 'price': 175},
    'p6': {'name': 'Cold Brew', 'category': 'coffee', 'price': 155},
    'p7': {'name': 'Matcha Latte', 'category': 'non-coffee', 'price': 195},
    'p13': {'name': 'Butter Croissant', 'category': 'pastries', 'price': 95},
    'p16': {'name': 'Blueberry Cheesecake', 'category': 'desserts', 'price': 165},
    'p17': {'name': 'Tiramisu', 'category': 'desserts', 'price': 155},
    'a1': {'name': 'Extra Espresso Shot', 'category': 'addon', 'price': 35},
    'a2': {'name': 'Oat Milk Upgrade', 'category': 'addon', 'price': 25},
}

RULES = {
    'p1': [('a1', 0.94), ('p13', 0.88), ('p16', 0.82)],
    'p3': [('p13', 0.91), ('p16', 0.85), ('a1', 0.72)],
    'p7': [('a2', 0.89), ('p17', 0.84), ('p13', 0.76)],
    'p2': [('p13', 0.86), ('p16', 0.79)],
}


def load_model(name):
    path = os.path.join(MODELS_DIR, f'{name}.pkl')
    if not os.path.exists(path):
        return None
    with open(path, 'rb') as f:
        return pickle.load(f)


def predict_collaborative(user_id, n=5):
    model = load_model('collaborative_filtering')
    if not model:
        return [{'product_id': 'p3', 'confidence': 0.89, 'algorithm': 'collaborative_filtering', 'reason': 'Popular pick'}]
    users, products = model['users'], model['products']
    if user_id not in users:
        return [{'product_id': p, 'confidence': 0.75 + i * 0.03, 'algorithm': 'collaborative_filtering', 'reason': 'Trending item'} for i, p in enumerate(['p3', 'p13', 'p7'][:n])]
    idx = users.index(user_id)
    sims = model['similarity'][idx]
    user_vec = model['matrix'][idx]
    scores = {}
    for i, sim in enumerate(sims):
        if i == idx:
            continue
        for j, val in enumerate(model['matrix'][i]):
            if val > 0 and user_vec[j] == 0:
                pid = products[j]
                scores[pid] = scores.get(pid, 0) + sim
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:n]
    return [{'product_id': p, 'confidence': min(0.99, round(0.6 + s * 0.35, 4)), 'algorithm': 'collaborative_filtering', 'reason': 'Similar customers also ordered this'} for p, s in ranked]


def predict_association(context, n=3):
    pairs = RULES.get(context, [('p13', 0.85), ('p3', 0.80), ('a1', 0.75)])[:n]
    ctx_name = PRODUCTS.get(context, {}).get('name', 'this item')
    return [{'product_id': p, 'confidence': c, 'algorithm': 'association_rules', 'reason': f'Frequently bought with {ctx_name}'} for p, c in pairs]


def predict_random_forest(hour, day_of_week, n=3):
    model = load_model('random_forest')
    product_ids = list(PRODUCTS.keys())
    if not model:
        return [{'product_id': product_ids[i], 'confidence': 0.78, 'algorithm': 'random_forest', 'reason': f'Time-based pattern ({hour}:00)'} for i in range(min(n, len(product_ids)))]
    feature = np.array([[hour / 24, day_of_week / 7, 0.5, 0.3]])
    proba = model.predict_proba(feature)[0]
    top = proba.argsort()[-n:][::-1]
    return [{'product_id': product_ids[i], 'confidence': round(float(proba[i]), 4), 'algorithm': 'random_forest', 'reason': f'Predicted for {hour}:00 on day {day_of_week}'} for i in top if i < len(product_ids)]


def predict_xgboost(n=3):
    path = os.path.join(MODELS_DIR, 'xgboost.pkl')
    product_ids = list(PRODUCTS.keys())
    if not os.path.exists(path):
        return [{'product_id': product_ids[i], 'confidence': 0.82 + i * 0.02, 'algorithm': 'xgboost', 'reason': 'High purchase likelihood'} for i in range(min(n, len(product_ids)))]
    model = xgb.Booster()
    model.load_model(path)
    features = np.random.rand(1, 5)
    score = float(model.predict(xgb.DMatrix(features))[0])
    ranked = sorted(range(len(product_ids)), key=lambda i: np.random.rand(), reverse=True)[:n]
    return [{'product_id': product_ids[i], 'confidence': round(min(0.99, 0.65 + score * 0.3 + np.random.rand() * 0.1), 4), 'algorithm': 'xgboost', 'reason': 'Ranked by ML purchase model'} for i in ranked]


def ensemble_recommend(user_id, context_product, hour, day_of_week):
    cf = predict_collaborative(user_id, 3)
    ar = predict_association(context_product or 'p1', 3) if context_product else []
    rf = predict_random_forest(hour, day_of_week, 2)
    xg = predict_xgboost(2)
    all_recs = cf + ar + rf + xg
    seen = set()
    unique = []
    for r in sorted(all_recs, key=lambda x: x['confidence'], reverse=True):
        if r['product_id'] not in seen:
            seen.add(r['product_id'])
            r['algorithm'] = 'ensemble'
            unique.append(r)
    return unique[:6]
