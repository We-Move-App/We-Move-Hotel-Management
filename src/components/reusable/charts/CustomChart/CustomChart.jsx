import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import styles from './custom-chart.module.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, ArcElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ArcElement,
    Tooltip,
    Legend
);

const CustomChartComponent = ({ chartType, chartData, chartOptions }) => {
    const Component = chartType === 'line' ? Line
        : chartType === 'Bar' ? Bar
            : chartType === 'Doughnut' ? Doughnut : Line; // Add more chart types as needed

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Component data={chartData} options={chartOptions} />
        </div>
    );
};

export default CustomChartComponent;
