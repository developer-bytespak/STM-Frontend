'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OfficeSpace } from '@/types/office';
import { mockOfficeSpaces, mockOfficeBookings, mockOfficeAnalytics } from '@/data/mockOfficeData';
import OfficeCard from '@/components/cards/OfficeCard';
import CreateOfficeModal from '@/components/admin/CreateOfficeModal';
import EditOfficeModal from '@/components/admin/EditOfficeModal';
// COMMENTED OUT - Advanced Features
// import OfficeAnalyticsCard from '@/components/admin/OfficeAnalyticsCard';
// import OfficeBookingsList from '@/components/admin/OfficeBookingsList';
import Button from '@/components/ui/Button';
// COMMENTED OUT - Search functionality
// import Input from '@/components/ui/Input';

export default function AdminOffices() {
  const [offices, setOffices] = useState<OfficeSpace[]>(mockOfficeSpaces);
  // COMMENTED OUT - Advanced filtering
  // const [filteredOffices, setFilteredOffices] = useState<OfficeSpace[]>(mockOfficeSpaces);
  const [selectedOffice, setSelectedOffice] = useState<OfficeSpace | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // COMMENTED OUT - Search and filter functionality
  // const [searchQuery, setSearchQuery] = useState('');
  // const [statusFilter, setStatusFilter] = useState<string>('all');
  // const [typeFilter, setTypeFilter] = useState<string>('all');
  // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // const [showBookings, setShowBookings] = useState(false);
  // const [selectedOfficeBookings, setSelectedOfficeBookings] = useState<string | null>(null);

  // COMMENTED OUT - Advanced filtering functionality
  // Filter offices based on search and filters
  // const handleFilter = () => {
  //   let filtered = [...offices];

  //   // Search filter
  //   if (searchQuery) {
  //     filtered = filtered.filter(office =>
  //       office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       office.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       office.description.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   // Status filter
  //   if (statusFilter !== 'all') {
  //     filtered = filtered.filter(office => office.status === statusFilter);
  //   }

  //   // Type filter
  //   if (typeFilter !== 'all') {
  //     filtered = filtered.filter(office => office.type === typeFilter);
  //   }

  //   setFilteredOffices(filtered);
  // };

  // Apply filters whenever search or filter values change
  // useEffect(() => {
  //   handleFilter();
  // }, [searchQuery, statusFilter, typeFilter]);

  const handleEdit = (office: OfficeSpace) => {
    setSelectedOffice(office);
    setEditModalOpen(true);
  };

  const handleDelete = (officeId: string) => {
    if (confirm('Are you sure you want to delete this office space?')) {
      setOffices(offices.filter(o => o.id !== officeId));
      // COMMENTED OUT - Advanced filtering
      // setFilteredOffices(filteredOffices.filter(o => o.id !== officeId));
    }
  };

  // COMMENTED OUT - Advanced booking management
  // const handleViewBookings = (officeId: string) => {
  //   setSelectedOfficeBookings(officeId);
  //   setShowBookings(true);
  // };

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  // const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setStatusFilter(e.target.value);
  // };

  // const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setTypeFilter(e.target.value);
  // };

  // Get bookings for selected office
  // const officeBookings = selectedOfficeBookings
  //   ? mockOfficeBookings.filter(b => b.officeId === selectedOfficeBookings)
  //   : mockOfficeBookings;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
    <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Office Space Management</h1>
              <p className="text-lg text-gray-600">
                Manage shared office spaces and real estate listings
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setCreateModalOpen(true)}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Office Space
              </Button>
              
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* COMMENTED OUT - Analytics */}
        {/* <OfficeAnalyticsCard analytics={mockOfficeAnalytics} /> */}

        {/* COMMENTED OUT - Tabs */}
        {/* <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowBookings(false)}
              className={`${
                !showBookings
                  ? 'border-navy-600 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Office Spaces ({filteredOffices.length})
            </button>
            <button
              onClick={() => setShowBookings(true)}
              className={`${
                showBookings
                  ? 'border-navy-600 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              All Bookings ({mockOfficeBookings.length})
            </button>
          </nav>
        </div> */}

        {/* COMMENTED OUT - Advanced filtering and tabs */}
        {/* Office Spaces View */}
        {/* {!showBookings && ( */}
          <>
            {/* COMMENTED OUT - Filters */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search by name, city, or description..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="booked">Booked</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="private_office">Private Office</option>
                  <option value="shared_desk">Shared Desk</option>
                  <option value="meeting_room">Meeting Room</option>
                  <option value="conference_room">Conference Room</option>
                  <option value="coworking_space">Coworking Space</option>
                </select>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredOffices.length} of {offices.length} office spaces
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid'
                        ? 'bg-navy-100 text-navy-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list'
                        ? 'bg-navy-100 text-navy-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div> */}

            {/* SIMPLIFIED - Office Cards Grid */}
            {offices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No office spaces found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first office space to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offices.map((office) => (
                  <OfficeCard
                    key={office.id}
                    office={office}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    // COMMENTED OUT - Advanced booking management
                    // onViewBookings={handleViewBookings}
                  />
                ))}
              </div>
            )}
          </>
        {/* )} */}

        {/* COMMENTED OUT - Bookings View */}
        {/* {showBookings && (
          <OfficeBookingsList bookings={officeBookings} />
        )} */}
      </div>

      {/* Create Office Modal */}
      <CreateOfficeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          // In a real app, refetch data here
          console.log('Office created successfully');
        }}
      />

      {/* Edit Office Modal */}
      <EditOfficeModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOffice(null);
        }}
        office={selectedOffice}
        onSuccess={() => {
          // In a real app, refetch data here
          console.log('Office updated successfully');
        }}
      />
    </div>
  );
}