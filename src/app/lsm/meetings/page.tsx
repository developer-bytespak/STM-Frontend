'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getLsmMeetings } from '@/api/meetings';
import { MeetingDetailsModal } from '@/components/lsm/sprequest';
import MeetingCard from '@/components/lsm/MeetingCard';
import { Meeting, MeetingStatus } from '@/types/meeting';
import { useAlert } from '@/hooks/useAlert';

export default function MeetingsPage() {
  const { showAlert, AlertComponent } = useAlert();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'pending' | 'completed' | 'cancelled'>('all');

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchMeetings();
  }, []);

  // If a providerId query param is present, auto-open the meeting for that provider after fetch
  useEffect(() => {
    const providerIdParam = searchParams?.get('providerId');
    if (!providerIdParam) return;

    const providerId = Number(providerIdParam);
    if (isNaN(providerId)) return;

    // If meetings already loaded, open; otherwise wait for fetch to complete and then open
    if (meetings.length > 0) {
      const match = meetings.find((m) => m.provider_id === providerId);
      if (match) {
        setSelectedMeeting(match);
        setShowDetailsModal(true);
        // ensure filter shows scheduled/all so it's visible
        setFilterStatus('all');
      }
    }
  }, [searchParams, meetings]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLsmMeetings();
      setMeetings(data);
    } catch (err: any) {
      console.error('Error fetching meetings:', err);
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const openMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
  };

  const closeMeetingDetails = () => {
    setShowDetailsModal(false);
    setSelectedMeeting(null);
  };

  const filteredMeetings = filterStatus === 'all' 
    ? meetings 
    : meetings.filter(m => m.meeting_status === filterStatus);

  const getStatusColor = (status: MeetingStatus) => {
    const colors = {
      scheduled: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: MeetingStatus) => {
    const icons = {
      scheduled: '✅',
      pending: '⏳',
      completed: '✓',
      cancelled: '✗',
    };
    return icons[status] || '⏳';
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Meetings</h1>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Meetings</h1>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {['all', 'scheduled', 'pending', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Meetings Grid */}
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {meetings.length === 0 ? 'No Meetings Yet' : 'No meetings in this status'}
            </h3>
            <p className="text-gray-500 mb-6">
              {meetings.length === 0 
                ? 'You haven\'t scheduled any meetings yet. Go to Service Provider Requests to schedule a meeting.'
                : 'Try selecting a different status or schedule a new meeting.'}
            </p>
            {meetings.length === 0 && (
              <a
                href="/lsm/sp-request"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📅 Schedule a Meeting
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} onClick={() => openMeetingDetails(meeting)}>
                <MeetingCard meeting={meeting} onView={openMeetingDetails} />
              </div>
            ))}
          </div>
        )}

        {/* Meeting Details Modal */}
        {showDetailsModal && selectedMeeting && (
          <MeetingDetailsModal
            meeting={selectedMeeting}
            onClose={closeMeetingDetails}
            onUpdate={fetchMeetings}
          />
        )}

        {/* Alert Component */}
        <AlertComponent />
      </div>
    </div>
  );
}
