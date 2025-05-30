import React from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DailyChart from './charts/DailyChart';
import useGoldForecast from '../hooks/useGoldForecast'; 
import dayjs from 'dayjs'; 
const DailyForecast = () => {
  const { data, loading, error } = useGoldForecast(); 
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-amber-500" />
          Daily Price Information
        </h2>
        {loading && <p className="text-center text-amber-400">Loading...</p>}
        {error && <p className="text-center text-red-500">Error loading daily data: {error}</p>}
        {!loading && !error && data?.daily_data && (
          <>
            <div className="mb-6 flex-shrink-0">
              <DailyChart data={data.daily_data} />
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-200">Daily Prices</h3>
            <div className="max-h-96 overflow-y-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">Date</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">Price (₹/gram)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily_data.map((item, index) => (
                    item.Price_per_gram !== null && (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2 border-b border-gray-700 text-gray-300">
                          {new Date(item.Date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-700 text-amber-300">
                          {item.Price_per_gram.toFixed(2)}
                        </td>
                      </tr>
                    )
                  ))}
                   {data.daily_data.length === 0 && (
                    <tr>
                        <td colSpan={2} className="px-4 py-2 text-center text-gray-500">No daily data available.</td>
                    </tr>
                   )}
                </tbody>
              </table>
            </div>
            {data?.daily_forecast && data.daily_forecast.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-200">Daily Forecast (Next 3 Days)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {data.daily_forecast.map((price, index) => {
                            const lastDailyDate = data.daily_data.length > 0
                                ? dayjs(data.daily_data[data.daily_data.length - 1].Date)
                                : dayjs(); 
                            const forecastDate = lastDailyDate.add(index + 1, 'day');
                            const previousPrice = index === 0
                                ? (data.daily_data.length > 0 ? data.daily_data[data.daily_data.length - 1].Price_per_gram : null)
                                : data.daily_forecast[index - 1];
                            const change = previousPrice !== null ? price - previousPrice : null;
                            const lastHistoricalPrice = data.daily_data.length > 0 ? data.daily_data[data.daily_data.length - 1].Price_per_gram : null;
                            const cumChange = lastHistoricalPrice !== null ? price - lastHistoricalPrice : null;
                            return (
                                <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                    <p className="text-sm text-gray-400">{forecastDate.format('MMM D')}</p>
                                    <p className="text-xl font-bold text-amber-400">₹{price.toFixed(2)}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50 mt-6 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Model Details (Based on Daily Data)</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="font-medium text-amber-300">{data?.daily_modelType || 'N/A'}</p>
                </div>
                 <div>
                  <p className="text-gray-400">Alpha</p>
                  <p className="font-medium text-amber-300">
                    {data?.daily_alpha !== undefined && data.daily_alpha !== null
                      ? typeof data.daily_alpha === 'number' ? data.daily_alpha.toFixed(2) : String(data.daily_alpha)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Beta</p>
                  <p className="font-medium text-amber-300">
                     {data?.daily_beta !== undefined && data.daily_beta !== null
                      ? typeof data.daily_beta === 'number' ? data.daily_beta.toFixed(2) : String(data.daily_beta)
                      : 'N/A'}
                  </p>
                </div>
                 <div>
                  <p className="text-gray-400">Phi</p>
                  <p className="font-medium text-amber-300">
                     {data?.daily_phi !== undefined && data.daily_phi !== null && data.daily_phi !== "N/A"
                      ? typeof data.daily_phi === 'number' ? data.daily_phi.toFixed(2) : String(data.daily_phi)
                      : 'Not Applicable'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">RMSE</p>
                  <p className="font-medium text-amber-300">
                    {data?.daily_rmse !== undefined && data.daily_rmse !== null
                      ? typeof data.daily_rmse === 'number' ? data.daily_rmse.toFixed(2) : String(data.daily_rmse)
                      : 'N/A'}
                  </p>
                </div>
                 <div>
                  <p className="text-gray-400">MAE</p>
                  <p className="font-medium text-amber-300">
                    {data?.daily_mae !== undefined && data.daily_mae !== null
                      ? typeof data.daily_mae === 'number' ? data.daily_mae.toFixed(2) : String(data.daily_mae)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default DailyForecast;