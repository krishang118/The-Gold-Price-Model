import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyChartProps {
  monthlyData: Array<{
    Month: string;
    Average_per_gram: number | null;
    Start_per_gram: number | null;
    End_per_gram: number | null;
    Change_Rs: string;
    Percent_change: string;
  }>;
  forecast: number[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ monthlyData, forecast }) => {
  // Filter out entries with null average price and prepare data for chart.js
  const historicalData = monthlyData
    .filter(item => item.Average_per_gram !== null)
    .map(item => ({
      month: item.Month,
      price: item.Average_per_gram as number,
    }));

  // We need labels for the forecast months. We'll append these to the historical labels.
  const historicalLabels = historicalData.map(item => item.month);

  const data = {
    labels: historicalLabels,
    datasets: [
      {
        label: 'Monthly Average (₹/gram)',
        data: historicalData.map(item => item.price),
        borderColor: 'rgb(245, 158, 11)', // Amber color
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#d1d5db' // gray-300
        },
        onClick: function() {}, // Disable legend item clicking
        padding: 25, // Increase padding below the legend
      },
      title: {
        display: true,
        text: 'Monthly Gold Prices and Forecast',
        color: '#e5e7eb' // gray-200
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any) {
            return tooltipItems[0].label; // Display month/forecast label as title
          },
          label: function(tooltipItem: any) {
            return `Price: ₹${tooltipItem.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          color: '#d1d5db' // gray-300
        },
        ticks: {
          color: '#9ca3af' // gray-400
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)' // gray-500 with opacity
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price (₹/gram)',
          color: '#d1d5db' // gray-300
        },
        ticks: {
          color: '#9ca3af' // gray-400
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)' // gray-500 with opacity
        }
      },
    },
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96">
      {historicalData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p className="text-center text-gray-500">No sufficient monthly data for chart.</p>
      )}
    </div>
  );
};

export default MonthlyChart;