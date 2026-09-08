# Frontend-Backend Integration Test Plan

## Overview
This document outlines the complete integration testing for the stress monitoring system frontend and backend.

## Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5500` (or via IDE Live Server)
- Database seeded with test data
- AI scoring service running on `http://localhost:8000` (optional, will retry on failure)

## Test Scenarios

### 1. Authentication & Login Flow
**Objective:** Verify JWT token generation and user role-based routing

**Steps:**
1. Navigate to `http://localhost:5500/src/auth/login.html`
2. Enter credentials for test user (e.g., counsellor@test.com / password123)
3. Verify POST to `/api/v1/auth/login` succeeds
4. Verify response contains `token`, `name`, and `role`
5. Verify token is stored in `localStorage` as `token`
6. Verify user name stored as `loggedInUser`
7. Verify role-based redirect:
   - COUNSELLOR → counsellor-dashboard
   - DISTRICT → district-dashboard
   - STATE → state-dashboard
   - NATIONAL/ADMIN → national-dashboard

**Expected Results:**
- ✓ Redirect to correct dashboard based on role
- ✓ localStorage contains token and user data
- ✓ All profile names show actual logged-in user name (not "Akriti" or defaults)

---

### 2. Counsellor Dashboard - Alerts Integration
**Objective:** Verify alerts fetch and display from backend

**Steps:**
1. Login as COUNSELLOR role
2. Navigate to Counsellor Dashboard
3. Verify page calls `/api/v1/alerts` with Authorization header
4. Verify openAlertsContainer populates with alert items from API
5. Test Acknowledge button - click "Ack" on an alert
6. Verify POST to `/api/v1/alerts/{id}/ack` succeeds
7. Verify alert list refreshes after acknowledge

**Expected Results:**
- ✓ Alerts container initially empty (no hardcoded items)
- ✓ Alerts populate from `/api/v1/alerts` endpoint
- ✓ Each alert shows victim ID and risk tier
- ✓ Acknowledge button triggers POST and refreshes list
- ✓ No hardcoded alert text like "High distress score detected"

---

### 3. Dashboard Summary Stats
**Objective:** Verify all dashboard summary stats fetch from backend

**Steps:**
1. Login with any role
2. Navigate to relevant dashboard (counsellor/district/state/national)
3. Verify stats call `/api/v1/dashboard/summary` with Authorization
4. Verify response populates:
   - totalClients → total_monitored_victims
   - highRisk → high_risk_cases
   - criticalRisk → critical_cases
   - moderateRisk → moderate_risk_cases
   - lowRisk → low_risk_cases

**Expected Results:**
- ✓ Stats start as "-" (empty) before fetch completes
- ✓ Stats populate with real numbers from backend
- ✓ No hardcoded values like "128 Total Clients"
- ✓ Authorization header present in requests

---

### 4. Victim Dashboard - User Personalization
**Objective:** Verify victim dashboard shows actual logged-in user name

**Steps:**
1. Login as a test victim user (if available) or navigate directly
2. Verify profile name section shows logged-in user (not "Akriti")
3. Verify welcome message updates to "Good morning, [FirstName]!"
4. Verify all distress score stats show "-" (empty state)
   - Current Mood: -
   - Stress Level: -
   - Check-ins Today: -
   - Streak: -
   - Wellbeing Score: -

**Expected Results:**
- ✓ Profile shows actual user name from localStorage
- ✓ Welcome message personalizes first name
- ✓ All stats empty/blank until data received from backend
- ✓ No hardcoded mood value "Neutral"
- ✓ No hardcoded stress "42%"

---

### 5. Victim Dashboard - Check-in Submission
**Objective:** Verify check-in form submits to backend correctly

**Steps:**
1. On Victim Dashboard, click "Check-in" button
2. Enter response text when prompted
3. Verify POST to `/api/v1/checkins` with:
   - victimId (hardcoded demo UUID)
   - channel: "CHATBOT"
   - rawText: user's response
   - responseLatencySec: ~3.5
   - metadata: { mood: "Neutral" }
4. Verify response handling

**Expected Results:**
- ✓ Check-in submits successfully to `/api/v1/checkins`
- ✓ Success alert shows "Check-in submitted!"
- ✓ Network error shows "Failed to reach server..." message
- ✓ Data sent in correct format per PRD

---

### 6. Logout & Session Cleanup
**Objective:** Verify proper logout and token clearing

**Steps:**
1. Login to any dashboard
2. Click Logout button
3. Confirm logout
4. Verify `localStorage.clear()` executes (token, loggedInUser, userRole all cleared)
5. Verify redirect to login page
6. Try accessing dashboard without token - should redirect to login

**Expected Results:**
- ✓ All localStorage items cleared
- ✓ Redirect to login page
- ✓ Accessing dashboard without token redirects to login
- ✓ No sensitive data in localStorage after logout

---

### 7. Authorization & Protected Routes
**Objective:** Verify auth middleware blocks unauthorized access

**Steps:**
1. Clear localStorage (remove token)
2. Try accessing any dashboard URL directly
3. Verify redirect to login page

**Expected Results:**
- ✓ No token → redirect to login
- ✓ Expired/invalid token → redirect to login
- ✓ 401/403 responses trigger logout and redirect

---

### 8. Backend Error Handling
**Objective:** Verify graceful error handling when backend fails

**Steps:**
1. Stop backend service (simulate outage)
2. Try login - should show error message
3. Restart backend
4. Try login again - should succeed

**Expected Results:**
- ✓ Network errors show user-friendly messages
- ✓ No blank pages or console-only errors
- ✓ Recovery works after backend restarts

---

### 9. AI Scoring Retry Logic (PRD Compliance)
**Objective:** Verify check-in processing retries when ML service unavailable

**Steps:**
1. Submit check-in via victim dashboard
2. Stop ML scoring service (if running on localhost:8000)
3. Verify backend doesn't mark as FAILED
4. Verify status remains PENDING in queue
5. Restart ML service
6. Wait 3-5 seconds for retry scheduler
7. Verify check-in processes successfully

**Expected Results:**
- ✓ Exceptions in AiScoringService throw (don't return fallback)
- ✓ ScoringWorker resets status to PENDING on exception
- ✓ Item stays in retry queue instead of failing
- ✓ Retry succeeds when service returns online

---

### 10. Role-Based Access Control
**Objective:** Verify each role only sees their dashboard

**Steps:**
1. Login as COUNSELLOR
2. Try accessing district dashboard URL directly
3. Verify it either:
   - Shows unauthorized message, or
   - Redirects based on authenticated role
4. Repeat for DISTRICT, STATE, NATIONAL roles

**Expected Results:**
- ✓ Role-based routing enforced
- ✓ Users cannot access other role dashboards
- ✓ Backend validates role on each API call

---

## Checklist

### Frontend Cleanup ✓
- [x] Removed "Akriti Kumari" hardcoded names
- [x] Removed hardcoded alert items
- [x] Removed hardcoded chart data
- [x] Removed hardcoded stats values
- [x] All stats start as "-" or empty
- [x] Profile names populate from JWT token
- [x] Logout clears all localStorage

### Backend Integration ✓
- [x] Login endpoint returns JWT with user name and role
- [x] Dashboard summary endpoint working
- [x] Alerts endpoint working with auth
- [x] Alert acknowledge endpoint working
- [x] Check-in submission endpoint working
- [x] AI scoring throws on failure (triggers retry)
- [x] Scoring worker resets PENDING on exception
- [x] Role-based routing working

### Security ✓
- [x] Authorization headers sent with all API calls
- [x] Token stored in localStorage securely
- [x] Logout clears all auth data
- [x] No hardcoded credentials in code

---

## Running the Tests

1. **Start Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start Frontend (Live Server):**
   - VS Code: Open `src/auth/login.html` → Right-click → "Open with Live Server"
   - Or: `python -m http.server 5500` in project root

3. **Run Tests:**
   - Execute test scenarios manually
   - Check browser console for errors
   - Use DevTools Network tab to verify API calls
   - Check localStorage after each step

4. **Verify Logs:**
   - Backend: Check Spring Boot console for audit logs
   - Frontend: Check console for fetch errors
   - Database: Verify records created for check-ins, scores, alerts

---

## Known Limitations

- Victim dashboard uses hardcoded demo victim UUID (no victim login in current prototype)
- AI scoring service optional (check-ins retry if unavailable)
- Some dashboard widgets show static content (recommendations, upcoming check-ins)
- No real SMS/IVRS integration yet (SmsService mocked)

---

## Success Criteria

All tests pass when:
1. ✓ No default/hardcoded user names visible on any dashboard
2. ✓ All stats empty until backend data received
3. ✓ All API calls include Authorization header with JWT token
4. ✓ User can login, see personalized dashboard, check-in, and logout
5. ✓ Alerts fetch and display dynamically from backend
6. ✓ Error handling shows user-friendly messages
7. ✓ Logout clears all auth data
8. ✓ Unauthorized access redirects to login
