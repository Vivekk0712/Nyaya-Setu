# Emoty UI Analysis - Nyaya-Setu Design

## Overview
The emoty folder contains a modern, polished TypeScript React application with a clean legal tech UI design. It uses:
- React + TypeScript + Vite
- TailwindCSS with custom theme
- shadcn/ui components
- React Router for navigation
- React Query for data management

## Key Design Features

### 1. Color Scheme
- Primary: Deep blue (#1e3a8a) - professional legal theme
- Success: Green for verified/completed states
- Amber: For active/pending states
- Clean white cards with subtle borders
- Light gray backgrounds

### 2. Layout Structure
- **Navbar**: Sticky top navigation with tabs, language switcher (EN/हिंदी), DigiLocker connection
- **Responsive**: Desktop split-view, mobile tabbed interface
- **Modern spacing**: Generous padding, rounded corners (0.75rem radius)

### 3. Pages

#### Dashboard (`/`)
- Welcome header with user name
- 4 stat cards (Total Cases, Active, Resolved, Nudges)
- Alert banner for pending actions
- DigiLocker verification status
- Recent cases list with status badges

#### New Case (`/case`) - Main Workspace
- **Desktop**: Split view with Chat (420px fixed) + Document panels
- **Mobile**: Tabbed interface switching between Chat/Document
- **Tracker**: Dropdown panel showing case progress (4 steps)
- Real-time AI chat interface
- Document preview with FIR draft

#### Case History (`/cases`)
- Search bar + filter buttons (All/Active/Resolved)
- Case cards with metadata
- Status badges with icons

#### Settings (`/settings`)
- Profile card with edit button
- DigiLocker connection status
- Language preference buttons
- Notification toggles
- Danger zone for account deletion

#### Help (`/help`)
- Quick resource cards
- FAQ accordion
- Contact information

### 4. Components

#### ChatPanel
- Bot/User message bubbles
- Avatar icons (Bot/User)
- Voice input button (Mic icon)
- Send button
- Smooth animations

#### DocumentPanel
- Formal FIR document preview
- Serif font for legal document
- Download PDF + e-Sign buttons

#### TrackerPanel
- 4-step progress tracker
- Timeline with connecting lines
- Status icons (CheckCircle, Clock, Bell, Circle)
- Color-coded states (done=green, active=blue, pending=gray)

#### Navbar
- Logo with Scale icon
- Tab navigation
- Language toggle (EN/हिंदी)
- DigiLocker connection button/status

### 5. UI Patterns
- **Status Badges**: Rounded pills with icons
- **Cards**: White background, border, rounded-xl, shadow on hover
- **Buttons**: Primary (blue), Outline, Ghost variants
- **Icons**: Lucide React icons throughout
- **Animations**: Fade-in, pulse-gentle for CTAs
- **Typography**: Inter font, clear hierarchy

### 6. Key Interactions
- Tracker toggle (desktop: dropdown, mobile: slide-down)
- Tab switching on mobile
- Language switcher
- DigiLocker connection flow
- Search and filter

## Technical Stack
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.1.3",
  "@tanstack/react-query": "^5.62.11",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.468.0",
  "shadcn/ui": "components"
}
```

## Next Steps
Update our frontend (`frontend/src/`) to match this design:
1. Install dependencies (React Router, React Query, Lucide icons)
2. Update TailwindCSS config with custom theme
3. Create new page components
4. Update App.jsx with routing
5. Integrate with existing backend API
6. Maintain authentication flow
