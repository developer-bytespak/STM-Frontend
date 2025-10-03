'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateTestLSMPage() {
  const [lsmData, setLsmData] = useState({
    firstName: 'Local',
    lastName: 'Manager',
    email: 'lsm@serviceprostars.com',
    phone: '03001234568',
    password: 'lsm123',
  });
  const [created, setCreated] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setLsmData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateLSM = () => {
    const newLSM = {
      id: Date.now().toString(),
      firstName: lsmData.firstName,
      lastName: lsmData.lastName,
      email: lsmData.email,
      phone: lsmData.phone,
      password: lsmData.password,
      role: 'local_service_manager',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };

    // Get existing users and add LSM
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Remove any existing LSM with same email
    const filteredUsers = existingUsers.filter((user: any) => user.email !== lsmData.email);
    
    // Add new LSM
    const updatedUsers = [...filteredUsers, newLSM];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setCreated(true);
  };

  if (created) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            LSM Created Successfully!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Local Service Manager account has been created. You can now login as LSM using the credentials below.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Login Credentials:</h3>
            <div className="text-left text-sm text-gray-700 space-y-1">
              <p><strong>Email:</strong> {lsmData.email}</p>
              <p><strong>Password:</strong> {lsmData.password}</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full bg-navy-600 text-white py-2 px-4 rounded-lg hover:bg-navy-700 transition-colors"
            >
              Go to Login
            </a>
            
            <Link
              href="/"
              className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👨‍💼</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Test LSM
          </h1>
          
          <p className="text-gray-600">
            Create a test Local Service Manager account for development and testing.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={lsmData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lsmData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={lsmData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={lsmData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={lsmData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleCreateLSM}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create LSM Account
          </button>

          <div className="text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
