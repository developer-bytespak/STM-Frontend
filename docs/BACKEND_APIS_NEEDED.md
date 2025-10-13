# 🔌 Backend APIs Still Needed for Admin Dashboard

This document outlines the backend endpoints that need to be implemented to make the Admin Dashboard fully functional with real data.

---

## ✅ **Already Implemented (Working)**

These endpoints are already working and integrated:

1. ✅ `GET /admin/service-requests/pending` - Get pending service requests
2. ✅ `POST /admin/service-requests/:id/approve` - Approve service request
3. ✅ `POST /admin/service-requests/:id/reject` - Reject service request
4. ✅ `GET /admin/services` - Get all services
5. ✅ `PUT /admin/services/:id` - Update service
6. ✅ `DELETE /admin/services/:id` - Delete service
7. ✅ `POST /admin/lsm/create` - Create LSM
8. ✅ `POST /admin/providers/:id/ban` - Ban provider
9. ✅ `POST /admin/providers/:id/unban` - Unban provider

---

## 🚧 **Priority 1: Dashboard Home - Critical**

### 1.1 Dashboard Statistics

**Endpoint:** `GET /admin/dashboard/stats`

**Purpose:** Display all key metrics on dashboard home

**Expected Response:**
```json
{
  "activeJobs": 45,
  "activeUsers": 1234,
  "revenueToday": 5678,
  "pendingApprovals": 8,
  "totalProviders": 156,
  "totalLSMs": 12,
  "trends": {
    "jobsGrowth": 12,
    "usersGrowth": 8,
    "revenueGrowth": 23,
    "providersGrowth": 15
  }
}
```

**NestJS Implementation:**

```typescript
// admin.controller.ts
@Get('dashboard/stats')
@ApiOperation({ summary: 'Get dashboard statistics' })
async getDashboardStats() {
  return this.adminService.getDashboardStats();
}
```

```typescript
// admin.service.ts
async getDashboardStats() {
  // Active Jobs (status: new, in_progress)
  const activeJobs = await this.prisma.jobs.count({
    where: { status: { in: ['new', 'in_progress'] } }
  });

  // Active Users (all users)
  const activeUsers = await this.prisma.users.count({
    where: { status: 'active' }
  });

  // Revenue Today (using jobs.price for now, will use payments table later)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const revenueToday = await this.prisma.jobs.aggregate({
    where: {
      status: 'completed',
      completed_at: {
        gte: today
      }
    },
    _sum: {
      price: true
    }
  });

  // Pending Approvals (service requests + documents)
  const pendingServiceRequests = await this.prisma.service_requests.count({
    where: {
      lsm_approved: true,
      admin_approved: false,
      final_status: 'pending'
    }
  });

  const pendingDocuments = await this.prisma.provider_documents.count({
    where: { verification_status: 'pending' }
  });

  const pendingApprovals = pendingServiceRequests + pendingDocuments;

  // Total Providers
  const totalProviders = await this.prisma.service_providers.count({
    where: { status: 'active' }
  });

  // Total LSMs
  const totalLSMs = await this.prisma.local_service_managers.count({
    where: { status: 'active' }
  });

  return {
    activeJobs,
    activeUsers,
    revenueToday: revenueToday._sum.price || 0,
    pendingApprovals,
    totalProviders,
    totalLSMs,
  };
}
```

---

### 1.2 Recent Activity Feed

**Endpoint:** `GET /admin/dashboard/activities`

**Query Parameters:**
- `limit` (optional, default: 10)

**Purpose:** Show recent platform activity

**Expected Response:**
```json
{
  "activities": [
    {
      "id": 1,
      "type": "job",
      "icon": "🟢",
      "message": "New job created by Jane Smith - Toilet Repair",
      "timestamp": "2025-10-08T10:28:00Z",
      "timeAgo": "2m ago",
      "status": "success",
      "relatedId": 123,
      "relatedType": "job"
    },
    {
      "id": 2,
      "type": "document",
      "icon": "📄",
      "message": "ABC Plumbing uploaded Business License",
      "timestamp": "2025-10-08T10:25:00Z",
      "timeAgo": "5m ago",
      "status": "pending",
      "relatedId": 45,
      "relatedType": "document"
    }
  ],
  "total": 156
}
```

**NestJS Implementation:**

```typescript
// admin.controller.ts
@Get('dashboard/activities')
@ApiOperation({ summary: 'Get recent platform activities' })
async getRecentActivities(@Query('limit') limit = 10) {
  return this.adminService.getRecentActivities(limit);
}
```

```typescript
// admin.service.ts
async getRecentActivities(limit: number) {
  // You can use notifications table or create unified query
  const notifications = await this.prisma.notifications.findMany({
    where: {
      recipient_type: 'admin', // Filter for admin visibility
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  const activities = notifications.map(notif => ({
    id: notif.id,
    type: this.getActivityType(notif.type),
    icon: this.getActivityIcon(notif.type),
    message: notif.message,
    timestamp: notif.created_at,
    timeAgo: this.formatTimeAgo(notif.created_at),
    status: this.getActivityStatus(notif.type),
    relatedId: notif.related_id,
    relatedType: notif.type,
  }));

  const total = await this.prisma.notifications.count({
    where: { recipient_type: 'admin' }
  });

  return { activities, total };
}

private getActivityType(type: string): string {
  // Map notification type to activity type
  if (type.includes('job')) return 'job';
  if (type.includes('document')) return 'document';
  if (type.includes('service')) return 'service_request';
  if (type.includes('payment')) return 'payment';
  return 'system';
}

private getActivityIcon(type: string): string {
  const icons = {
    job: '🟢',
    document: '📄',
    service_request: '✅',
    payment: '💰',
    user: '👤',
    provider: '👔',
  };
  return icons[this.getActivityType(type)] || '📌';
}

private getActivityStatus(type: string): string {
  if (type.includes('pending')) return 'pending';
  if (type.includes('approved')) return 'success';
  if (type.includes('rejected')) return 'warning';
  return 'info';
}

private formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

---

### 1.3 Pending Documents Count

**Endpoint:** `GET /admin/documents/pending`

**Purpose:** Get count and list of pending provider documents

**Expected Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "providerId": 1,
      "providerName": "ABC Plumbing",
      "type": "Business License",
      "url": "https://...",
      "uploadedAt": "2025-10-08T08:00:00Z",
      "verificationStatus": "pending"
    }
  ],
  "total": 12
}
```

**NestJS Implementation:**

```typescript
// admin.controller.ts
@Get('documents/pending')
@ApiOperation({ summary: 'Get pending documents for verification' })
async getPendingDocuments() {
  return this.adminService.getPendingDocuments();
}
```

```typescript
// admin.service.ts
async getPendingDocuments() {
  const documents = await this.prisma.provider_documents.findMany({
    where: { verification_status: 'pending' },
    include: {
      provider: {
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            }
          }
        }
      }
    },
    orderBy: { uploaded_at: 'desc' },
  });

  const formatted = documents.map(doc => ({
    id: doc.id,
    providerId: doc.provider_id,
    providerName: doc.provider.business_name,
    type: doc.document_type,
    url: doc.file_url,
    uploadedAt: doc.uploaded_at,
    verificationStatus: doc.verification_status,
  }));

  return {
    documents: formatted,
    total: documents.length,
  };
}
```

---

### 1.4 Pending Disputes Count

**Endpoint:** `GET /admin/disputes`

**Query Parameters:**
- `status` (optional) - "open", "resolved"

**Purpose:** Get disputes that need admin attention

**Expected Response:**
```json
{
  "disputes": [
    {
      "id": 1,
      "jobId": 123,
      "serviceName": "Toilet Clog",
      "customerId": 4,
      "customerName": "Jane Smith",
      "providerId": 1,
      "providerName": "ABC Plumbing",
      "issue": "Service not completed properly",
      "status": "open",
      "priority": "high",
      "createdAt": "2025-10-08T08:00:00Z"
    }
  ],
  "total": 3
}
```

**NestJS Implementation:**

```typescript
// admin.controller.ts
@Get('disputes')
@ApiOperation({ summary: 'Get disputes' })
async getDisputes(@Query('status') status?: string) {
  return this.adminService.getDisputes(status);
}
```

```typescript
// admin.service.ts
async getDisputes(status?: string) {
  const where: any = {};
  if (status) {
    where.status = status;
  } else {
    where.status = 'open'; // Default to open disputes
  }

  const disputes = await this.prisma.disputes.findMany({
    where,
    include: {
      job: {
        include: {
          service: true,
          customer: {
            include: { user: true }
          },
          provider: true,
        }
      }
    },
    orderBy: { created_at: 'desc' },
  });

  const formatted = disputes.map(dispute => ({
    id: dispute.id,
    jobId: dispute.job_id,
    serviceName: dispute.job.service.name,
    customerId: dispute.job.customer_id,
    customerName: `${dispute.job.customer.user.first_name} ${dispute.job.customer.user.last_name}`,
    providerId: dispute.job.provider_id,
    providerName: dispute.job.provider.business_name,
    issue: dispute.description,
    status: dispute.status,
    priority: dispute.priority || 'medium',
    createdAt: dispute.created_at,
  }));

  return {
    disputes: formatted,
    total: disputes.length,
  };
}
```

---

## 🚧 **Priority 2: Revenue & Analytics (When Payments Table Ready)**

### 2.1 Revenue Chart Data

**Endpoint:** `GET /admin/dashboard/revenue-chart`

**Query Parameters:**
- `period` (optional, default: "30d") - "7d", "30d", "90d", "1y"

**Purpose:** Display revenue and jobs over time

**Expected Response:**
```json
{
  "chartData": [
    {
      "date": "Sep 8",
      "revenue": 4200,
      "jobs": 28
    },
    {
      "date": "Sep 11",
      "revenue": 4800,
      "jobs": 32
    }
  ],
  "summary": {
    "totalRevenue": 156789,
    "totalJobs": 1234,
    "avgRevenuePerJob": 127,
    "growth": 23
  }
}
```

**NestJS Implementation (For Phase 2):**

```typescript
// admin.controller.ts
@Get('dashboard/revenue-chart')
@ApiOperation({ summary: 'Get revenue chart data' })
async getRevenueChartData(@Query('period') period = '30d') {
  return this.adminService.getRevenueChartData(period);
}
```

```typescript
// admin.service.ts
async getRevenueChartData(period: string) {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Group by date
  const data = await this.prisma.$queryRaw`
    SELECT 
      DATE(completed_at) as date,
      SUM(price) as revenue,
      COUNT(*) as jobs
    FROM jobs
    WHERE status = 'completed'
      AND completed_at >= ${startDate}
    GROUP BY DATE(completed_at)
    ORDER BY date ASC
  `;

  const chartData = data.map((row: any) => ({
    date: this.formatDate(row.date),
    revenue: parseFloat(row.revenue),
    jobs: parseInt(row.jobs),
  }));

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalJobs = chartData.reduce((sum, d) => sum + d.jobs, 0);

  return {
    chartData,
    summary: {
      totalRevenue,
      totalJobs,
      avgRevenuePerJob: totalJobs > 0 ? totalRevenue / totalJobs : 0,
    }
  };
}

private formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date(date));
}
```

---

### 2.2 Jobs Distribution

**Endpoint:** `GET /admin/dashboard/jobs-distribution`

**Purpose:** Get jobs by status for pie/bar charts

**Expected Response:**
```json
{
  "distribution": [
    {
      "status": "New",
      "count": 12,
      "color": "#3b82f6"
    },
    {
      "status": "In Progress",
      "count": 23,
      "color": "#f59e0b"
    },
    {
      "status": "Completed",
      "count": 156,
      "color": "#10b981"
    },
    {
      "status": "Cancelled",
      "count": 8,
      "color": "#ef4444"
    }
  ],
  "total": 199
}
```

**NestJS Implementation:**

```typescript
// admin.controller.ts
@Get('dashboard/jobs-distribution')
@ApiOperation({ summary: 'Get jobs distribution by status' })
async getJobsDistribution() {
  return this.adminService.getJobsDistribution();
}
```

```typescript
// admin.service.ts
async getJobsDistribution() {
  const statusColors = {
    new: '#3b82f6',
    in_progress: '#f59e0b',
    completed: '#10b981',
    cancelled: '#ef4444',
  };

  const data = await this.prisma.jobs.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
    where: {
      created_at: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  });

  const distribution = data.map(item => ({
    status: this.formatStatusName(item.status),
    count: item._count.id,
    color: statusColors[item.status] || '#6b7280',
  }));

  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return { distribution, total };
}

private formatStatusName(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

---

## 🚧 **Priority 3: Management Pages**

### 3.1 Get All Providers

**Endpoint:** `GET /admin/providers`

**Query Parameters:**
- `search` (optional)
- `region` (optional)
- `status` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Expected Response:**
```json
{
  "providers": [
    {
      "id": 1,
      "businessName": "ABC Plumbing",
      "ownerName": "John Provider",
      "email": "john@abc.com",
      "phone": "+1234567890",
      "region": "New York",
      "zipCode": "10001",
      "rating": 4.8,
      "totalJobs": 156,
      "totalEarnings": 45678,
      "status": "active",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalProviders": 156,
    "limit": 20
  }
}
```

---

### 3.2 Get All LSMs ⭐ **NOW INTEGRATED IN FRONTEND**

**Endpoint:** `GET /admin/lsms`

**Purpose:** Get list of all Local Service Managers with stats

**Expected Response:**
```json
{
  "lsms": [
    {
      "id": 1,
      "name": "Lisa Manager",
      "email": "lisa@lsm.com",
      "phone": "+1234567891",
      "region": "New York",
      "status": "active",
      "stats": {
        "providersManaged": 45,
        "totalJobs": 234,
        "serviceRequestsReviewed": 67
      },
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

**NestJS Implementation:**

```typescript
// admin.controller.ts
@Get('lsms')
@ApiOperation({ summary: 'Get all LSMs with statistics' })
async getAllLSMs() {
  return this.adminService.getAllLSMs();
}
```

```typescript
// admin.service.ts
async getAllLSMs() {
  const lsms = await this.prisma.local_service_managers.findMany({
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
        }
      },
      _count: {
        select: {
          service_providers: true,
        }
      }
    },
    orderBy: { created_at: 'desc' },
  });

  // Get additional stats for each LSM
  const lsmsWithStats = await Promise.all(
    lsms.map(async (lsm) => {
      // Count total jobs from their providers
      const totalJobs = await this.prisma.jobs.count({
        where: {
          provider: {
            lsm_id: lsm.id,
          }
        }
      });

      // Count service requests reviewed
      const serviceRequestsReviewed = await this.prisma.service_requests.count({
        where: {
          provider: {
            lsm_id: lsm.id,
          },
          lsm_approved: true,
        }
      });

      return {
        id: lsm.id,
        name: `${lsm.user.first_name} ${lsm.user.last_name}`,
        email: lsm.user.email,
        phone: lsm.user.phone_number,
        region: lsm.region,
        status: lsm.status,
        stats: {
          providersManaged: lsm._count.service_providers,
          totalJobs,
          serviceRequestsReviewed,
        },
        createdAt: lsm.created_at,
      };
    })
  );

  return { lsms: lsmsWithStats };
}
```

**Frontend Integration:**
- ✅ Component created: `LSMRegionsCard`
- ✅ Uses mock data until endpoint is ready
- ✅ Automatically switches to real data when endpoint is implemented
- ✅ Shows LSMs grouped by region
- ✅ Displays statistics for each LSM

---

### 3.3 Get All Users

**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `search` (optional)
- `role` (optional)
- `status` (optional)
- `page` (optional)
- `limit` (optional)

---

### 3.4 Get All Jobs

**Endpoint:** `GET /admin/jobs`

**Query Parameters:**
- `status` (optional)
- `serviceId` (optional)
- `region` (optional)
- `page` (optional)
- `limit` (optional)

---

## 📝 **Summary**

### **Must Implement Now (Priority 1):**
1. ✅ `GET /admin/dashboard/stats` - Dashboard metrics
2. ✅ `GET /admin/dashboard/activities` - Activity feed
3. ✅ `GET /admin/documents/pending` - Pending documents
4. ✅ `GET /admin/disputes` - Disputes list
5. ⭐ `GET /admin/lsms` - LSM list (UI ready and waiting!)

### **Implement Later (Priority 2 - When Payments Ready):**
5. ⏳ `GET /admin/dashboard/revenue-chart` - Revenue analytics
6. ⏳ `GET /admin/dashboard/jobs-distribution` - Jobs chart

### **Implement for Other Pages (Priority 3):**
7. ⏳ `GET /admin/providers` - Providers list
8. ⏳ `GET /admin/lsms` - LSMs list
9. ⏳ `GET /admin/users` - Users list
10. ⏳ `GET /admin/jobs` - Jobs list

---

## 🔗 **Frontend Integration Status**

**Currently Using Real API:**
- ✅ Pending Service Requests count (from existing endpoint)
- ✅ Pending Actions card (real data)

**Currently Using Mock Data:**
- 🔄 Dashboard stats (6 metrics) - Will use real once endpoint is ready
- 🔄 Activity feed - Will use real once endpoint is ready
- 🔄 Revenue chart - Using mock (waiting for payments table)
- 🔄 Jobs distribution chart - Will use real once endpoint is ready

**When you implement Priority 1 endpoints, the dashboard will automatically use real data!** The frontend is already configured to switch from mock to real data seamlessly.

---

## 🎯 **Next Steps**

1. **Implement Priority 1 endpoints** (dashboard/stats, dashboard/activities, documents/pending, disputes)
2. **Test with Postman/Thunder Client**
3. **Frontend will automatically pick up real data** (no changes needed)
4. **Implement Priority 2** when payments table is ready
5. **Implement Priority 3** for other admin pages

---

**The integration is ready! Just implement the backend endpoints and everything will work! 🚀**

