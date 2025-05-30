# The Gold Price Predictor

## Machine Learning Model (Gold Prices Model.ipynb)

The 'ML' folder includes the Jupyter notebook ML Model file (`Gold Prices Model.ipynb`), along with two extracted .xlsx data files. 

The model implements the thorough process of scraping real-time gold price data; developing, training, and evaluating a time series forecasting model; and generating future price predictions.

The key steps are:

1.  **Data Scraping:** Utilizes Selenium to automate the process of extracting real-time daily and monthly per gram 24K gold price (in India) data from 'The Economic Times' website.
2.  **Data Loading and Preprocessing:** Loads the scraped data, primarily using pandas, and performs necessary preprocessing steps to prepare it for time series analysis.
3.  **Exploratory Data Analysis:** Includes visualizations (using matplotlib) to understand the trends and patterns in the available daily and  monthly gold price data.
4.  **Time Series Forecasting:** Implements Holt's Prediction Approach (from the statsmodels library) for time series forecasting. Both the standard Holt's linear trend method and the damped trend variation apporoach are explored and evaluated with variable parameters for the price predictions.
5.  **Model Evaluation:** Assesses the performance of the forecasting models using Root Mean Squared Error (RMSE) and Mean Absolute Error (MAE) metrics on a test set.
6.  **Future Forecasting:** Generates future price predictions based on the best-performing model.

## Running the Notebook

1.  Ensure you have Python 3.7+ installed.
2.  Install the required libraries by running the installation command in the first cell of the notebook.
3.  Make sure you have the Chrome browser installed, as the scraping logic uses ChromeDriver via `webdriver-manager`.
4.  Open the notebook in a Jupyter environment (like Jupyter Notebook, JupyterLab, VS Code with Python extension, Google Colab etc).
5.  Run the cells sequentially to execute the data scraping, processing, modeling, and forecasting steps.

## Data Files

Running the scraping cells in the notebook generate the following files:

-   `daily_gold.xlsx`: Excel file containing scraped daily gold price data.
-   `monthly_gold.xlsx`: Excel file containing scraped monthly gold price data.

These files are then used as input for the subsequent data processing and modeling steps within the notebook.

## Web Application 

The initially built ML model is visualized through a full-stack web application, which, like the procedure followed in the Jupyter notebook, scrapes current and historical gold price data, performs forecasting using statistical models, and visualizes the data and predictions on a user-friendly frontend dashboard.

## Features

- Automated scraping of daily and monthly gold price data.
- Backend API built with Flask to serve available data, forecasts, and model metrics.
- Daily and monthly price forecasting using time series models (Holt's prediction method, including damped trend variation).
- Frontend dashboard built with React and TypeScript for data visualization.
- Displays historical daily and monthly price charts.
- Shows daily and monthly price forecasts.
- Presents model accuracy metrics (RMSE, MAE) and parameters.
- Responsive UI using Tailwind CSS.

## Technologies Used

**Backend:**
- Python
- Flask
- Selenium (for web scraping)
- pandas (for data manipulation)
- statsmodels (for time series forecasting)
- Gunicorn (WSGI server)

**Frontend:**
- React
- TypeScript
- Tailwind CSS
- Chart.js (for charts)
- dayjs (for date manipulation)

## Setup and Installation

**Prerequisites:**

- Python 3.7+
- Node.js (LTS version recommended)
- npm or yarn package manager
- Chrome browser (for Selenium scraping)

**1. Clone the repository:**

```bash
git clone <https://github.com/krishang118/The-Gold-Prices-Model>
cd project
```

**2. Backend Setup:**

Navigate to the `api` directory and install the Python dependencies:

```bash
cd api
pip install -r requirements.txt
```

To run the backend server (using Gunicorn), navigate back to the project root directory and execute:

```bash
gunicorn api.app:app -b 0.0.0.0:5001
```

The backend should now be running on `http://127.0.0.1:5001`.

**3. Frontend Setup:**

Navigate to the project root directory and install the Node.js dependencies:

```bash
npm install
# or if you use yarn
yarn install
```

To run the frontend development server, execute:

```bash
npm run dev
# or if you use yarn
yarn dev
```

The frontend development server should start on `http://localhost:5173`.

## Project Structure

```
The-Gold-Prices-Model/
├── api/                # Flask backend code
├── src/                # React frontend code
│   ├── components/     # Reusable React components
│   │   ├── charts/     # Chart components
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   └── App.tsx         # Main application component
├── .gitignore          # Git ignore file
├── package.json        # Frontend dependencies
├── package-lock.json   # Frontend dependency lock file
├── tailwind.config.js  # Tailwind CSS configuration
├── ... other files ...
├── README.md           # This file
```

## Contributions

Contributions are welcome!

## License

Distributed under the MIT License.

