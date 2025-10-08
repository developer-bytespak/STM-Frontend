'use client';

import React, { useState, useMemo } from 'react';
import { dummyCompletedJobs } from '@/data/dummyjobdone';

interface PaymentHistoryItem {
  id: string;
  jobId: number;
  customerName: string;
  serviceType: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  paymentDate: string;
  paymentMethod: string;
}

export default function ProviderEarnings() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate payment history from completed jobs
  const paymentHistory: PaymentHistoryItem[] = useMemo(() => {
    return dummyCompletedJobs.map(job => ({
      id: `payment-${job.id}`,
      jobId: job.id,
      customerName: `Customer ${job.id}`, // Mock customer name since not in data
      serviceType: job.serviceName,
      amount: job.totalCost,
      status: Math.random() > 0.8 ? 'pending' : Math.random() > 0.9 ? 'processing' : 'completed',
      paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'Bank Transfer'
    }));
  }, []);

  // Calculate earnings stats
  const totalEarnings = useMemo(() => {
    return paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  }, [paymentHistory]);

  const completedPayments = useMemo(() => {
    return paymentHistory.filter(payment => payment.status === 'completed');
  }, [paymentHistory]);

  const pendingPayments = useMemo(() => {
    return paymentHistory.filter(payment => payment.status === 'pending');
  }, [paymentHistory]);

  const completedEarnings = useMemo(() => {
    return completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [completedPayments]);

  const pendingEarnings = useMemo(() => {
    return pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [pendingPayments]);

  // Filter payments based on time and status
  const filteredPayments = useMemo(() => {
    let filtered = paymentHistory;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filter by time
    const now = new Date();
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(payment => new Date(payment.paymentDate) >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(payment => new Date(payment.paymentDate) >= monthAgo);
    }

    return filtered;
  }, [paymentHistory, timeFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="mt-2 text-gray-600">Track your payment history and earnings</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">${totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-blue-600">${completedEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">${pendingEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-3xl font-bold text-purple-600">{paymentHistory.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fi

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          </div>
          
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No payments found</p>
              <p className="text-gray-500">Complete some jobs to see your earnings here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{payment.serviceType}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                          <span className="mr-2">{getStatusIcon(payment.status)}</span>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Customer:</span> {payment.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> ${payment.amount}
                        </div>
                        <div>
                          <span className="font-medium">Payment Method:</span> {payment.paymentMethod}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(payment.paymentDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${payment.amount}</div>
                        <div className="text-sm text-gray-500">Job #{payment.jobId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredPayments.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Summary</h3>
                <p className="text-blue-700">
                  Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} 
                  {timeFilter !== 'all' && ` for ${timeFilter === 'week' ? 'this week' : 'this month'}`}
                  {statusFilter !== 'all' && ` with ${statusFilter} status`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">
                  ${filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)}
                </div>
                <div className="text-blue-700">Total Amount</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}