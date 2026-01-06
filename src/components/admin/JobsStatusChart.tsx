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
}

export default function JobsStatusChart({ data, period = '7days', onPeriodChange }: JobsStatusChartProps) {
  // Handle both array and object data formats
  const chartData: Array<{ name: string; count: number; color: string; percentage?: number }> = Array.isArray(data) 
    ? data.map(item => ({
        name: item.status || 'Unknown',
        count: item.count || 0,
        color: item.color || '#6b7280',
        percentage: item.percentage || 0,
      }))
    : Object.entries(data || {}).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: count as number,
        color: '#6b7280',
      })) || [];

  const totalJobs = chartData.reduce((sum, item) => sum + (item.count || 0), 0);

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
        {/* Bar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="status"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
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
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6b7280'} />
                ))}
              </Bar>
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

