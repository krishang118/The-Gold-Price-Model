from flask import Flask, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import Holt
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
import sys
import os
warnings.filterwarnings('ignore')
app = Flask(__name__)
def setup_chrome_driver():
    """Setup Chrome driver with cross-platform compatibility"""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-plugins")
    chrome_options.add_argument("--disable-images")
    chrome_options.add_argument("--headless")  
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("ChromeDriver initialized successfully")
        return driver
    except Exception as e:
        print(f"Error setting up ChromeDriver: {e}")
        raise
def scrape_gold_data():
    """Scrape gold price data from Economic Times"""
    driver = setup_chrome_driver()
    driver_wait = WebDriverWait(driver, 10)
    try:
        print("Loading Economic Times gold price page...")
        driver.get("https://economictimes.indiatimes.com/markets/gold-rate-in-india-today")  
        driver_wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        tables_data = driver.execute_script("""
            var dailyTable = document.querySelector('table.table.lg_txt.rf_rr');
            var monthlyTable = document.querySelector('#monthTrend24c table');
            
            var dailyRows = Array.from(dailyTable.querySelectorAll('tr')).slice(1);
            var monthlyRows = Array.from(monthlyTable.querySelectorAll('tbody tr'));
            
            var dailyData = dailyRows.map(row => {
                var cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    return {
                        date: cells[0].textContent.trim(),
                        price: cells[2].querySelector('.text').textContent.trim()
                    };
                }
                return null;
            }).filter(item => item !== null);
            
            var monthlyData = monthlyRows.map(row => {
                var cells = row.querySelectorAll('td');
                if (cells.length >= 6) {
                    return {
                        month: cells[0].textContent.trim(),
                        average: cells[5].textContent.trim()
                    };
                }
                return null;
            }).filter(item => item !== null);
            
            return {daily: dailyData, monthly: monthlyData};
        """)

        daily_data = []
        for item in tables_data['daily']:
            date_text = item['date']
            raw_price = item['price']
            numeric_str = raw_price.replace('₹', '').replace(',', '')
            try:
                price_value = float(numeric_str) / 10
                daily_data.append({
                    'Date': date_text,
                    'Price_per_gram': price_value
                })
            except ValueError:
                continue
        monthly_data = []
        for item in tables_data['monthly']:
            month = item['month']
            average_price = item['average'].replace('₹', '').replace(',', '')
            try:
                avg_val = float(average_price)
                monthly_data.append({
                    'Month': month,
                    'Average_per_gram': avg_val
                })
            except ValueError:
                continue
        return pd.DataFrame(daily_data), pd.DataFrame(monthly_data)
    finally:
        driver.quit()
        print("Browser closed")
def evaluate_holt_model(train_data, test_data, alpha, beta, phi=None, damped=False):
    try:
        if damped:
            model = Holt(train_data, exponential=False, damped_trend=True)
            fitted = model.fit(smoothing_level=alpha, smoothing_trend=beta, damping_trend=phi, optimized=False)
        else:
            model = Holt(train_data, exponential=False)
            fitted = model.fit(smoothing_level=alpha, smoothing_trend=beta, optimized=False)
        predictions = fitted.forecast(steps=len(test_data))
        rmse = np.sqrt(mean_squared_error(test_data, predictions))
        return rmse, predictions, fitted
    except:
        return float('inf'), None, None
def get_predictions(data, is_monthly=False):
    values = data['Average_per_gram'].values if is_monthly else data['Price_per_gram'].values
    train_size = len(values) - 3
    train_data = values[:train_size]
    test_data = values[train_size:]
    alpha_values = [0.8, 0.85, 0.9, 0.95, 0.99]
    beta_values = [0.05, 0.1, 0.15, 0.2, 0.25]
    phi_values = [0.8, 0.85, 0.9, 0.95, 0.98]
    best_rmse = float('inf')
    best_predictions = None
    best_model = None
    best_params = None
    is_damped = False
        for alpha in alpha_values:
        for beta in beta_values:
            rmse, predictions, model = evaluate_holt_model(train_data, test_data, alpha, beta)
            if rmse < best_rmse:
                best_rmse = rmse
                best_predictions = predictions
                best_model = model
                best_params = (alpha, beta)
        for alpha in alpha_values:
        for beta in beta_values:
            for phi in phi_values:
                rmse, predictions, model = evaluate_holt_model(train_data, test_data, alpha, beta, phi, True)
                if rmse < best_rmse:
                    best_rmse = rmse
                    best_predictions = predictions
                    best_model = model
                    best_params = (alpha, beta, phi)
                    is_damped = True
        if best_model is not None:
        future_predictions = best_model.forecast(3)
        mae = mean_absolute_error(test_data, best_predictions)
        
        return {
            'predictions': future_predictions.tolist(),
            'metrics': {
                'rmse': best_rmse,
                'mae': mae,
                'model_type': 'Damped' if is_damped else 'Regular',
                'parameters': best_params
            }
        }
    return None
@app.route('/api/daily-data')
def daily_data():
    try:
        daily_df, _ = scrape_gold_data()
        daily_df['Date'] = pd.to_datetime(daily_df['Date'], format='%b %d, %Y')
        daily_df = daily_df.sort_values('Date')
        
        predictions = get_predictions(daily_df)
        return jsonify({
            'historical': daily_df.to_dict(orient='records'),
            'predictions': predictions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/monthly-data')
def monthly_data():
    try:
        _, monthly_df = scrape_gold_data()
        predictions = get_predictions(monthly_df, is_monthly=True)
        return jsonify({
            'historical': monthly_df.to_dict(orient='records'),
            'predictions': predictions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(port=5000)