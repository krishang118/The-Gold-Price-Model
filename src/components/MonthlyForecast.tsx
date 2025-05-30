import React from 'react';
import { CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MonthlyChart from './charts/MonthlyChart';
import useGoldForecast from '../hooks/useGoldForecast';
import dayjs from 'dayjs';

const MonthlyForecast = () => {
  const { data, loading, error } = useGoldForecast();
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-amber-500" />
          Monthly Price Information and Forecast
        </h2>
        {loading && <p className="text-center text-amber-400">Loading...</p>}
        {error && <p className="text-center text-red-500">Error loading monthly data: {error}</p>}

        {!loading && !error && data?.monthly_data && data?.monthly_forecast && (
          <>
            <div className="w-full h-64 md:h-80 lg:h-96 mb-6 flex-shrink-0">
              <MonthlyChart monthlyData={data.monthly_data} forecast={data.monthly_forecast} />
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-200">Monthly Prices</h3>
            <div className="max-h-96 overflow-y-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">Month</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">Average Price (₹/gram)</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">Start Price</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">End Price</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">Change (Rs)</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-gray-400">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly_data.map((item, index) => (
                    item.Average_per_gram !== null && (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2 border-b border-gray-700 text-gray-300">
                          {item.Month}
                        </td>
                         <td className="px-4 py-2 border-b border-gray-700 text-amber-300">
                          {item.Average_per_gram.toFixed(2)}
                        </td>
                         <td className="px-4 py-2 border-b border-gray-700 text-gray-300">
                          {item.Start_per_gram !== null ? item.Start_per_gram.toFixed(2) : 'N/A'}
                        </td>
                         <td className="px-4 py-2 border-b border-gray-700 text-gray-300">
                          {item.End_per_gram !== null ? item.End_per_gram.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-700 text-gray-100">
                           {item.Change_Rs}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-700 text-gray-100">
                          {item.Percent_change}
                        </td>
                      </tr>
                    )
                  ))}
                  {data.monthly_data.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-4 py-2 text-center text-gray-500">No monthly data available.</td>
                    </tr>
                   )}
                </tbody>
              </table>
            </div>
             <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-200">Monthly Forecast (Next 3 Months)</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
                 {data.monthly_forecast.length > 0 && data.monthly_data.length > 0 ? (
                     data.monthly_forecast.map((price, index) => {
                         const lastMonthlyDateStr = data.monthly_data[data.monthly_data.length - 1].Month;
                         const lastMonthlyDate = dayjs(lastMonthlyDateStr, 'MMM YY'); 
                         const forecastDate = lastMonthlyDate.add(index + 1, 'month');
                         return (
                             <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                  <p className="text-sm text-gray-400">{forecastDate.format('MMM')}</p>
                                  <p className="text-xl font-bold text-amber-400">₹{price.toFixed(2)}</p>
                             </div>
                         );
                     })
                 ) : (
                     <p className="px-4 py-2 text-center text-gray-500 col-span-3">No forecast data available.</p>
                 )}
             </div>

            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50 mt-6 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Model Details (Based on Monthly Data)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="font-medium text-amber-300">{data?.monthly_modelType || 'N/A'}</p>
                </div>
                 <div>
                  <p className="text-gray-400">Alpha</p>
                  <p className="font-medium text-amber-300">
                    {data?.monthly_alpha !== undefined && data.monthly_alpha !== null
                      ? typeof data.monthly_alpha === 'number' ? data.monthly_alpha.toFixed(2) : String(data.monthly_alpha)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Beta</p>
                  <p className="font-medium text-amber-300">
                     {data?.monthly_beta !== undefined && data.monthly_beta !== null
                      ? typeof data.monthly_beta === 'number' ? data.monthly_beta.toFixed(2) : String(data.monthly_beta)
                      : 'N/A'}
                  </p>
                </div>
                 <div>
                  <p className="text-gray-400">Phi</p>
                  <p className="font-medium text-amber-300">
                     {data?.monthly_phi !== undefined && data.monthly_phi !== null
                      ? typeof data.monthly_phi === 'number' ? data.monthly_phi.toFixed(2) : String(data.monthly_phi)
                      : (data?.monthly_modelType === "Damped Holt's Method" ? 'N/A' : 'Not Applicable')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">RMSE</p>
                  <p className="font-medium text-amber-300">
                    {data?.monthly_rmse !== undefined && data.monthly_rmse !== null
                      ? typeof data.monthly_rmse === 'number' ? data.monthly_rmse.toFixed(2) : String(data.monthly_rmse)
                      : 'N/A'}
                  </p>
                </div>
                 <div>
                  <p className="text-gray-400">MAE</p>
                  <p className="font-medium text-amber-300">
                    {data?.monthly_mae !== undefined && data.monthly_mae !== null
                      ? typeof data.monthly_mae === 'number' ? data.monthly_mae.toFixed(2) : String(data.monthly_mae)
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

export default MonthlyForecast;