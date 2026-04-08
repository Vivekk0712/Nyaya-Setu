# Nyaya-Setu User Stories

## Epic 1: User Authentication & Onboarding

### US-1.1: Account Creation
**As a** new user  
**I want to** create an account with email and password  
**So that** I can access the legal assistance platform

**Acceptance Criteria:**
- User can sign up with valid email
- Password must be at least 6 characters
- Email validation is performed
- User receives confirmation
- Session is created automatically after signup

### US-1.2: User Login
**As a** registered user  
**I want to** log in to my account  
**So that** I can access my cases and documents

**Acceptance Criteria:**
- User can login with email/password
- Invalid credentials show clear error message
- Session persists across page refreshes
- User is redirected to dashboard after login

### US-1.3: Session Management
**As a** logged-in user  
**I want to** stay logged in across sessions  
**So that** I don't have to login repeatedly

**Acceptance Criteria:**
- Session token is stored securely
- User remains logged in after browser refresh
- User can logout manually
- Session expires after appropriate time

## Epic 2: Legal Issue Intake

### US-2.1: Describe Incident
**As a** user with a legal issue  
**I want to** describe my problem in simple language  
**So that** the system can understand my situation

**Acceptance Criteria:**
- Text input accepts long descriptions
- No technical legal knowledge required
- Can write in Hindi or English
- Real-time character count
- Clear submit button

### US-2.2: AI Interpretation
**As a** user who submitted an incident  
**I want to** receive a simple explanation of my legal rights  
**So that** I understand what laws apply to my situation

**Acceptance Criteria:**
- Response is in simple, non-legal language
- Identifies specific BNS sections violated
- Explains what legal action can be taken
- Response time under 10 seconds
- Clear and empathetic tone

### US-2.3: Legal Section Display
**As a** user reviewing my case  
**I want to** see which specific laws were violated  
**So that** I understand the legal basis of my complaint

**Acceptance Criteria:**
- BNS sections displayed clearly
- Section numbers are accurate
- Brief description of each section
- Visual badges/tags for easy reading

## Epic 3: Document Generation

### US-3.1: Generate Legal Draft
**As a** user who wants to file a complaint  
**I want to** generate a formal legal document  
**So that** I can submit it to authorities

**Acceptance Criteria:**
- Document is in proper legal format
- Includes all required sections
- Cites specific BNS laws
- Uses formal legal language
- Includes user's verified details

### US-3.2: PDF Download
**As a** user with a generated draft  
**I want to** download it as a PDF  
**So that** I can print or email it to authorities

**Acceptance Criteria:**
- PDF is professionally formatted
- All text is readable
- Proper headers and footers
- Signature space included
- Download works on all browsers

### US-3.3: Document Preview
**As a** user before downloading  
**I want to** preview the document  
**So that** I can verify it's correct

**Acceptance Criteria:**
- Preview shows actual PDF content
- Can scroll through entire document
- Preview loads quickly
- Can edit incident if needed

## Epic 4: Case Management

### US-4.1: View All Cases
**As a** user with multiple cases  
**I want to** see all my cases in one place  
**So that** I can track their progress

**Acceptance Criteria:**
- Dashboard shows all cases
- Cases sorted by date (newest first)
- Status badge for each case
- Click to view details
- Empty state when no cases

### US-4.2: Case Details
**As a** user viewing a case  
**I want to** see all information about it  
**So that** I can track what's happened

**Acceptance Criteria:**
- Shows incident description
- Lists relevant laws
- Displays draft content
- Shows current status
- Timeline of actions

### US-4.3: Update Case Status
**As a** user who filed a complaint  
**I want to** update the case status  
**So that** the system knows what stage I'm at

**Acceptance Criteria:**
- Can mark as "Filed"
- Can mark as "Resolved"
- Status updates immediately
- Confirmation message shown
- Timeline updates automatically

## Epic 5: Automated Follow-ups

### US-5.1: Automatic Nudge Tracking
**As a** user who filed a complaint  
**I want to** the system to track if authorities respond  
**So that** I don't have to remember to follow up

**Acceptance Criteria:**
- System checks filed cases daily
- Identifies cases older than 7 days
- Automatically generates follow-up
- User sees nudge in timeline
- No manual action required

### US-5.2: Manual Nudge Trigger
**As a** user with a pending case  
**I want to** manually send a follow-up  
**So that** I can escalate immediately if needed

**Acceptance Criteria:**
- "Send Nudge" button visible
- Confirmation before sending
- Success/failure message
- Nudge timestamp recorded
- Can't spam (rate limited)

### US-5.3: Nudge History
**As a** user tracking a case  
**I want to** see all follow-ups sent  
**So that** I know what actions have been taken

**Acceptance Criteria:**
- Timeline shows all nudges
- Dates and times displayed
- Can see nudge content
- Visual indicators for each action

## Epic 6: User Experience

### US-6.1: Responsive Design
**As a** mobile user  
**I want to** use the app on my phone  
**So that** I can access it anywhere

**Acceptance Criteria:**
- Works on phones, tablets, desktops
- Touch-friendly buttons
- Readable text on small screens
- No horizontal scrolling
- Fast loading on mobile networks

### US-6.2: Loading States
**As a** user waiting for AI response  
**I want to** see that something is happening  
**So that** I know the system is working

**Acceptance Criteria:**
- Loading spinner during AI calls
- Progress indicators
- Skeleton screens for data loading
- No blank screens
- Estimated time shown

### US-6.3: Error Handling
**As a** user when something goes wrong  
**I want to** see a clear error message  
**So that** I know what to do next

**Acceptance Criteria:**
- Friendly error messages
- No technical jargon
- Suggests next steps
- Retry option when applicable
- Errors don't crash the app

## Epic 7: Security & Privacy

### US-7.1: Data Privacy
**As a** user sharing sensitive information  
**I want to** my data to be secure  
**So that** my privacy is protected

**Acceptance Criteria:**
- Data encrypted in transit
- Row Level Security enabled
- Can only see own cases
- No PII in logs
- Secure password requirements

### US-7.2: Session Security
**As a** user concerned about security  
**I want to** my session to be protected  
**So that** others can't access my account

**Acceptance Criteria:**
- JWT tokens used
- Tokens expire appropriately
- Logout clears session
- Protected routes require auth
- No token in URL

## Success Metrics

- User can create account in under 2 minutes
- Incident interpretation completes in under 10 seconds
- PDF generation completes in under 5 seconds
- 95% of users successfully complete first case
- Mobile users have same experience as desktop
- Zero security vulnerabilities in auth flow
