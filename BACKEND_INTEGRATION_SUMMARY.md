# Provider Management Backend Integration

## ✅ Already Implemented

### API Endpoints
- `POST /admin/providers/:id/ban` - Ban a service provider
- `POST /admin/providers/:id/unban` - Unban a service provider

### Frontend Integration
- ✅ BanProviderModal with proper error handling
- ✅ UnbanConfirmModal with proper error handling
- ✅ Toast notification system for user feedback
- ✅ Proper error handling for all HTTP status codes
- ✅ React Query integration for data fetching and caching
- ✅ Automatic data refresh after ban/unban actions

## 🔄 Missing Backend Endpoint

### GET /admin/providers
**Status:** Not implemented yet (frontend falls back to mock data)

**Expected Response Format:**
```typescript
{
  providers: [
    {
      id: number;
      businessName: string;
      ownerName: string;
      email: string;
      region: string;
      lsmName: string;
      rating: number;
      totalJobs: number;
      totalEarnings: number;
      status: 'active' | 'inactive' | 'banned' | 'pending';
      createdAt: string;
    }
  ];
  total: number;
  page: number;
  limit: number;
}
```

**Query Parameters:**
- `search` - Search by business name, owner, email
- `region` - Filter by region
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## 🎯 Backend Implementation Needed

```typescript
// In your admin controller
@Get('providers')
@ApiOperation({ summary: 'Get all service providers with filters' })
@ApiResponse({ status: 200, description: 'Providers retrieved successfully' })
async getAllProviders(
  @Query('search') search?: string,
  @Query('region') region?: string,
  @Query('status') status?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
) {
  return this.adminService.getAllProviders({
    search,
    region,
    status,
    page,
    limit,
  });
}
```

```typescript
// In your admin service
async getAllProviders(filters: {
  search?: string;
  region?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  const { search, region, status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (search) {
    where.OR = [
      { business_name: { contains: search, mode: 'insensitive' } },
      { owner_name: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  
  if (region) {
    where.region = region;
  }
  
  if (status) {
    where.status = status;
  }

  const [providers, total] = await Promise.all([
    this.prisma.service_providers.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            email: true,
          },
        },
        lsm: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    }),
    this.prisma.service_providers.count({ where }),
  ]);

  return {
    providers: providers.map(provider => ({
      id: provider.id,
      businessName: provider.business_name,
      ownerName: provider.owner_name,
      email: provider.user.email,
      region: provider.region,
      lsmName: provider.lsm?.name || 'N/A',
      rating: provider.rating || 0,
      totalJobs: provider._count.jobs,
      totalEarnings: provider.total_earnings || 0,
      status: provider.status,
      createdAt: provider.created_at.toISOString(),
    })),
    total,
    page,
    limit,
  };
}
```

## 🚀 How to Test

1. **With Mock Data (Current):**
   - Navigate to `/admin/providers`
   - Try banning/unbanning providers
   - Check console for success/error messages

2. **With Real Backend:**
   - Implement the `GET /admin/providers` endpoint
   - The frontend will automatically use real data
   - Test ban/unban functionality with real API calls

## 📝 Notes

- The frontend gracefully handles both mock and real data
- Error handling covers all possible backend error scenarios
- Toast notifications provide immediate user feedback
- Data automatically refreshes after ban/unban actions
- All HTTP status codes are properly handled (400, 403, 404, etc.)
