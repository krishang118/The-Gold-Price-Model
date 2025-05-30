import pandas as pd
import sys
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import numpy as np
from statsmodels.tsa.holtwinters import Holt
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')
class HoltMethod:
    def __init__(self, alpha=0.3, beta=0.1, damped=False, phi=0.98):
        self.alpha = alpha
        self.beta = beta
        self.damped = damped
        self.phi = phi if damped else 1.0
        self.level = None
        self.trend = None
        self.fitted_values = []
    def fit(self, data):
        values = data.values if hasattr(data, 'values') else data
        n = len(values)
        self.level = values[0]
        if n > 1:
            self.trend = values[1] - values[0]
        else:
            self.trend = 0
        self.fitted_values = [self.level]
        for t in range(1, n):
            prev_level = self.level
            prev_trend = self.trend
            self.level = self.alpha * values[t] + (1 - self.alpha) * (prev_level + self.phi * prev_trend)
            self.trend = self.beta * (self.level - prev_level) + (1 - self.beta) * self.phi * prev_trend
            self.fitted_values.append(self.level)
        return self
    def forecast(self, steps):
        forecasts = []
        for h in range(1, steps + 1):
            if self.damped:
                phi_sum = sum([self.phi ** i for i in range(1, h + 1)])
                forecast = self.level + phi_sum * self.trend
            else:
                forecast = self.level + h * self.trend
            forecasts.append(forecast)
        return np.array(forecasts)
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
    chrome_options.add_argument("--disable-background-timer-throttling")
    chrome_options.add_argument("--disable-backgrounding-occluded-windows")
    chrome_options.add_argument("--disable-renderer-backgrounding")
    chrome_options.add_argument("--disable-features=TranslateUI")
    chrome_options.add_argument("--disable-ipc-flooding-protection")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--aggressive-cache-discard")
    chrome_options.page_load_strategy = 'none'
    chrome_options.add_argument("--headless")
    if sys.platform.startswith('linux'):
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--remote-debugging-port=9222")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("ChromeDriver initialized successfully using webdriver-manager")
        return driver
    except Exception as e:
        print(f"Error setting up ChromeDriver with webdriver-manager: {e}")
        try:
            driver = webdriver.Chrome(options=chrome_options)
            print("ChromeDriver initialized successfully from PATH")
            return driver
        except Exception as e2:
            print(f"Error setting up ChromeDriver from PATH: {e2}")
            print("Please ensure Chrome browser is installed and ChromeDriver is available")
            raise
def scrape_gold_data():
    """Main function to scrape gold price data"""
    driver = setup_chrome_driver()
    driver.set_page_load_timeout(10)
    driver_wait = WebDriverWait(driver, 3)
    try:
        print("Loading Economic Times gold price page...")
        driver.get("https://economictimes.indiatimes.com/markets/gold-rate-in-india-today")
        driver_wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        section_24k = driver.find_element(By.ID, "monthTrend24c")
        driver.execute_script("arguments[0].scrollIntoView(true);", section_24k)
        print("Extracting data from tables...")
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
                        start: cells[1].textContent.trim(),
                        end: cells[2].textContent.trim(),
                        change: cells[3].querySelector('span') ? cells[3].querySelector('span').textContent.trim() : cells[3].textContent.trim(),
                        percent: cells[4].querySelector('span') ? cells[4].querySelector('span').textContent.trim() : cells[4].textContent.trim(),
                        average: cells[5].textContent.trim()
                    };
                }
                return null;
            }).filter(item => item !== null);
            return {daily: dailyData, monthly: monthlyData};
        """)
        print("Processing daily data...")
        daily_data = []
        for item in tables_data['daily']:
            date_text = item['date']
            raw_price = item['price']
            numeric_str = raw_price.replace('₹', '').replace(',', '')
            try:
                price_value = float(numeric_str) / 10  
            except ValueError:
                price_value = None
            daily_data.append({
                'Date': date_text,
                'Price_per_gram': price_value
            })
        print("Processing monthly data...")
        monthly_data = []
        for item in tables_data['monthly']:
            month = item['month']
            start_price = item['start'].replace('₹', '').replace(',', '')
            end_price = item['end'].replace('₹', '').replace(',', '')
            change_value = item['change']
            percent_change = item['percent']
            average_price = item['average'].replace('₹', '').replace(',', '')  
            try:
                start_val = float(start_price)
                end_val = float(end_price)
                avg_val = float(average_price)
            except ValueError:
                start_val = end_val = avg_val = None     
            monthly_data.append({
                'Month': month,
                'Start_per_gram': start_val,
                'End_per_gram': end_val,
                'Change_Rs': change_value,
                'Percent_change': percent_change,
                'Average_per_gram': avg_val
            })
        print("Scraping completed successfully!")
        return daily_data, monthly_data 
    except Exception as e:
        print(f"Error during scraping: {e}")
        return None, None 
    finally:
        if driver:
            driver.quit()
            print("Browser closed") 
def process_and_forecast(daily_data, monthly_data):
    """Processes scraped data and generates gold price forecasts."""
    if not daily_data or not monthly_data:
        print("No data received for processing.")
        return None
    daily_df = pd.DataFrame(daily_data)
    monthly_df = pd.DataFrame(monthly_data)
    if not daily_df.empty:
        daily_df['Date'] = pd.to_datetime(daily_df['Date'], format='%b %d, %Y')
        daily_df.set_index('Date', inplace=True)
        daily_df.sort_index(inplace=True)
    monthly_series = None
    if not monthly_df.empty:
        actual_months = []
        for month_str in monthly_df['Month']:
            month_parts = month_str.split()
            month_name = month_parts[0]
            year = int('20' + month_parts[1])
            month_dict = {
                'January': 1, 'February': 2, 'March': 3, 'April': 4,
                'May': 5, 'June': 6, 'July': 7, 'August': 8,
                'September': 9, 'October': 10, 'November': 11, 'December': 12
            }
            month_num = month_dict[month_name]
            actual_months.append(pd.Timestamp(year=year, month=month_num, day=1))
        monthly_df['Date'] = actual_months
        monthly_df.set_index('Date', inplace=True)
        monthly_df.sort_index(inplace=True)
        monthly_series = monthly_df['Average_per_gram']
    monthly_forecast = None
    monthly_rmse = None
    monthly_mae = None
    monthly_model_type = "N/A"
    monthly_alpha = "N/A"
    monthly_beta = "N/A"
    monthly_phi = "N/A"
    print("Starting monthly model evaluation...")
    if monthly_series is not None and len(monthly_series) > 3:
        test_size_monthly = 3
        if len(monthly_series) >= test_size_monthly:
            train_series_monthly = monthly_series.iloc[:-test_size_monthly]
            test_series_monthly = monthly_series.iloc[-test_size_monthly:]
            def evaluate_holt_model_monthly(train_data, test_data, alpha, beta, phi=None, damped=False):
                try:
                    if damped:
                        model = Holt(train_data, exponential=False, damped_trend=True)
                        fitted = model.fit(smoothing_level=alpha, smoothing_trend=beta, damping_trend=phi, optimized=False)
                    else:
                        model = Holt(train_data, exponential=False)
                        fitted = model.fit(smoothing_level=alpha, smoothing_trend=beta, optimized=False)
                    predictions = fitted.forecast(steps=len(test_data))
                    rmse = np.sqrt(mean_squared_error(test_data, predictions))
                    mae = mean_absolute_error(test_data, predictions)
                    return rmse, mae, fitted
                except Exception as e:
                    print(f"Error evaluating Holt model: {e}")
                    return float('inf'), float('inf'), None 
            eval_alpha_m = 0.9
            eval_beta_m = 0.1
            eval_phi_m = 0.8
            eval_damped_m = True
            rmse_result_m, mae_result_m, fitted_model_m = evaluate_holt_model_monthly(
                train_series_monthly,
                test_series_monthly,
                eval_alpha_m,
                eval_beta_m,
                phi=eval_phi_m,
                damped=eval_damped_m
            )
            if fitted_model_m is not None:
                monthly_rmse = rmse_result_m
                monthly_mae = mae_result_m
                monthly_model_type = "Damped Holt's Method" if eval_damped_m else "Holt's Method"
                monthly_alpha = eval_alpha_m
                monthly_beta = eval_beta_m
                monthly_phi = eval_phi_m if eval_damped_m else "N/A"
                print("Fitting monthly model on full data and forecasting...")
                try:
                     if eval_damped_m:
                         full_model_m = Holt(monthly_series, exponential=False, damped_trend=True)
                         full_fitted_m = full_model_m.fit(
                             smoothing_level=monthly_alpha,
                             smoothing_trend=monthly_beta,
                             damping_trend=monthly_phi if monthly_phi != "N/A" else None,
                             optimized=False
                         )
                     else:
                         full_model_m = Holt(monthly_series, exponential=False)
                         full_fitted_m = full_model_m.fit(
                             smoothing_level=monthly_alpha,
                             smoothing_trend=monthly_beta,
                             optimized=False
                         )
                     monthly_forecast = full_fitted_m.forecast(steps=3)
                     print(f"Monthly forecast calculated: {monthly_forecast.tolist()}")
                except Exception as e:
                    print(f"Error fitting full Monthly Holt model or forecasting: {e}")
                    monthly_forecast = None
            else:
                 print("Monthly model evaluation failed, cannot perform forecast or set RMSE/MAE.")
    daily_rmse = None
    daily_mae = None
    daily_model_type = "N/A"
    daily_alpha = "N/A"
    daily_beta = "N/A"
    daily_phi = "N/A" 
    daily_forecast = None
    print("Starting daily model evaluation...")
    if not daily_df.empty and len(daily_df) > 3: 
        test_size_daily = 3
        if len(daily_df) >= test_size_daily:
            daily_series = daily_df['Price_per_gram'].dropna()
            if len(daily_series) >= test_size_daily:
                 train_series_daily = daily_series[:-test_size_daily]
                 test_series_daily = daily_series[-test_size_daily:]
                 alpha_values_d = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99, 0.995]
                 beta_values_d = [0.05, 0.1, 0.15, 0.2, 0.25, 0.284, 0.3, 0.35, 0.4, 0.45, 0.5]
                 phi_values_d = [0.8, 0.85, 0.9, 0.95, 0.98, 0.99]
                 best_rmse_regular_d = float('inf')
                 best_params_regular_d = None
                 best_model_regular_d = None
                 best_rmse_damped_d = float('inf')
                 best_params_damped_d = None
                 best_model_damped_d = None
                 def evaluate_holt_model_daily(train_data, test_data, alpha, beta, phi=None, damped=False):
                     try:
                         if damped:
                             model = HoltMethod(alpha=alpha, beta=beta, damped=True, phi=phi)
                         else:
                             model = HoltMethod(alpha=alpha, beta=beta, damped=False)
                         model.fit(train_data.values) 
                         predictions = model.forecast(len(test_data))
                         rmse = np.sqrt(mean_squared_error(test_data.values, predictions)) 
                         mae = mean_absolute_error(test_data.values, predictions) 
                         return rmse, mae, model
                     except Exception as e:
                         print(f"Error evaluating custom HoltMethod model: {e}")
                         return float('inf'), float('inf'), None
                 print("Searching for best daily Regular Holt model using custom method...")
                 for alpha in alpha_values_d:
                     for beta in beta_values_d:
                         rmse, mae, model = evaluate_holt_model_daily(train_series_daily, test_series_daily, alpha, beta, damped=False)
                         if model is not None and rmse < best_rmse_regular_d:
                             best_rmse_regular_d = rmse
                             best_params_regular_d = (alpha, beta)
                             best_model_regular_d = model
                             best_mae_regular_d = mae
                 print("Searching for best daily Damped Holt model using custom method...")
                 for alpha in alpha_values_d:
                     for beta in beta_values_d:
                         for phi in phi_values_d:
                             rmse, mae, model = evaluate_holt_model_daily(train_series_daily, test_series_daily, alpha, beta, phi=phi, damped=True)
                             if model is not None and rmse < best_rmse_damped_d:
                                 best_rmse_damped_d = rmse
                                 best_params_damped_d = (alpha, beta, phi)
                                 best_model_damped_d = model
                                 best_mae_damped_d = mae
                 print("Selecting best overall daily model...")
                 best_model_d = None
                 if best_rmse_regular_d < best_rmse_damped_d:
                     best_method_d = "Regular"
                     daily_rmse = best_rmse_regular_d
                     daily_mae = best_mae_regular_d
                     best_params_d = best_params_regular_d
                     best_model_d = best_model_regular_d
                     daily_model_type = "Regular Holt's Method"
                     daily_alpha = best_params_d[0]
                     daily_beta = best_params_d[1]
                     daily_phi = "N/A"
                 else:
                     best_method_d = "Damped"
                     daily_rmse = best_rmse_damped_d
                     daily_mae = best_mae_damped_d
                     best_params_d = best_params_damped_d
                     best_model_d = best_model_damped_d
                     daily_model_type = "Damped Holt's Method"
                     daily_alpha = best_params_d[0]
                     daily_beta = best_params_d[1]
                     daily_phi = best_params_d[2]
                 if best_model_d is not None:
                      print(f"Using best daily model ({daily_model_type}) with parameters Alpha: {daily_alpha}, Beta: {daily_beta}, Phi: {daily_phi} for final forecast...")
                      try:
                          if best_method_d == "Damped":
                               full_model_d = HoltMethod(
                                    alpha=daily_alpha,
                                    beta=daily_beta,
                                    damped=True,
                                    phi=daily_phi if daily_phi != "N/A" else None
                               )
                          else:
                               full_model_d = HoltMethod(
                                    alpha=daily_alpha,
                                    beta=daily_beta,
                                    damped=False
                               )
                          full_model_d.fit(daily_series.values) 
                          daily_forecast = full_model_d.forecast(steps=3)
                          print(f"Daily forecast calculated: {daily_forecast.tolist()}")
                      except Exception as e:
                          print(f"Error fitting full Daily Holt model or forecasting: {e}")
                          daily_forecast = None
                 else:
                     print("No best daily model found, cannot perform forecast.")

            else:
                 print(f"Insufficient non-null daily data ({len(daily_series)} points) for test split ({test_size_daily}).")
        else:
            print(f"Insufficient total daily data ({len(daily_df)} points) for test split ({test_size_daily}).")
    results = {
        "daily_data": daily_df.reset_index().to_dict(orient='records') if not daily_df.empty else [],
        "monthly_data": [
            {
                'Month': item['Date'].strftime('%b %y'), 
                'Start_per_gram': item['Start_per_gram'],
                'End_per_gram': item['End_per_gram'],
                'Change_Rs': item['Change_Rs'],
                'Percent_change': item['Percent_change'],
                'Average_per_gram': item['Average_per_gram']
            } for item in monthly_df.reset_index().to_dict(orient='records')
        ] if not monthly_df.empty else [],
        "monthly_forecast": monthly_forecast.tolist() if monthly_forecast is not None else [],
        "monthly_rmse": monthly_rmse if monthly_rmse is not None else "N/A",
        "monthly_mae": monthly_mae if monthly_mae is not None else "N/A",
        "monthly_modelType": monthly_model_type,
        "monthly_alpha": monthly_alpha,
        "monthly_beta": monthly_beta,
        "monthly_phi": monthly_phi,
        "daily_forecast": daily_forecast.tolist() if daily_forecast is not None else [], 
        "daily_rmse": daily_rmse if daily_rmse is not None else "N/A",
        "daily_mae": daily_mae if daily_mae is not None else "N/A",
        "daily_modelType": daily_model_type,
        "daily_alpha": daily_alpha,
        "daily_beta": daily_beta,
        "daily_phi": daily_phi,
    }
    return results