# 🎨 Phase 3: Frontend & User Experience

**Goal:** Build intuitive React UI with Supabase auth  
**Estimated Time:** 3 Hours

## User Stories

### US-3.1: As a new user, I want to easily sign up and login
**Acceptance Criteria:**
- Clean signup/login forms
- Email validation
- Password strength indicator
- Error messages are clear
- Successful login redirects to dashboard

### US-3.2: As a user, I want to describe my legal issue conversationally
**Acceptance Criteria:**
- Chat-like interface
- Support for long text input
- Real-time feedback while processing
- Clear display of AI interpretation

### US-3.3: As a user, I want to review and download my legal documents
**Acceptance Criteria:**
- PDF preview in browser
- Download button
- Track document status
- See timeline of actions

### US-3.4: As a user, I want to see all my cases in one place
**Acceptance Criteria:**
- Dashboard shows all cases
- Filter by status
- Click to view details
- Visual status indicators

## Technical Tasks

### 1. Project Structure & Setup

- [ ] Configure Tailwind CSS in `tailwind.config.js`
- [ ] Set up routing with React Router:
  ```bash
  npm install react-router-dom
  ```

- [ ] Create folder structure:
  ```
  frontend/src/
  ├── components/
  │   ├── auth/
  │   │   ├── SignUp.jsx
  │   │   ├── Login.jsx
  │   │   └── ProtectedRoute.jsx
  │   ├── chat/
  │   │   ├── ChatInterface.jsx
  │   │   └── MessageBubble.jsx
  │   ├── cases/
  │   │   ├── CaseList.jsx
  │   │   ├── CaseCard.jsx
  │   │   └── CaseTimeline.jsx
  │   └── documents/
  │       ├── PDFViewer.jsx
  │       └── DocumentActions.jsx
  ├── contexts/
  │   └── AuthContext.jsx
  ├── services/
  │   ├── supabase.js
  │   └── api.js
  ├── pages/
  │   ├── Landing.jsx
  │   ├── Dashboard.jsx
  │   ├── NewCase.jsx
  │   └── CaseDetail.jsx
  └── App.jsx
  ```

### 2. Authentication Setup

- [ ] Create Supabase client (`services/supabase.js`):
  ```javascript
  import { createClient } from '@supabase/supabase-js'
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  export const supabase = createClient(supabaseUrl, supabaseKey)
  ```

- [ ] Create Auth Context (`contexts/AuthContext.jsx`):
  - [ ] Manage user session state
  - [ ] Sign up function
  - [ ] Login function
  - [ ] Logout function
  - [ ] Get current user
  - [ ] Listen to auth state changes

- [ ] Build SignUp component:
  - [ ] Email input with validation
  - [ ] Password input with strength indicator
  - [ ] Confirm password field
  - [ ] Terms acceptance checkbox
  - [ ] Submit handler
  - [ ] Error display
  - [ ] Link to login

- [ ] Build Login component:
  - [ ] Email input
  - [ ] Password input
  - [ ] Remember me checkbox
  - [ ] Forgot password link
  - [ ] Submit handler
  - [ ] Error display
  - [ ] Link to signup

- [ ] Create ProtectedRoute component:
  - [ ] Check if user is authenticated
  - [ ] Redirect to login if not
  - [ ] Show loading state

### 3. API Service Layer

- [ ] Create API service (`services/api.js`):
  ```javascript
  const API_BASE = 'http://localhost:8000/api'
  
  export const api = {
    // Get auth token from Supabase
    getAuthHeader: async () => {
      const { data } = await supabase.auth.getSession()
      return {
        'Authorization': `Bearer ${data.session?.access_token}`,
        'Content-Type': 'application/json'
      }
    },
    
    // Intake endpoint
    submitIncident: async (description, language = 'en') => {},
    
    // Generate draft
    generateDraft: async (caseId, kycData) => {},
    
    // Get cases
    getCases: async () => {},
    
    // Get case detail
    getCase: async (caseId) => {},
    
    // Update case status
    updateCaseStatus: async (caseId, status) => {},
    
    // Trigger nudge
    triggerNudge: async (caseId) => {}
  }
  ```

### 4. Landing Page

- [ ] Hero section with value proposition
- [ ] "How it works" section (3 steps)
- [ ] Features showcase
- [ ] CTA buttons (Sign Up / Login)
- [ ] Responsive design for mobile

### 5. Dashboard Page

- [ ] Header with user info and logout
- [ ] "New Case" button (prominent)
- [ ] Cases list/grid:
  - [ ] Status badges (Draft, Filed, Nudged, Resolved)
  - [ ] Date created
  - [ ] Brief description
  - [ ] Click to view details

- [ ] Filter/sort options:
  - [ ] All / Draft / Filed / Resolved
  - [ ] Sort by date

- [ ] Empty state when no cases

### 6. Chat Interface (New Case)

- [ ] Split-screen layout:
  - Left: Chat interface
  - Right: Document preview (appears after generation)

- [ ] Chat components:
  - [ ] Message history display
  - [ ] User message bubbles (right-aligned, blue)
  - [ ] AI message bubbles (left-aligned, gray)
  - [ ] Input textarea with auto-resize
  - [ ] Send button
  - [ ] Loading indicator while AI processes

- [ ] Flow:
  1. User describes incident
  2. Show loading state
  3. Display AI interpretation
  4. Show "Generate Formal Draft" button
  5. Mock DigiLocker connect button
  6. Generate and display PDF

### 7. Document Viewer Component

- [ ] PDF preview using iframe or react-pdf
- [ ] Download button
- [ ] Print button
- [ ] "Submit to Authorities" button (mock)
- [ ] Status indicator

### 8. Case Detail Page

- [ ] Case information card:
  - [ ] Incident description
  - [ ] Relevant laws identified
  - [ ] Current status
  - [ ] Created date

- [ ] Timeline component:
  - [ ] Drafted (date)
  - [ ] Filed (date)
  - [ ] Nudge sent (date)
  - [ ] Resolved (date)
  - [ ] Visual progress indicator

- [ ] Document section:
  - [ ] PDF viewer
  - [ ] Download button

- [ ] Actions:
  - [ ] Mark as filed
  - [ ] Trigger manual nudge
  - [ ] Mark as resolved

### 9. Styling & Responsiveness

- [ ] Create Tailwind theme:
  - [ ] Primary color (justice blue)
  - [ ] Secondary color (legal gold)
  - [ ] Success/warning/error colors
  - [ ] Typography scale

- [ ] Mobile-first responsive design:
  - [ ] Stack layout on mobile
  - [ ] Hamburger menu
  - [ ] Touch-friendly buttons
  - [ ] Readable font sizes

- [ ] Accessibility:
  - [ ] Proper ARIA labels
  - [ ] Keyboard navigation
  - [ ] Focus indicators
  - [ ] Color contrast compliance

### 10. Loading & Error States

- [ ] Loading spinners for async operations
- [ ] Skeleton screens for data loading
- [ ] Toast notifications for success/error
- [ ] Error boundaries for crash handling
- [ ] Retry mechanisms for failed requests

## Phase 3 Deliverables

✅ Complete authentication flow  
✅ Responsive dashboard  
✅ Chat interface for incident intake  
✅ PDF viewer and download  
✅ Case management UI  
✅ Timeline visualization  
✅ Mobile-friendly design  
✅ Error handling and loading states

## Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can login and session persists
- [ ] User can logout
- [ ] Protected routes redirect to login
- [ ] Chat interface sends messages
- [ ] AI responses display correctly
- [ ] PDF generates and displays
- [ ] Download button works
- [ ] Dashboard shows all cases
- [ ] Case detail page loads correctly
- [ ] Timeline shows accurate status
- [ ] Mobile layout works properly
- [ ] All buttons and links functional
- [ ] Error messages display clearly
- [ ] Loading states show appropriately
