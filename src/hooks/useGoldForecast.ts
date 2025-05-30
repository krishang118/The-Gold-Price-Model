import { useState, useEffect } from 'react';
interface GoldData {
  Date: string;
  Price_per_gram: number | null;
}
interface MonthlyGoldData {
  Month: string;
  Start_per_gram: number | null;
  End_per_gram: number | null;
  Change_Rs: string;
  Percent_change: string;
  Average_per_gram: number | null;
}
interface ForecastData {
  daily_data: GoldData[];
  monthly_data: MonthlyGoldData[];
  monthly_forecast: number[];
  daily_forecast: number[];

  monthly_rmse: number | string | null;
  monthly_mae: number | string | null;
  monthly_modelType: string | null;
  monthly_alpha: number | string | null;
  monthly_beta: number | string | null;
  monthly_phi: number | string | null;

  daily_rmse: number | string | null;
  daily_mae: number | string | null;
  daily_modelType: string | null;
  daily_alpha: number | string | null;
  daily_beta: number | string | null;
  daily_phi: number | string | null; 
}
interface UseGoldForecastResult {
  data: ForecastData | null;
  loading: boolean;
  error: string | null;
}
const useGoldForecast = (): UseGoldForecastResult => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/forecast');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: ForecastData = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []); 
  return { data, loading, error };
};
export default useGoldForecast;