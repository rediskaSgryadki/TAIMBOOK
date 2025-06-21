import React from 'react';
import { Pie } from 'react-chartjs-2';

const MonthChart = ({ data }) => {
  const chartData = {
    labels: ['Радость', 'Грусть', 'Нейтральный'],
    datasets: [{
      data: [data.joy, data.sadness, data.neutral],
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
    }],
  };

  return (
    <div className="rounded-3xl flex flex-col h-full min-h-[32vh] sm:min-h-[40vh] md:min-h-[50vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Эмоции за месяц</h2>
        {data.month && (
          <span className="text-sm text-gray-500 ml-2">{data.month}</span>
        )}
      </div>
      <div className="flex-1">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                displayColors: false,
                callbacks: {
                  label: function(context) {
                    let label = context.label || '';
                    // Add emoji based on label
                    let emoji = '';
                    if (label.includes('Радость')) {
                      emoji = '😃 ';
                    } else if (label.includes('Грусть')) {
                      emoji = '☹️ ';
                    } else if (label.includes('Нейтральный')) {
                      emoji = '😐 ';
                    }
                    
                    label = emoji + label;

                    if (context.parsed !== null) {
                      label += ': ' + context.parsed;
                    }
                    return label;
                  }
                }
              }
            },
          }}
        />
      </div>
      <div className="flex justify-between mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#22c55e] mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Радость</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Грусть</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Нейтральный</span>
        </div>
      </div>
    </div>
  );
};

export default MonthChart;
