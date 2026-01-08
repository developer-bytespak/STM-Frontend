'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { JobStatusData } from '@/data/mockAdminData';

interface JobsStatusChartProps {
  data: any;
  period?: string;
  onPeriodChange?: (period: string) => void;
  summary?: any;
}

const statusColors: Record<string, string> = {
  new: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#10b981',
  paid: '#06b6d4',
  cancelled: '#ef4444',
  rejected_by_sp: '#ec4899',
  rejected_by_customer: '#8b5cf6',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  paid: 'Paid',
  cancelled: 'Cancelled',
  rejected_by_sp: 'Rejected by SP',
  rejected_by_customer: 'Rejected by Customer',
};

export default function JobsStatusChart({ data, period = '7days', onPeriodChange, summary }: JobsStatusChartProps) {
  // Transform summary data for pie chart
  const chartData: Array<{ name: string; count: number; color: string; percentage?: number; status?: string }> = [];
  
  // Console log for debugging
  console.log('JobsStatusChart - Raw summary from API:', summary);
  console.log('JobsStatusChart - Raw data:', data);
  
  if (summary && typeof summary === 'object') {
    // Use summary data from API response
    console.log('Using summary data from API');
    Object.entries(summary).forEach(([status, count]) => {
      console.log(`Processing status "${status}": ${count}, has label: ${!!statusLabels[status]}`);
      // Only include known statuses that have labels and colors defined
      if (status !== 'total' && typeof count === 'number' && count > 0 && statusLabels[status]) {
        console.log(`✓ Adding status "${status}" to chart`);
        chartData.push({
          name: statusLabels[status],
          count: count as number,
          color: statusColors[status],
          status: status,
        });
      }
    });
  } else if (Array.isArray(data) && data.length > 0) {
    // Handle daily distribution data - aggregate by status for pie chart
    console.log('Using daily distribution data from API');
    const statusAgg: Record<string, number> = {};
    
    data.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        // Only process known status keys
        if (key !== 'date' && key !== 'total' && typeof item[key] === 'number' && statusLabels[key]) {
          statusAgg[key] = (statusAgg[key] || 0) + item[key];
        }
      });
    });
    
    console.log('Aggregated status data:', statusAgg);
    
    Object.entries(statusAgg).forEach(([status, count]) => {
      if (count > 0) {
        chartData.push({
          name: statusLabels[status],
          count: count as number,
          color: statusColors[status],
          status: status,
        });
      }
    });
  }

  const totalJobs = chartData.reduce((sum, item) => sum + (item.count || 0), 0);
  
  // Prepare bar chart data from daily distribution
  const barChartData = Array.isArray(data) ? data.map((item: any) => ({
    date: item.date,
    new: item.new || 0,
    in_progress: item.in_progress || 0,
    completed: item.completed || 0,
    paid: item.paid || 0,
    cancelled: item.cancelled || 0,
    total: item.total || 0,
  })) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Jobs Distribution</h2>
          <p className="text-sm text-gray-500 mt-1">{period.replace(/([0-9]+)/, '$1 ')} distribution</p>
        </div>
        {/* Period Selector */}
        <div className="flex gap-2">
          {['7days', '30days', '90days', '1year'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === '7days' ? '7D' : p === '30days' ? '30D' : p === '90days' ? '90D' : '1Y'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Total: {totalJobs.toLocaleString()} jobs
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Daily Distribution */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px', color: '#111827' }}
                tick={{ fill: '#111827' }}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px', color: '#111827' }}
                tick={{ fill: '#111827' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) =>
                  `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color || '#6b7280' }}
            ></div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.count} jobs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

