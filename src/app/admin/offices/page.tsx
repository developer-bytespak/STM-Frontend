'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OfficeSpace } from '@/types/office';
import { officeSpaceApi, transformOfficeSpace, transformCreateOfficeData, transformUpdateOfficeData } from '@/api/officeBooking';
import OfficeCard from '@/components/cards/OfficeCard';
import CreateOfficeModal from '@/components/admin/CreateOfficeModal';
import EditOfficeModal from '@/components/admin/EditOfficeModal';
// COMMENTED OUT - Advanced Features
// import OfficeAnalyticsCard from '@/components/admin/OfficeAnalyticsCard';
// import OfficeBookingsList from '@/components/admin/OfficeBookingsList';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
// COMMENTED OUT - Search functionality
// import Input from '@/components/ui/Input';
import { useAlert } from '@/hooks/useAlert';

export default function AdminOffices() {
  const [offices, setOffices] = useState<OfficeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState<OfficeSpace | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<OfficeSpace | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showAlert } = useAlert();
  // COMMENTED OUT - Search and filter functionality
  // const [searchQuery, setSearchQuery] = useState('');
  // const [statusFilter, setStatusFilter] = useState<string>('all');
  // const [typeFilter, setTypeFilter] = useState<string>('all');
  // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // const [showBookings, setShowBookings] = useState(false);
  // const [selectedOfficeBookings, setSelectedOfficeBookings] = useState<string | null>(null);

  // Load offices from API
  useEffect(() => {
    const loadOffices = async () => {
      try {
        setLoading(true);
        const response = await officeSpaceApi.getAllOffices();
        const transformedOffices = response.map(transformOfficeSpace);
        setOffices(transformedOffices);
      } catch (error) {
        console.error('Failed to load offices:', error);
        showAlert({
          title: 'Error',
          message: 'Failed to load office spaces. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadOffices();
  }, [showAlert]);

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

  const handleDelete = (office: OfficeSpace) => {
    setOfficeToDelete(office);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!officeToDelete) return;

    setDeleteLoading(true);
    try {
      await officeSpaceApi.deleteOffice(officeToDelete.id);
      setOffices(offices.filter(o => o.id !== officeToDelete.id));      
      showAlert({
        title: 'Success',
        message: 'Office space deleted successfully',
        type: 'success'
      });
      setDeleteConfirmOpen(false);
      setOfficeToDelete(null);
    } catch (error) {
      console.error('Failed to delete office:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to delete office space. Please try again.',
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setOfficeToDelete(null);
  };

  const handleCreateSuccess = async () => {
    try {
      const response = await officeSpaceApi.getAllOffices();
      const transformedOffices = response.map(transformOfficeSpace);    
      setOffices(transformedOffices);
      showAlert({
        title: 'Success',
        message: 'Office space created successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to refresh offices:', error);
    }
  };

  const handleEditSuccess = async () => {
    try {
      const response = await officeSpaceApi.getAllOffices();
      const transformedOffices = response.map(transformOfficeSpace);    
      setOffices(transformedOffices);
      showAlert({
        title: 'Success',
        message: 'Office space updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to refresh offices:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                href="/admin/bookings"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Bookings
              </Link>
              
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Spaces</span>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{offices.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Available</span>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {offices.filter(o => o.status === 'available').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cities</span>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {new Set(offices.map(o => o.location.city)).size}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Bookings</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {offices.reduce((sum, o) => sum + o.totalBookings, 0)}
            </p>
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

        {/* Office Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto"></div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Loading office spaces...</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please wait while we fetch your office spaces
              </p>
            </div>
          </div>
        ) : offices.length === 0 ? (
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
                onDelete={(officeId) => handleDelete(offices.find(o => o.id === officeId)!)}
                // COMMENTED OUT - Advanced booking management
                // onViewBookings={handleViewBookings}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Office Modal */}
      <CreateOfficeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Office Modal */}
      <EditOfficeModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOffice(null);
        }}
        office={selectedOffice}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Office Space"
        message={`Are you sure you want to delete "${officeToDelete?.name}"? This action cannot be undone and will permanently remove the office space from your listings.`}
        confirmButtonText="Delete Office"
        cancelButtonText="Cancel"
        confirmButtonVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}