// frontend/src/pages/Reports/ReportsPayroll.jsx
import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartLine, FaBuilding } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getTotalSalaryCost, getSalaryByDepartment, getSalaryTrend } from '../../services/reportService';
import '../../styles/reports.css';

const ReportsPayroll = () => {
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [totalCost, setTotalCost] = useState(null);
    const [salaryByDept, setSalaryByDept] = useState([]);
    const [salaryTrend, setSalaryTrend] = useState([]);

    const years = [2023, 2024, 2025];

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cost, dept, trend] = await Promise.all([
                getTotalSalaryCost(selectedYear),
                getSalaryByDepartment(selectedYear),
                getSalaryTrend(selectedYear)
            ]);
            setTotalCost(cost);
            setSalaryByDept(dept || []);
            setSalaryTrend(trend || []);
        } catch (error) {
            console.error('Failed to fetch payroll reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Custom Tooltip cho Line Chart (đơn giản)
    const CustomLineTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value" style={{ color: '#4f46e5' }}>
                        {formatCurrency(payload[0]?.value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip cho Bar Chart
    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value" style={{ color: '#4f46e5' }}>
                        Total: {formatCurrency(payload[0]?.value)}
                    </p>
                    {payload[1] && (
                        <p className="tooltip-value" style={{ color: '#10b981' }}>
                            Average: {formatCurrency(payload[1]?.value)}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Payroll Reports</h1>
                <div className="filter-group">
                    <label>Year:</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="reports-summary">
                <div className="summary-card">
                    <div className="summary-icon green">
                        <FaMoneyBillWave size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Total Salary Cost</h3>
                        <p className="summary-value">{formatCurrency(totalCost?.total_cost || 0)}</p>
                        <span className="summary-sub">{totalCost?.employee_count || 0} employees</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon orange">
                        <FaChartLine size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Average Salary</h3>
                        <p className="summary-value">
                            {formatCurrency(totalCost?.total_cost / (totalCost?.employee_count || 1))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Salary by Department - Bar Chart */}
            <div className="reports-section">
                <h2><FaBuilding /> Salary by Department</h2>
                {salaryByDept && salaryByDept.length > 0 ? (
                    <ResponsiveContainer width="100%" height={450}>
                        <BarChart 
                            data={salaryByDept} 
                            margin={{ top: 20, right: 30, left: 50, bottom: 80 }}
                            barGap={0}
                            barSize={35}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="department" 
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={{ stroke: '#cbd5e1' }}
                                label={{ 
                                    value: 'Amount (VND)', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    style: { fill: '#64748b', fontSize: 12, fontWeight: 500 }
                                }}
                            />
                            <Tooltip content={<CustomBarTooltip />} />
                            <Legend 
                                verticalAlign="top" 
                                height={40}
                                iconType="circle"
                                formatter={(value) => <span style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{value}</span>}
                            />
                            <Bar 
                                dataKey="total_net" 
                                name="Total Salary" 
                                fill="#4f46e5" 
                                radius={[8, 8, 0, 0]} 
                                animationDuration={1000}
                            />
                            <Bar 
                                dataKey="avg_net" 
                                name="Average Salary" 
                                fill="#10b981" 
                                radius={[8, 8, 0, 0]} 
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="no-data">No data available</div>
                )}
            </div>

            {/* Salary Trend - Line Chart ĐƠN GIẢN VÀ ĐẸP */}
            <div className="reports-section chart-section">
                <h2><FaChartLine /> Salary Trend {selectedYear}</h2>
                {salaryTrend && salaryTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={salaryTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={{ stroke: '#cbd5e1' }}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={{ stroke: '#cbd5e1' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomLineTooltip />} />
                            <Legend 
                                verticalAlign="top" 
                                height={36}
                                iconType="circle"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="total_net" 
                                name="Total Salary" 
                                stroke="#4f46e5" 
                                strokeWidth={3} 
                                dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="no-data">No trend data available for {selectedYear}</div>
                )}
            </div>
        </div>
    );
};

export default ReportsPayroll;