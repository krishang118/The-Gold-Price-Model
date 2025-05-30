from flask import Flask, jsonify
from flask_cors import CORS 
from api.gold_forecaster import scrape_gold_data, process_and_forecast
app = Flask(__name__)
CORS(app) 
@app.route('/')
def index():
    return jsonify({"message": "Backend is running!"})
@app.route('/forecast')
def get_gold_forecast():
    daily_data, monthly_data = scrape_gold_data()
    if daily_data is None or monthly_data is None:
        return jsonify({"error": "Failed to scrape data."}), 500
    forecast_results = process_and_forecast(daily_data, monthly_data)
    if forecast_results is None:
        return jsonify({"error": "Failed to process data or generate forecast."}), 500
    return jsonify(forecast_results)
if __name__ == '__main__':
    print("Flask app ready to run. Use a WSGI server like Gunicorn to start it.")
