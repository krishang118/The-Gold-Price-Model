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

interface DailyChartProps {
  data: Array<{ Date: string; Price_per_gram: number | null }>;
}

const DailyChart: React.FC<DailyChartProps> = ({ data: dailyData }) => {
  // Filter out entries with null price and prepare data for chart.js
  const chartData = dailyData
    .filter(item => item.Price_per_gram !== null)
    .map(item => ({
      date: new Date(item.Date).toLocaleDateString(),
      price: item.Price_per_gram as number,
    }));

  // Sort data by date to ensure correct chart rendering
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Price (₹/gram)',
        data: chartData.map(item => item.price),
        borderColor: 'rgb(245, 158, 11)', // Amber color
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false, // Don't fill area under the line for now
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
        text: 'Historical Daily Gold Prices',
        color: '#e5e7eb' // gray-200
      },
      tooltip: {
        callbacks: {
            title: function(tooltipItems: any) {
                return tooltipItems[0].label; // Display date as title
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
          text: 'Date',
          color: '#d1d5db', // gray-300
          align: 'center' as 'center' // Explicitly set alignment to center and cast type
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
       {dailyData.length > 0 && chartData.length > 0 ? (
           <Line data={data} options={options} />
       ) : (
           <p className="text-center text-gray-500">No sufficient daily data for chart.</p>
       )}
    </div>
  );
};

export default DailyChart;