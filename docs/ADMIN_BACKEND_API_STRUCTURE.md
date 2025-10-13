# 🔌 Admin Dashboard - Backend API Requirements

This document outlines the complete backend API structure needed to make the Admin Dashboard fully functional with real data.

---

## 📋 Table of Contents

1. [Dashboard Home APIs](#1-dashboard-home-apis)
2. [User Management APIs](#2-user-management-apis)
3. [Provider Management APIs](#3-provider-management-apis)
4. [Service Management APIs](#4-service-management-apis)
5. [Job Management APIs](#5-job-management-apis)
6. [LSM Management APIs](#6-lsm-management-apis)
7. [Analytics & Reports APIs](#7-analytics--reports-apis)
8. [Activity & Notifications APIs](#8-activity--notifications-apis)
9. [Documents Management APIs](#9-documents-management-apis)
10. [Disputes Management APIs](#10-disputes-management-apis)
11. [Data Models](#11-data-models)

---

## 1. Dashboard Home APIs

### 1.1 Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard/stats`

**Description:** Get all key metrics for dashboard home page

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

**Database Queries Needed:**
```sql
-- Active Jobs (status: new, in_progress)
SELECT COUNT(*) FROM jobs WHERE status IN ('new', 'in_progress');

-- Active Users (all users except banned)
SELECT COUNT(*) FROM users WHERE status != 'banned';

-- Revenue Today
SELECT SUM(price) FROM jobs 
WHERE status = 'completed' 
AND DATE(updated_at) = CURDATE();

-- Pending Approvals
SELECT COUNT(*) FROM service_requests WHERE status = 'pending';
SELECT COUNT(*) FROM provider_documents WHERE verification_status = 'pending';

-- Total Providers
SELECT COUNT(*) FROM service_providers WHERE status = 'active';

-- Total LSMs
SELECT COUNT(*) FROM users WHERE role = 'lsm' AND status = 'active';
```

---

### 1.2 Get Recent Activity

**Endpoint:** `GET /api/admin/dashboard/activities`

**Query Parameters:**
- `limit` (optional, default: 10) - Number of activities to return
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

**Database Queries:**
```sql
-- Use notifications table or create activity_logs table
SELECT * FROM notifications 
WHERE recipient_id = 'admin' 
OR visibility = 'admin'
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;

-- Or combine from multiple sources:
(SELECT 'job' as type, id, created_at, ... FROM jobs ORDER BY created_at DESC LIMIT 5)
UNION ALL
(SELECT 'document' as type, id, uploaded_at as created_at, ... FROM provider_documents ORDER BY uploaded_at DESC LIMIT 5)
UNION ALL
(SELECT 'payment' as type, id, created_at, ... FROM payments ORDER BY created_at DESC LIMIT 5)
ORDER BY created_at DESC LIMIT 10;
```

---

### 1.3 Get Pending Actions

**Endpoint:** `GET /api/admin/dashboard/pending-actions`

**Response:**
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "id": 1,
        "type": "service_request",
        "title": "Service Requests",
        "description": "Awaiting admin approval",
        "count": 8,
        "priority": "high",
        "link": "/admin/services"
      },
      {
        "id": 2,
        "type": "document",
        "title": "Provider Documents",
        "description": "Pending verification",
        "count": 12,
        "priority": "high",
        "link": "/admin/providers"
      },
      {
        "id": 3,
        "type": "dispute",
        "title": "Disputes",
        "description": "Need attention",
        "count": 3,
        "priority": "medium",
        "link": "/admin/jobs"
      }
    ]
  }
}
```

**Database Queries:**
```sql
-- Service Requests Pending
SELECT COUNT(*) FROM service_requests 
WHERE status = 'pending' AND lsm_approved = true;

-- Documents Pending
SELECT COUNT(*) FROM provider_documents 
WHERE verification_status = 'pending';

-- Disputes
SELECT COUNT(*) FROM disputes WHERE status = 'open';

-- Provider Approvals
SELECT COUNT(*) FROM service_providers 
WHERE approval_status = 'pending';
```

---

### 1.4 Get Revenue Chart Data

**Endpoint:** `GET /api/admin/dashboard/revenue-chart`

**Query Parameters:**
- `period` (optional, default: "30d") - "7d", "30d", "90d", "1y"

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

**Database Query:**
```sql
SELECT 
  DATE(completed_at) as date,
  SUM(price) as revenue,
  COUNT(*) as jobs
FROM jobs
WHERE status = 'completed'
  AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(completed_at)
ORDER BY date ASC;
```

---

### 1.5 Get Jobs Status Distribution

**Endpoint:** `GET /api/admin/dashboard/jobs-distribution`

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

**Database Query:**
```sql
SELECT 
  status,
  COUNT(*) as count
FROM jobs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY status;
```

---

## 2. User Management APIs

### 2.1 Get All Users (with filters)

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**
- `search` (optional) - Search by name, email, phone
- `role` (optional) - "customer", "provider", "lsm", "admin"
- `status` (optional) - "active", "inactive", "banned"
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `sortBy` (optional) - "created_at", "last_login", "name"
- `sortOrder` (optional) - "asc", "desc"

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@test.com",
        "phone": "+1234567890",
        "role": "customer",
        "status": "active",
        "emailVerified": true,
        "createdAt": "2025-01-01T10:00:00Z",
        "lastLogin": "2025-10-08T09:30:00Z",
        "stats": {
          "totalJobs": 15,
          "totalSpent": 2340
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalUsers": 200,
      "limit": 20
    }
  }
}
```

**Database Query:**
```sql
SELECT 
  u.*,
  COUNT(DISTINCT j.id) as total_jobs,
  SUM(j.price) as total_spent
FROM users u
LEFT JOIN jobs j ON u.id = j.customer_id AND j.status = 'completed'
WHERE 
  (u.name LIKE '%search%' OR u.email LIKE '%search%' OR u.phone LIKE '%search%')
  AND (u.role = 'customer' OR 'all')
  AND (u.status = 'active' OR 'all')
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT 20 OFFSET 0;
```

---

### 2.2 Get User Details

**Endpoint:** `GET /api/admin/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@test.com",
      "phone": "+1234567890",
      "role": "customer",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2025-01-01T10:00:00Z",
      "lastLogin": "2025-10-08T09:30:00Z",
      "address": "123 Main St, New York, NY 10001"
    },
    "stats": {
      "totalJobs": 15,
      "totalSpent": 2340,
      "activeJobs": 2,
      "completedJobs": 12,
      "cancelledJobs": 1,
      "avgRating": 4.5
    },
    "recentJobs": [
      {
        "id": 123,
        "serviceName": "Toilet Repair",
        "providerName": "ABC Plumbing",
        "status": "in_progress",
        "price": 150,
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ]
  }
}
```

---

### 2.3 Update User Status

**Endpoint:** `PUT /api/admin/users/:id/status`

**Request Body:**
```json
{
  "status": "active" | "inactive" | "banned",
  "reason": "Optional reason for status change"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "userId": 1,
    "newStatus": "banned"
  }
}
```

---

### 2.4 Delete User

**Endpoint:** `DELETE /api/admin/users/:id`

**Description:** Soft delete a user

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 3. Provider Management APIs

### 3.1 Get All Providers

**Endpoint:** `GET /api/admin/providers`

**Query Parameters:**
- `search` (optional) - Search by business name, owner name
- `region` (optional) - Filter by region
- `status` (optional) - "active", "pending", "banned"
- `rating` (optional) - Filter by minimum rating
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `sortBy` (optional) - "rating", "total_jobs", "created_at"

**Response:**
```json
{
  "success": true,
  "data": {
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
        "approvalStatus": "approved",
        "lsmId": 1,
        "lsmName": "Lisa Manager",
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
}
```

---

### 3.2 Get Provider Details

**Endpoint:** `GET /api/admin/providers/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": 1,
      "businessName": "ABC Plumbing",
      "ownerName": "John Provider",
      "email": "john@abc.com",
      "phone": "+1234567890",
      "region": "New York",
      "zipCode": "10001",
      "address": "456 Business Ave, NY 10001",
      "experienceYears": 5,
      "rating": 4.8,
      "status": "active",
      "approvalStatus": "approved",
      "lsmId": 1,
      "lsmName": "Lisa Manager",
      "createdAt": "2025-01-01T10:00:00Z",
      "approvedAt": "2025-01-05T14:30:00Z"
    },
    "stats": {
      "totalJobs": 156,
      "completedJobs": 145,
      "cancelledJobs": 11,
      "totalEarnings": 45678,
      "avgJobValue": 315,
      "responseRate": 95,
      "acceptanceRate": 87,
      "totalReviews": 145,
      "avgRating": 4.8
    },
    "services": [
      {
        "id": 1,
        "name": "Toilet Clog",
        "categoryName": "Plumber",
        "jobsCompleted": 45
      },
      {
        "id": 2,
        "name": "Sink Repair",
        "categoryName": "Plumber",
        "jobsCompleted": 38
      }
    ],
    "documents": [
      {
        "id": 1,
        "type": "Business License",
        "url": "https://...",
        "verificationStatus": "verified",
        "uploadedAt": "2025-01-02T10:00:00Z",
        "verifiedAt": "2025-01-05T10:00:00Z",
        "verifiedBy": "Admin Name"
      }
    ],
    "recentJobs": [
      {
        "id": 123,
        "serviceName": "Toilet Repair",
        "customerName": "Jane Smith",
        "status": "completed",
        "price": 150,
        "createdAt": "2025-10-01T10:00:00Z",
        "completedAt": "2025-10-01T14:00:00Z"
      }
    ]
  }
}
```

---

### 3.3 Ban/Unban Provider

**Endpoint:** `POST /api/admin/providers/:id/ban`

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider banned successfully"
}
```

**Endpoint:** `POST /api/admin/providers/:id/unban`

---

### 3.4 Get Provider Documents

**Endpoint:** `GET /api/admin/providers/:id/documents`

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 1,
        "type": "Business License",
        "url": "https://...",
        "verificationStatus": "verified",
        "uploadedAt": "2025-01-02T10:00:00Z",
        "verifiedAt": "2025-01-05T10:00:00Z"
      }
    ]
  }
}
```

---

### 3.5 Get Provider Statistics

**Endpoint:** `GET /api/admin/providers/:id/stats`

**Query Parameters:**
- `period` (optional) - "7d", "30d", "90d", "all"

---

## 4. Service Management APIs

### 4.1 Get All Services

**Endpoint:** `GET /api/admin/services`

**Already exists ✅** (from your MD file)

---

### 4.2 Create Service

**Endpoint:** `POST /api/admin/services`

---

### 4.3 Update Service

**Endpoint:** `PUT /api/admin/services/:id`

**Already exists ✅**

---

### 4.4 Delete Service

**Endpoint:** `DELETE /api/admin/services/:id`

**Already exists ✅**

---

### 4.5 Get Service Requests (Pending)

**Endpoint:** `GET /api/admin/service-requests/pending`

**Already exists ✅**

---

### 4.6 Approve Service Request

**Endpoint:** `POST /api/admin/service-requests/:id/approve`

**Already exists ✅**

---

### 4.7 Reject Service Request

**Endpoint:** `POST /api/admin/service-requests/:id/reject`

**Already exists ✅**

---

## 5. Job Management APIs

### 5.1 Get All Jobs

**Endpoint:** `GET /api/admin/jobs`

**Query Parameters:**
- `status` (optional) - "new", "in_progress", "completed", "cancelled"
- `serviceId` (optional)
- `region` (optional)
- `dateFrom` (optional)
- `dateTo` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 123,
        "serviceName": "Toilet Clog",
        "categoryName": "Plumber",
        "customerName": "Jane Smith",
        "customerEmail": "jane@test.com",
        "providerName": "ABC Plumbing",
        "providerId": 1,
        "status": "in_progress",
        "price": 150,
        "region": "New York",
        "createdAt": "2025-10-08T10:00:00Z",
        "scheduledAt": "2025-10-15T14:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalJobs": 1000,
      "limit": 20
    }
  }
}
```

---

### 5.2 Get Job Details

**Endpoint:** `GET /api/admin/jobs/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": 123,
      "serviceName": "Toilet Clog",
      "categoryName": "Plumber",
      "status": "in_progress",
      "price": 150,
      "createdAt": "2025-10-08T10:00:00Z",
      "scheduledAt": "2025-10-15T14:00:00Z",
      "acceptedAt": "2025-10-08T10:05:00Z",
      "completedAt": null
    },
    "customer": {
      "id": 4,
      "name": "Jane Smith",
      "email": "jane@test.com",
      "phone": "+1234567893",
      "address": "123 Main St, New York, NY"
    },
    "provider": {
      "id": 1,
      "businessName": "ABC Plumbing",
      "ownerName": "John Provider",
      "phone": "+1234567892",
      "rating": 4.8
    },
    "timeline": [
      {
        "status": "created",
        "timestamp": "2025-10-08T10:00:00Z"
      },
      {
        "status": "accepted",
        "timestamp": "2025-10-08T10:05:00Z"
      },
      {
        "status": "in_progress",
        "timestamp": "2025-10-08T10:10:00Z"
      }
    ],
    "answers": [
      {
        "question": "Urgency Level",
        "answer": "Emergency"
      },
      {
        "question": "Toilet Type",
        "answer": "Standard"
      }
    ]
  }
}
```

---

### 5.3 Update Job Status

**Endpoint:** `PUT /api/admin/jobs/:id/status`

**Request Body:**
```json
{
  "status": "completed" | "cancelled",
  "reason": "Optional reason"
}
```

---

### 5.4 Cancel Job

**Endpoint:** `DELETE /api/admin/jobs/:id`

---

## 6. LSM Management APIs

### 6.1 Create LSM

**Endpoint:** `POST /api/admin/lsm/create`

**Already exists ✅**

---

### 6.2 Get All LSMs

**Endpoint:** `GET /api/admin/lsms`

**Response:**
```json
{
  "success": true,
  "data": {
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
          "serviceRequestsReviewed": 67,
          "documentsVerified": 123
        },
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 6.3 Get LSM Details

**Endpoint:** `GET /api/admin/lsms/:id`

---

### 6.4 Update LSM

**Endpoint:** `PUT /api/admin/lsms/:id`

---

### 6.5 Deactivate LSM

**Endpoint:** `DELETE /api/admin/lsms/:id`

---

## 7. Analytics & Reports APIs

### 7.1 Get Analytics Overview

**Endpoint:** `GET /api/admin/analytics/overview`

**Query Parameters:**
- `period` (optional, default: "30d") - "7d", "30d", "90d", "1y"

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 156789,
      "growth": 23,
      "avgPerJob": 127
    },
    "jobs": {
      "total": 1234,
      "completed": 1156,
      "cancelled": 78,
      "completionRate": 93.7
    },
    "users": {
      "newCustomers": 156,
      "newProviders": 23,
      "totalActive": 1234
    },
    "topServices": [
      {
        "id": 1,
        "name": "Toilet Clog",
        "jobs": 234,
        "revenue": 35100
      }
    ],
    "topProviders": [
      {
        "id": 1,
        "businessName": "ABC Plumbing",
        "jobs": 156,
        "earnings": 45678,
        "rating": 4.8
      }
    ]
  }
}
```

---

### 7.2 Get Revenue Analytics

**Endpoint:** `GET /api/admin/analytics/revenue`

**Query Parameters:**
- `from` (required) - Start date
- `to` (required) - End date
- `groupBy` (optional) - "day", "week", "month"

---

### 7.3 Export Report

**Endpoint:** `POST /api/admin/reports/export`

**Request Body:**
```json
{
  "type": "csv" | "pdf",
  "reportType": "revenue" | "providers" | "jobs" | "customers",
  "dateFrom": "2025-09-01",
  "dateTo": "2025-10-08",
  "region": "optional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://...",
    "expiresAt": "2025-10-08T18:00:00Z"
  }
}
```

---

## 8. Activity & Notifications APIs

### 8.1 Get Notifications

**Endpoint:** `GET /api/admin/notifications`

**Query Parameters:**
- `unread` (optional) - boolean
- `page` (optional)
- `limit` (optional)

---

### 8.2 Mark as Read

**Endpoint:** `PUT /api/admin/notifications/:id/read`

---

## 9. Documents Management APIs

### 9.1 Get Pending Documents

**Endpoint:** `GET /api/admin/documents/pending`

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

---

### 9.2 Verify Document

**Endpoint:** `POST /api/admin/documents/:id/verify`

**Request Body:**
```json
{
  "approved": true,
  "notes": "Optional notes"
}
```

---

### 9.3 Reject Document

**Endpoint:** `POST /api/admin/documents/:id/reject`

**Request Body:**
```json
{
  "reason": "Document is unclear/invalid"
}
```

---

## 10. Disputes Management APIs

### 10.1 Get All Disputes

**Endpoint:** `GET /api/admin/disputes`

**Query Parameters:**
- `status` (optional) - "open", "resolved", "closed"
- `page` (optional)
- `limit` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
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
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "total": 15
    }
  }
}
```

---

### 10.2 Get Dispute Details

**Endpoint:** `GET /api/admin/disputes/:id`

---

### 10.3 Resolve Dispute

**Endpoint:** `PUT /api/admin/disputes/:id/resolve`

**Request Body:**
```json
{
  "resolution": "Refund issued to customer",
  "action": "refund" | "warning" | "ban",
  "notes": "Optional admin notes"
}
```

---

### 10.4 Issue Refund

**Endpoint:** `POST /api/admin/disputes/:id/refund`

**Request Body:**
```json
{
  "amount": 150,
  "reason": "Service quality issue"
}
```

---

## 11. Data Models

### 11.1 User Model
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'lsm' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
  address?: string;
}
```

### 11.2 Provider Model
```typescript
interface ServiceProvider {
  id: number;
  userId: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  region: string;
  zipCode: string;
  address: string;
  experienceYears: number;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  status: 'active' | 'inactive' | 'banned';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  lsmId: number;
  createdAt: Date;
  approvedAt?: Date;
}
```

### 11.3 Job Model
```typescript
interface Job {
  id: number;
  serviceId: number;
  customerId: number;
  providerId?: number;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  region: string;
  address: string;
  scheduledAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}
```

---

## 🎯 Implementation Priority

### Phase 1 (High Priority)
1. ✅ Dashboard Statistics API
2. ✅ Recent Activity API
3. ✅ Pending Actions API
4. ✅ Revenue Chart API
5. ✅ Jobs Distribution API

### Phase 2 (Medium Priority)
6. ✅ Users Management APIs
7. ✅ Providers Management APIs
8. ✅ Jobs Management APIs
9. ✅ LSM Management APIs

### Phase 3 (Lower Priority)
10. ✅ Analytics APIs
11. ✅ Reports & Export APIs
12. ✅ Documents Management APIs
13. ✅ Disputes Management APIs

---

## 🔐 Authentication & Authorization

All admin endpoints should:
1. Require authentication (JWT token)
2. Require admin role
3. Log all actions for audit trail

**Example Middleware:**
```typescript
// Express.js example
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

router.get('/api/admin/dashboard/stats', authenticate, requireAdmin, getStats);
```

---

## 📊 Database Indexes Needed

For optimal performance, add these indexes:

```sql
-- Jobs table
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_provider_id ON jobs(provider_id);

-- Users table
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- Service Providers
CREATE INDEX idx_providers_status ON service_providers(status);
CREATE INDEX idx_providers_rating ON service_providers(rating);
CREATE INDEX idx_providers_lsm_id ON service_providers(lsm_id);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

---

## ✅ Testing Checklist

- [ ] All GET endpoints return correct data structure
- [ ] Pagination works correctly
- [ ] Filtering and search work as expected
- [ ] Update endpoints validate input data
- [ ] Delete endpoints perform soft deletes
- [ ] All endpoints require admin authentication
- [ ] Error responses follow consistent format
- [ ] Date ranges handle timezones correctly
- [ ] Large datasets paginate properly
- [ ] Charts data includes all date ranges

---

**This API structure will make your admin dashboard fully functional! 🚀**

