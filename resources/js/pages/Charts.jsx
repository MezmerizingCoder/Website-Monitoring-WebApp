import React from 'react';

export default function Charts() {
  const lineCanvasRef = React.useRef(null);
  const pieCanvasRef = React.useRef(null);

  React.useEffect(() => {
    let lineChart = null;
    let pieChart = null;

    const loadCharts = async () => {
      const Chart = (await import('chart.js/auto')).default;

      if (lineCanvasRef.current) {
        lineChart = new Chart(lineCanvasRef.current, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 33000, 40000, 38000, 45000],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Expenses',
                data: [8000, 12000, 10000, 15000, 13000, 18000, 16000, 20000, 19000, 22000, 21000, 25000],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }

      if (pieCanvasRef.current) {
        pieChart = new Chart(pieCanvasRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Shoes', 'Shirts', 'Others'],
            datasets: [
              {
                data: [55, 31, 14],
                backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b'],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
            },
          },
        });
      }
    };

    loadCharts();

    return () => {
      if (lineChart) lineChart.destroy();
      if (pieChart) pieChart.destroy();
    };
  }, []);

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Charts</h2>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Line Chart */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-600 dark:text-gray-300">Revenue</h4>
          <canvas ref={lineCanvasRef} />
        </div>

        {/* Pie Chart */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h4 className="mb-4 font-semibold text-gray-600 dark:text-gray-300">Traffic Sources</h4>
          <canvas ref={pieCanvasRef} />
        </div>
      </div>
    </div>
  );
}
