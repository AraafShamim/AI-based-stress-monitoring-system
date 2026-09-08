# Frontend Testing Guide - MannSetu

## Quick Start Testing (No Backend Required)

You can verify the frontend functionality without running the full backend:

### 1. Serve the Frontend
```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js http-server
npx http-server . -p 8000 -c-1

# Option 3: Using PHP
php -S localhost:8000

# Option 4: Using VS Code Live Server extension
# Right-click on index.html -> "Open with Live Server"
```

### 2. Open in Browser
Navigate to: `http://localhost:8000/src/auth/login.html`

---

## Full Integration Testing (With Backend)

### Step 1: Start PostgreSQL Database
```bash
# Using Docker
docker-compose up postgres -d

# OR manually
# Ensure PostgreSQL is running on port 5432
# Database name: sih26094_db
# Username: postgres
# Password: postgres
```

### Step 2: Start Backend (Spring Boot)
```bash
cd backend

# Set environment variables
export DB_URL=jdbc:postgresql://localhost:5432/sih26094_db
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export AI_SERVICE_URL=http://localhost:8000

# Run with Maven (if installed)
mvn clean spring-boot:run

# OR using Maven wrapper (works without Maven)
./mvnw clean spring-boot:run   # Linux/Mac
mvnw.cmd clean spring-boot:run # Windows

# OR using the compiled JAR
mvn clean package
java -jar target/stress-monitoring-0.0.1-SNAPSHOT.jar
```

Backend will start on: `http://localhost:8080`

### Step 3: Start AI Service (FastAPI)
```bash
cd ai-service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set API keys in .env file
echo "GROQ_API_KEY=your_groq_key" > .env
echo "GEMINI_API_KEY=your_gemini_key" >> .env

# Run the service
python main.py
```

AI Service will start on: `http://localhost:8000`

### Step 4: Serve Frontend
```bash
# In root directory
python -m http.server 9000

# OR
npx http-server . -p 9000 -c-1
```

Frontend will be available at: `http://localhost:9000`

---

## Test Credentials

### For Counsellor Login
You need to create test users in the database. Use this SQL:

```sql
-- Insert test counsellor
INSERT INTO users (id, name, email, phone, role, jurisdiction, password_hash, is_active, phone_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Dr. Sarah Johnson',
    'counsellor@test.com',
    '9876543210',
    'COUNSELLOR',
    'District-Central',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIrsOdmWpClbkEZJXy/4VQj7TvJpqIq.',  -- password: password123
    true,
    true,
    NOW(),
    NOW()
);

-- Insert test district admin
INSERT INTO users (id, name, email, phone, role, jurisdiction, password_hash, is_active, phone_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'District Administrator',
    'district@test.com',
    '9876543211',
    'DISTRICT',
    'District-Central',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIrsOdmWpClbkEZJXy/4VQj7TvJpqIq.',  -- password: password123
    true,
    true,
    NOW(),
    NOW()
);

-- Insert test state admin
INSERT INTO users (id, name, email, phone, role, jurisdiction, password_hash, is_active, phone_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'State Administrator',
    'state@test.com',
    '9876543212',
    'STATE',
    'Maharashtra',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIrsOdmWpClbkEZJXy/4VQj7TvJpqIq.',  -- password: password123
    true,
    true,
    NOW(),
    NOW()
);

-- Insert test national admin
INSERT INTO users (id, name, email, phone, role, jurisdiction, password_hash, is_active, phone_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'National Administrator',
    'admin@test.com',
    '9876543213',
    'ADMIN',
    'India',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIrsOdmWpClbkEZJXy/4VQj7TvJpqIq.',  -- password: password123
    true,
    true,
    NOW(),
    NOW()
);
```

### Test Login Credentials
```
Email: counsellor@test.com
Password: password123

Email: district@test.com
Password: password123

Email: state@test.com
Password: password123

Email: admin@test.com
Password: password123
```

---

## Testing Checklist

### ✅ Authentication Tests
- [ ] Open login page: `http://localhost:9000/src/auth/login.html`
- [ ] Enter test credentials
- [ ] Click Login button
- [ ] Verify redirect to appropriate dashboard
- [ ] Check that real user name displays (not "Dr. Anjali Singh")
- [ ] Click Logout
- [ ] Verify redirect to login page
- [ ] Try invalid credentials → should show error
- [ ] Try empty fields → should show validation error

### ✅ Dashboard Tests
#### Victim Dashboard
- [ ] Navigate to victim dashboard
- [ ] Check user profile shows correct name
- [ ] Click Check-in button
- [ ] Enter response text
- [ ] Verify check-in submits successfully
- [ ] Check distress score updates
- [ ] Test mood buttons
- [ ] Verify date/time updates

#### Counsellor Dashboard
- [ ] Login as counsellor
- [ ] Check profile shows correct counsellor name
- [ ] Verify dashboard stats load from backend
- [ ] Check alerts section loads
- [ ] Try acknowledging an alert
- [ ] Test client search
- [ ] Click navigation items
- [ ] Test period tabs for trends

#### District/State/National Dashboards
- [ ] Login with respective credentials
- [ ] Verify correct name displays
- [ ] Check stats load from backend
- [ ] Test navigation items
- [ ] Verify logout works

### ✅ UI/UX Verification
- [ ] All colors match original design
- [ ] All fonts match original design
- [ ] All spacing matches original
- [ ] All buttons have correct styling
- [ ] Responsive design works on mobile
- [ ] No layout shifts or breaks
- [ ] Icons display correctly
- [ ] Animations work as before

### ✅ Error Handling
- [ ] Network error → shows appropriate message
- [ ] 401 error → redirects to login
- [ ] 500 error → shows error message
- [ ] Invalid form input → shows validation error
- [ ] Empty responses → handled gracefully

---

## Browser Console Tests

Open browser DevTools (F12) and check:

### Should See (Good)
```
✓ No red errors
✓ Successful API calls (200 status)
✓ Token stored in localStorage
✓ User data stored correctly
```

### Should NOT See (Bad)
```
✗ CORS errors
✗ 404 errors for JS modules
✗ Undefined variable errors
✗ Failed API calls (unless backend is down)
```

---

## Quick Verification Commands

### Check if services are running
```bash
# Check backend
curl http://localhost:8080/actuator/health

# Check AI service
curl http://localhost:8000/health

# Check frontend
curl http://localhost:9000/src/auth/login.html
```

### Check database connection
```bash
psql -h localhost -U postgres -d sih26094_db -c "SELECT COUNT(*) FROM users;"
```

---

## Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause**: Backend not running or wrong URL
**Solution**: Verify backend is running on port 8080

### Issue: "Unauthorized" on dashboard
**Cause**: Token expired or invalid
**Solution**: Logout and login again

### Issue: "Cannot use import outside a module"
**Cause**: HTML file not using `type="module"`
**Solution**: Verify script tag has `type="module"`

### Issue: CORS error
**Cause**: Backend CORS not configured for frontend URL
**Solution**: Update backend CORS configuration

### Issue: Dashboard shows no data
**Cause**: No data in database
**Solution**: Insert test data using SQL scripts

---

## Performance Testing

### Load Time Benchmarks
- Login page load: < 1 second
- Dashboard initial load: < 2 seconds
- API response time: < 500ms
- Check-in submission: < 1 second

### Network Traffic
- Initial page load: ~200KB (with cached resources)
- API payload: ~2-5KB per request
- Total requests: ~5-10 per page

---

## Automated Testing (Future)

The frontend is ready for automated testing frameworks:
- **Cypress** for E2E testing
- **Jest** for unit testing
- **Playwright** for cross-browser testing

Example test structure:
```javascript
// cypress/e2e/login.cy.js
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/src/auth/login.html');
    cy.get('#email').type('counsellor@test.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/counsellor-dashboard/');
  });
});
```

---

## Production Deployment Checklist

Before deploying to production:
- [ ] Update API URLs to production endpoints
- [ ] Enable HTTPS
- [ ] Minify JavaScript files
- [ ] Enable service worker for offline support
- [ ] Add analytics tracking
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Perform security audit
- [ ] Load testing
- [ ] Accessibility testing (WCAG 2.1)

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all services are running
3. Check network tab in DevTools
4. Verify database has test data
5. Clear browser cache and try again
6. Check `FRONTEND_IMPLEMENTATION_SUMMARY.md` for known limitations

---

**Last Updated**: September 8, 2026
**Version**: 1.0.0
**Status**: Production Ready (within backend constraints)
