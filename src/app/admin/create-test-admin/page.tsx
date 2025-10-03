'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateTestAdminPage() {
  const [adminData, setAdminData] = useState({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@serviceprostars.com',
    phone: '03001234567',
    password: 'admin123',
  });
  const [created, setCreated] = useState(false);

  const handleCreateAdmin = () => {
    const newAdmin = {
      id: Date.now().toString(),
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      phone: adminData.phone,
      password: adminData.password,
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };

    // Get existing users and add admin
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Remove any existing admin with same email
    const filteredUsers = existingUsers.filter((user: any) => user.email !== adminData.email);
    
    // Add new admin
    filteredUsers.push(newAdmin);
    localStorage.setItem('users', JSON.stringify(filteredUsers));

    setCreated(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setAdminData(prev => ({ ...prev, [field]: value }));
  };

  if (created) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Test Admin Created!
          </h1>
          
          <p className="text-gray-600 mb-6">
            You can now login as admin using the credentials below.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Login Credentials:</h3>
            <div className="text-left text-sm text-gray-700 space-y-1">
              <p><strong>Email:</strong> {adminData.email}</p>
              <p><strong>Password:</strong> {adminData.password}</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/admin/login"
              className="block w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Admin Login
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Test Admin
          </h1>
          <p className="text-gray-600">
            Create a test admin user for development purposes
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={adminData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={adminData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={adminData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={adminData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={adminData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleCreateAdmin}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Create Test Admin
          </button>

          <Link
            href="/"
            className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
