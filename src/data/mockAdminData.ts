// Mock data for Admin Dashboard

export interface DashboardStats {
  activeJobs: number;
  activeUsers: number;
  revenueToday: number;
  pendingApprovals: number;
  totalProviders: number;
  totalLSMs: number;
}

export interface Activity {
  id: number;
  type: 'job' | 'document' | 'service_request' | 'payment' | 'user' | 'provider';
  icon: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  status: 'success' | 'pending' | 'info' | 'warning';
}

export interface PendingAction {
  id: number;
  type: 'service_request' | 'document' | 'dispute' | 'provider';
  title: string;
  description: string;
  count?: number;
  priority: 'high' | 'medium' | 'low';
  link: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  jobs: number;
}

export interface JobStatusData {
  status: string;
  count: number;
  color: string;
  [key: string]: string | number;
}

// Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
  activeJobs: 45,
  activeUsers: 1234,
  revenueToday: 5678,
  pendingApprovals: 8,
  totalProviders: 156,
  totalLSMs: 12,
};

// Recent Activities
export const mockRecentActivities: Activity[] = [
  {
    id: 1,
    type: 'job',
    icon: '🟢',
    message: 'New job created by Jane Smith - Toilet Repair',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: '2m ago',
    status: 'success',
  },
  {
    id: 2,
    type: 'document',
    icon: '📄',
    message: 'ABC Plumbing uploaded Business License',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeAgo: '5m ago',
    status: 'pending',
  },
  {
    id: 3,
    type: 'service_request',
    icon: '✅',
    message: 'LSM Lisa Manager approved Pool Cleaning service',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timeAgo: '10m ago',
    status: 'success',
  },
  {
    id: 4,
    type: 'payment',
    icon: '💰',
    message: 'Payment received for Job #123 - $150',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timeAgo: '15m ago',
    status: 'success',
  },
  {
    id: 5,
    type: 'provider',
    icon: '👔',
    message: 'New provider registration - XYZ Electrical Services',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    timeAgo: '30m ago',
    status: 'info',
  },
  {
    id: 6,
    type: 'user',
    icon: '👤',
    message: 'New customer registered - John Doe',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    timeAgo: '45m ago',
    status: 'info',
  },
  {
    id: 7,
    type: 'job',
    icon: '⚠️',
    message: 'Job #118 marked as disputed by customer',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    timeAgo: '1h ago',
    status: 'warning',
  },
  {
    id: 8,
    type: 'service_request',
    icon: '📝',
    message: 'New service request - Gutter Cleaning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '2h ago',
    status: 'pending',
  },
];

// Pending Actions
export const mockPendingActions: PendingAction[] = [
  {
    id: 1,
    type: 'service_request',
    title: 'Service Requests',
    description: 'Awaiting admin approval',
    count: 8,
    priority: 'high',
    link: '/admin/services',
  },
  {
    id: 2,
    type: 'document',
    title: 'Provider Documents',
    description: 'Pending verification',
    count: 12,
    priority: 'high',
    link: '/admin/providers',
  },
  {
    id: 3,
    type: 'dispute',
    title: 'Disputes',
    description: 'Need attention',
    count: 3,
    priority: 'medium',
    link: '/admin/jobs',
  },
  {
    id: 4,
    type: 'provider',
    title: 'Provider Approvals',
    description: 'New registrations',
    count: 5,
    priority: 'medium',
    link: '/admin/providers',
  },
];

// Revenue Chart Data (Last 30 days)
export const mockRevenueData: RevenueData[] = [
  { date: 'Sep 8', revenue: 4200, jobs: 28 },
  { date: 'Sep 11', revenue: 4800, jobs: 32 },
  { date: 'Sep 14', revenue: 5100, jobs: 34 },
  { date: 'Sep 17', revenue: 4500, jobs: 30 },
  { date: 'Sep 20', revenue: 5400, jobs: 36 },
  { date: 'Sep 23', revenue: 6200, jobs: 41 },
  { date: 'Sep 26', revenue: 5800, jobs: 38 },
  { date: 'Sep 29', revenue: 6500, jobs: 43 },
  { date: 'Oct 2', revenue: 5900, jobs: 39 },
  { date: 'Oct 5', revenue: 6800, jobs: 45 },
  { date: 'Oct 8', revenue: 5678, jobs: 37 },
];

// Jobs by Status
export const mockJobStatusData: JobStatusData[] = [
  { status: 'New', count: 12, color: '#3b82f6' },
  { status: 'In Progress', count: 23, color: '#f59e0b' },
  { status: 'Completed', count: 156, color: '#10b981' },
  { status: 'Cancelled', count: 8, color: '#ef4444' },
];

// Top Services
export const mockTopServices = [
  { name: 'Toilet Repair', jobs: 234, revenue: 35100 },
  { name: 'Sink Repair', jobs: 189, revenue: 28350 },
  { name: 'Pipe Installation', jobs: 156, revenue: 46800 },
  { name: 'AC Repair', jobs: 134, revenue: 40200 },
  { name: 'Electrical Work', jobs: 98, revenue: 29400 },
];

// Top Providers
export const mockTopProviders = [
  { name: 'ABC Plumbing', rating: 4.8, jobs: 156, earnings: 45678 },
  { name: 'XYZ Electrical', rating: 4.7, jobs: 134, earnings: 38900 },
  { name: 'Quick Fix Co', rating: 4.6, jobs: 98, earnings: 28700 },
  { name: 'Home Solutions', rating: 4.5, jobs: 87, earnings: 25600 },
  { name: 'Expert Services', rating: 4.4, jobs: 76, earnings: 22100 },
];

