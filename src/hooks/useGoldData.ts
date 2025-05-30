import { useState, useEffect } from 'react';
import axios from 'axios';
interface GoldData {
  historical: Array<{
    date: string;
    price_per_gram: number;
  }>;
  predictions: {
    predictions: number[];
    metrics: {
      rmse: number;
      mae: number;
    };
  };
}
export function useGoldData(type: 'daily' | 'monthly') {
  const [data, setData] = useState<GoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = type === 'daily' ? '/api/daily-data' : '/api/monthly-data';
        const response = await axios.get(endpoint);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch gold price data');
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  return { data, loading, error };
}