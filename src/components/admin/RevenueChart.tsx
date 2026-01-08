'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RevenueData } from '@/data/mockAdminData';

interface RevenueChartProps {
  data: any[];
  period?: string;
  onPeriodChange?: (period: string) => void;
}

export default function RevenueChart({ data, period = '7days', onPeriodChange }: RevenueChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
          <p className="text-sm text-gray-500 mt-1">{period.replace(/([0-9]+)/, '$1 ')} performance</p>
        </div>
        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-navy-600 rounded-full"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Jobs</span>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px', color: '#111827' }}
            tick={{ fill: '#111827' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="#6b7280"
            style={{ fontSize: '12px', color: '#111827' }}
            tick={{ fill: '#111827' }}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
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
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
              return [value, 'Jobs'];
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#1e3a8a"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="jobs"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorJobs)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

