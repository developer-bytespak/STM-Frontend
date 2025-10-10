# Homepage API Integration - Testing Guide

## 🚀 Quick Start

### Prerequisites
1. Backend running on `http://localhost:8000`
2. Services seeded: `npx ts-node prisma/seed-services.ts` (in STM-Backend)
3. Frontend running: `npm run dev` (in STM-Frontend)

---

## 🧪 Test Scenarios

### **Scenario 1: Happy Path - Complete Search Flow**

**Steps:**
1. Open homepage: `http://localhost:3000`
2. Type "clean" in service search
3. **Expected:** Dropdown shows categories and services from backend
4. Click "Interior Cleaning" category
5. **Expected:** Shows granular service buttons (House Cleaning, Office Cleaning)
6. Click "House Cleaning"
7. **Expected:** Location search becomes enabled
8. Type "75" in location search
9. **Expected:** Dropdown shows ZIP codes from backend (75001, 75002, etc.)
10. Click "75001"
11. **Expected:** 
    - Loading spinner appears
    - Provider search API called with `{ service: "House Cleaning", zipcode: "75001" }`
    - Results display with providers

**✅ Success Criteria:**
- All dropdowns show real backend data (not dummy data)
- Loading states appear during API calls
- Providers display with correct information

---

### **Scenario 2: Service with No Granular Services (Standalone)**

**Steps:**
1. Type "eng" in service search
2. Click "Engineer" category
3. **Expected:** Directly proceeds to location search (no granular options)
4. Type and select a location
5. **Expected:** Provider search executes

**✅ Success Criteria:**
- No granular service buttons shown
- Smooth transition to location search

---

### **Scenario 3: No Results**

**Steps:**
1. Type "xyz123" in service search
2. **Expected:** "No services found" message in dropdown
3. Type "clean", select service
4. Type "99999" in location search
5. **Expected:** "No locations found" message
6. Use valid location, complete search
7. **Expected:** If no providers exist, shows "0 providers found"

**✅ Success Criteria:**
- Empty states show appropriate messages
- No errors in console

---

### **Scenario 4: Error Handling**

**Steps:**
1. Stop backend server
2. Try to search for a service
3. **Expected:** Error appears in console
4. Complete service + location search
5. **Expected:** Error message displays with "Start New Search" button
6. Click "Start New Search"
7. **Expected:** Returns to initial state

**✅ Success Criteria:**
- User-friendly error messages
- Recovery option available
- No crashes

---

### **Scenario 5: Debouncing**

**Steps:**
1. Type "c" → wait → type "l" → wait → type "e" → wait → type "a" → wait → type "n"
2. Watch Network tab in DevTools

**Expected:**
- API calls only fire 300ms after typing stops
- Not on every keystroke
- Maximum efficiency

**✅ Success Criteria:**
- Limited number of API calls
- Only calls after debounce delay

---

### **Scenario 6: URL State Persistence**

**Steps:**
1. Complete a search (service + location)
2. Copy URL (should have `?service=X&category=Y&location=Z`)
3. Refresh page
4. **Expected:** Search state restored from URL
5. Results display again

**✅ Success Criteria:**
- URL params restore search state
- Results appear without re-searching

---

### **Scenario 7: Clear Functionality**

**Steps:**
1. Search for service → Clear (X button)
2. **Expected:** Service search clears, location disabled
3. Search service + location → Clear from results
4. **Expected:** Returns to initial state, URL cleared

**✅ Success Criteria:**
- Clear buttons work
- State resets properly
- URL updates

---

## 🔍 What to Check in Browser DevTools

### **Network Tab:**
Check these API calls are made:

1. **Service Search:**
   ```
   GET /homepage/search/services?query=clean
   Status: 200
   Response: { success: true, data: [...] }
   ```

2. **Category Services:**
   ```
   GET /homepage/search/services/category/Interior%20Cleaning
   Status: 200
   Response: { success: true, data: { category: "...", services: [...] } }
   ```

3. **Location Search:**
   ```
   GET /homepage/search/locations?query=75&limit=10
   Status: 200
   Response: { success: true, data: [...] }
   ```

4. **Provider Search:**
   ```
   POST /homepage/search/providers
   Body: { "service": "House Cleaning", "zipcode": "75001" }
   Status: 200
   Response: { success: true, data: { providers: [...], count: X } }
   ```

### **Console Tab:**
- ✅ No errors
- ✅ Only expected logs (search results, etc.)
- ❌ No "failed to fetch" errors (unless testing error scenario)

---

## 📊 Data Validation

### **Service Search Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "category",
      "category": "Interior Cleaning",
      "id": 1,
      "description": "..."
    },
    {
      "type": "service",
      "category": "Interior Cleaning",
      "name": "House Cleaning",
      "id": 10,
      "description": "..."
    }
  ]
}
```

### **Provider Search Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": 1,
        "businessName": "Sparkle Clean Dallas",
        "ownerName": "Emily Davis",
        "rating": 4.5,
        "totalJobs": 145,
        "experience": 7,
        "description": "...",
        "location": "Dallas, TX",
        "minPrice": 50,
        "maxPrice": 80,
        "phoneNumber": "+1-555-0106",
        "serviceAreas": ["75001", "75002"],
        "services": [...]
      }
    ],
    "count": 1,
    "service": {
      "id": 10,
      "name": "House Cleaning",
      "category": "Interior Cleaning"
    },
    "location": "75001"
  }
}
```

---

## 🐛 Known Issues / Edge Cases

### **Issue: Location string format**
- Backend returns: `"75001"`
- Frontend might display: `"75001"` or `"75001 - Dallas, TX"` depending on backend
- **Fix:** Check `formattedAddress` field in location results

### **Issue: Provider ID type**
- Backend: `id: 1` (number)
- ProviderCard expects: `id: "1"` (string)
- **Fix:** Already handled in transformation function ✅

### **Issue: Experience format**
- Backend: `experience: 7` (number)
- ProviderCard expects: `experience: "7 years"` (string)
- **Fix:** Already handled in transformation function ✅

---

## ✅ Acceptance Criteria

### **Integration is successful if:**
- [x] All 4 API endpoints are called correctly
- [x] Service search shows real backend data
- [x] Location search shows real backend data
- [x] Provider search shows real backend data
- [x] Loading states appear during API calls
- [x] Error messages show on failures
- [x] Debouncing works (limited API calls)
- [x] URL state persistence works
- [x] Clear functionality works
- [x] No linter errors
- [x] No console errors (except when testing error scenarios)
- [x] Provider cards display correctly
- [x] Data transformation works (backend → frontend types)

---

## 🔧 Debugging Tips

### **If API calls don't fire:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` env variable
3. Check backend is running on correct port
4. Test endpoints directly in Postman

### **If data doesn't display:**
1. Check Network tab → Response data
2. Check console for transformation errors
3. Verify provider transformation in ResultsDisplay
4. Check HomepageProvider type matches backend

### **If debouncing doesn't work:**
1. Check useEffect dependencies
2. Verify timeout cleanup in ServiceSearch/CitySearch
3. Adjust delay from 300ms if needed

---

## 📞 Support

If you encounter issues:
1. Check this testing guide
2. Check `HOMEPAGE_API_INTEGRATION_SUMMARY.md`
3. Check backend `HOMEPAGE_API_TESTING_GUIDE.md`
4. Review browser console and Network tab

---

**Happy Testing!** 🎉

