import React from 'react';
import { LineChart, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import useGoldForecast from '../hooks/useGoldForecast';
const Overview = () => {
  const { data, loading, error } = useGoldForecast();
  const latestDailyData = (data && data.daily_data && data.daily_data.length > 0) ? data.daily_data[data.daily_data.length - 1] : null;
  const previousDailyData = (data && data.daily_data && data.daily_data.length > 1) ? data.daily_data[data.daily_data.length - 2] : null;
  const priceDifference = (latestDailyData && latestDailyData.Price_per_gram !== null && previousDailyData && previousDailyData.Price_per_gram !== null) ? latestDailyData.Price_per_gram - previousDailyData.Price_per_gram : null;
  return (
    <section className="mb-12">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-100">
            <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
            Gold Price Overview
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Current Price (24K)</h3>
              {loading && <p className="text-2xl font-bold text-amber-400">Loading...</p>}
              {error && <p className="text-xl font-bold text-red-500">Error: {error}</p>}
              {!loading && !error && latestDailyData && latestDailyData.Price_per_gram !== null ? (
                <>
                  <p className="text-2xl font-bold text-amber-400">₹{latestDailyData.Price_per_gram.toFixed(2)}
                    {priceDifference !== null && (
                      <span className={`text-sm ml-2 ${priceDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({priceDifference >= 0 ? '+' : '-'}₹{Math.abs(priceDifference).toFixed(2)})
                      </span>
                    )}
                  </p>
                  <p className="text-sm mt-1 text-gray-400">As of {new Date(latestDailyData.Date).toLocaleDateString()}</p>
                </>
              ) : (!loading && !error && <p className="text-xl font-bold text-gray-400">No daily data available.</p>)}
            </div>
          </div>
          
          <div className="mt-6 bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-2">About The Predictor</h3>
            <p className="text-sm text-gray-400">
              The Gold Price Predictor uses Holt's Prediction Approach with optimized parameters to forecast and predict both daily and monthly per gram 24K gold prices in India, based on real-time data from 'The Economic Times'.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Overview;